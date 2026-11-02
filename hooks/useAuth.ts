import { useState, useCallback, useEffect } from 'react';
import Parse from 'parse';
import * as ParseService from '../services/parseService';
import { UserRole, Student, Professor, Team } from '../types';

export interface UseAuthReturn {
  isAuthenticated: boolean;
  userRole: UserRole;
  currentUserId: string | null;
  currentUserEmail: string | null;
  isLoadingAuth: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setUserRole: React.Dispatch<React.SetStateAction<UserRole>>;
  setCurrentUserId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsLoadingAuth: React.Dispatch<React.SetStateAction<boolean>>;
  login: (email: string, pass: string) => Promise<Parse.User>;
  register: (name: string, email: string, pass: string) => Promise<Parse.User>;
  logout: () => Promise<void>;
  resolveRole: (
    email: string,
    explicitRole?: string,
    team?: Team,
    professors?: Professor[],
    students?: Student[]
  ) => { role: UserRole; student?: Student };
}

export const useAuth = (): UseAuthReturn => {
  // Por padrão, o sistema opera de forma livre/direta (sem tela de login bloqueando)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);

  // Sincroniza estado de autenticação a partir de Parse.User.current() caso exista sessão ativa
  useEffect(() => {
    const user = ParseService.getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
      const email = user.get('email') || user.get('username') || '';
      setCurrentUserEmail(email);
      let role = user.get('role') as UserRole;
      if (!role) role = 'admin';
      setUserRole(role);
      setCurrentUserId(user.id);
    } else {
      // Sem usuário logado: mantém acesso direto como admin sem barreira de login
      setIsAuthenticated(true);
      setUserRole('admin');
      setCurrentUserId(null);
      setCurrentUserEmail(null);
    }
  }, []);

  /**
   * Resolução defensiva de papéis
   */
  const resolveRole = useCallback(
    (
      email: string,
      explicitRole?: string,
      team?: Team,
      professors: Professor[] = [],
      students: Student[] = []
    ): { role: UserRole; student?: Student } => {
      const normalizedEmail = email.trim().toLowerCase();

      if (explicitRole === 'admin') {
        return { role: 'admin' };
      }
      if (explicitRole === 'professor') {
        return { role: 'professor' };
      }

      // 1. Aluno cadastrado
      const studentFound = students.find(s => s.email.toLowerCase() === normalizedEmail);
      if (studentFound) {
        return { role: 'student', student: studentFound };
      }

      // 2. Admin registrado na equipe
      if (team?.adminEmail && team.adminEmail.trim().toLowerCase() === normalizedEmail) {
        return { role: 'admin' };
      }

      // 3. Professor registrado
      if (professors.some(p => p.email.trim().toLowerCase() === normalizedEmail)) {
        return { role: 'professor' };
      }

      // Padrão: Admin
      return { role: 'admin' };
    },
    []
  );

  const login = useCallback(async (email: string, pass: string): Promise<Parse.User> => {
    setIsLoadingAuth(true);
    try {
      const user = await ParseService.performCustomLogin(email, pass);
      setIsAuthenticated(true);
      const userEmail = user.get('email') || user.get('username') || email;
      setCurrentUserEmail(userEmail);
      let role = user.get('role') as UserRole;
      if (!role) role = 'admin';
      setUserRole(role);
      setCurrentUserId(user.id);
      return user;
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, pass: string): Promise<Parse.User> => {
    setIsLoadingAuth(true);
    try {
      const user = await ParseService.registerUser(name, email, pass);
      setIsAuthenticated(true);
      setUserRole('student');
      setCurrentUserId(user.id);
      setCurrentUserEmail(email);
      return user;
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await ParseService.logoutUser();
    setIsAuthenticated(true);
    setUserRole('admin');
    setCurrentUserId(null);
    setCurrentUserEmail(null);
  }, []);

  return {
    isAuthenticated,
    userRole,
    currentUserId,
    currentUserEmail,
    isLoadingAuth,
    setIsAuthenticated,
    setUserRole,
    setCurrentUserId,
    setIsLoadingAuth,
    login,
    register,
    logout,
    resolveRole,
  };
};
