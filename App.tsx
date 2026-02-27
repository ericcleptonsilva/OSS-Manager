
import React, { useState, useEffect } from 'react';
import { INITIAL_DATA, BELT_STYLES, BELT_GROUPS, WEEKDAYS, JIU_JITSU_TECHNIQUES } from './constants';
import { Academy, AppData, Student, BeltColor, Team, TrainingSession, TrainingMedia, AcademySchedule, TimeRange, FinancialTransaction, FinancialType } from './types';
import { IconAcademy, IconUsers, IconPlus, IconSparkles, IconBack, IconClock, IconEdit, IconTrash, IconSettings, IconCamera, IconClipboard, IconHistory, IconCalendar, IconCheck, IconMoney, IconWallet, IconAlert, IconLogout, IconMail, IconLock } from './components/icons';
import { Modal } from './components/Modal';
import { generateTeamAnalysis } from './services/geminiService';
import * as ParseService from './services/parseService';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useTheme } from './contexts/ThemeContext';

interface SessionPreferences {
  lastAcademyId?: string | null;
}

type UserRole = 'admin' | 'student' | 'professor';

const App = () => {
  // --- State ---
  
  // 0. Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isPublicDataLoaded, setIsPublicDataLoaded] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 1. Data State
  const [data, setData] = useState<AppData>(INITIAL_DATA);

  const { darkMode, toggleDarkMode } = useTheme();

  // 2. Session Preferences State (Persisted)
  const [sessionPrefs, setSessionPrefs] = useState<SessionPreferences>(() => {
    const saved = localStorage.getItem('oss_manager_ui_prefs');
    return saved ? { lastAcademyId: JSON.parse(saved).lastAcademyId } : { lastAcademyId: null };
  });

  // 3. Navigation/Session State
  const [selectedAcademyId, setSelectedAcademyId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [activeAcademyTab, setActiveAcademyTab] = useState<'students' | 'trainings' | 'financial'>('students');
  const [loginTargetAcademyId, setLoginTargetAcademyId] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // 4. Notification State
  const [notification, setNotification] = useState<string | null>(null);
  
  // Form States
  const [isAcademyModalOpen, setIsAcademyModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isDeleteStudentModalOpen, setIsDeleteStudentModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isDeleteTrainingModalOpen, setIsDeleteTrainingModalOpen] = useState(false);
  const [trainingToDelete, setTrainingToDelete] = useState<string | null>(null);

  // Financial States
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<FinancialTransaction>>({ type: FinancialType.MONTHLY, amount: 0 });
  const [recurrenceCount, setRecurrenceCount] = useState<number>(1); // New state for monthly recurrence

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // Temp Form Data
  const [newAcademy, setNewAcademy] = useState<Partial<Academy>>({});
  const [newStudent, setNewStudent] = useState<Partial<Student>>({ belt: BeltColor.WHITE, degrees: 0 });
  const [newTeam, setNewTeam] = useState<Partial<Team>>({});
  const [newTraining, setNewTraining] = useState<Partial<TrainingSession>>({ techniques: [], studentIds: [], media: [] });
  
  // Helper state for adding multiple techniques
  const [currentTechniqueToAdd, setCurrentTechniqueToAdd] = useState<string>(JIU_JITSU_TECHNIQUES[0]);

  // --- Effects ---

  // Initialize Parse
  useEffect(() => {
    ParseService.initializeParse();

    // Load public data immediately
    ParseService.fetchPublicData().then(publicData => {
        setData(prev => ({
            ...prev,
            team: publicData.team,
            academies: publicData.academies
        }));
        setIsPublicDataLoaded(true);
    });

    const currentUser = ParseService.getCurrentUser();
    if (currentUser) {
      setIsAuthenticated(true);
      const email = currentUser.get('email') || '';
      // Parse User standard is usually admin or we need to fetch role from it if we extend it.
      // For now, assume Parse User implies Admin unless we store role in DB for standard users too.
      // But in our custom flow, we use 'role' on the object.
      let role = currentUser.get('role') as UserRole;
      if (!role) {
          // Default to Admin for standard Parse Users (Owners) if no role is explicitly set
          role = 'admin';
      }
      checkUserRoleAndLoadData(email, role);
    } else {
        // Check local custom session
        const storedSession = localStorage.getItem('oss_custom_session');
        if (storedSession) {
            const session = JSON.parse(storedSession);
            setIsAuthenticated(true);
            checkUserRoleAndLoadData(session.email, session.role);
        }
    }
  }, []);

  // Fetch Data when Authenticated
  const refreshData = async () => {
    if (!isAuthenticated) return;
    setIsLoadingData(true);
    const cloudData = await ParseService.fetchFullData();
    setData(cloudData);
    setIsLoadingData(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  // Persist Session Preferences
  useEffect(() => {
    localStorage.setItem('oss_manager_ui_prefs', JSON.stringify(sessionPrefs));
  }, [sessionPrefs]);

  // Update Document Title & Favicon based on Team Settings
  useEffect(() => {
    if (data.team.name) {
      document.title = data.team.name;
    }
    if (data.team.logo) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = data.team.logo;
    }
  }, [data.team]);

  // Restore Session (Last Academy) on Mount
  useEffect(() => {
    // If admin, restore last academy
    if (isAuthenticated && userRole === 'admin' && sessionPrefs.lastAcademyId && !selectedAcademyId && !isLoadingData) {
       const exists = data.academies.find(a => a.id === sessionPrefs.lastAcademyId);
       if (exists) {
         setSelectedAcademyId(sessionPrefs.lastAcademyId);
       }
    }
    // If student, force navigation to their profile
    if (isAuthenticated && userRole === 'student' && currentUserId && !isLoadingData) {
        const student = data.students.find(s => s.id === currentUserId);
        if (student) {
            setSelectedAcademyId(student.academyId);
            setSelectedStudentId(student.id);
        }
    }
  }, [isAuthenticated, userRole, currentUserId, isLoadingData, data]); 

  // --- Actions ---

  const checkUserRoleAndLoadData = async (email: string, explicitRole?: UserRole) => {
      setIsAuthenticated(true);
      
      const fetchedData = await ParseService.fetchFullData();
      setData(fetchedData);

      // 1. Try to find if it is a student
      const studentFound = fetchedData.students.find(s => s.email.toLowerCase() === email.toLowerCase());

      if (studentFound && (!explicitRole || explicitRole === 'student')) {
          setUserRole('student');
          setCurrentUserId(studentFound.id);
          setSelectedAcademyId(studentFound.academyId);
          setSelectedStudentId(studentFound.id);
          showNotification(`Bem-vindo, ${studentFound.name.split(' ')[0]}!`);
      } else {
          // 2. Not a student, check explicit role
          if (explicitRole) {
              setUserRole(explicitRole);
          } else {
              // Fallback default
              setUserRole('admin');
          }
          setCurrentUserId(null);
          
          if (explicitRole === 'professor') {
                showNotification(`Bem-vindo, Professor!`);
          } else {
                showNotification(`Bem-vindo, Admin!`);
          }
      }
      return fetchedData;
  };

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      
      try {
        // Fluxo de Login Customizado (Parse User OU Team Admin OU Academy Professor)
        const user = await ParseService.performCustomLogin(loginEmail, loginPassword);

        let role = user.get('role') as UserRole;
        if (!role) {
             // If no role field (Standard Parse User), assume Admin
             role = 'admin';
        }

        // Persist session locally for non-Parse users (Mock users)
        if (!user.getSessionToken()) {
            localStorage.setItem('oss_custom_session', JSON.stringify({
                email: user.get('email'),
                role: role,
                userId: user.id
            }));
        }

        const freshData = await checkUserRoleAndLoadData(loginEmail, role);
        setIsLoginModalOpen(false);

        if (loginTargetAcademyId) {
            // Use freshData to check permissions, as state update might not be immediate or we want to be sure
            const targetAcademy = freshData.academies.find(a => a.id === loginTargetAcademyId);
            // Check Access after login
            if (targetAcademy && targetAcademy.allowedEmails && targetAcademy.allowedEmails.length > 0) {
                // Normalize emails
                const normalizedAllowed = targetAcademy.allowedEmails.map(e => e.trim().toLowerCase());
                const normalizedLogin = loginEmail.trim().toLowerCase();

                if (!normalizedAllowed.includes(normalizedLogin)) {
                    alert("Acesso Negado: Seu email não tem permissão para gerenciar esta academia.");
                    setLoginTargetAcademyId(null);
                    return;
                }
            }

            setSelectedAcademyId(loginTargetAcademyId);
            setLoginTargetAcademyId(null);
        }
      } catch (error: any) {
        console.error(error);
        if (error.code === 101) {
            alert("Email ou senha inválidos.");
        } else {
            alert("Erro na autenticação. Verifique sua conexão.");
        }
      }
  };

  const handleLogout = async () => {
      await ParseService.logoutUser();
      localStorage.removeItem('oss_custom_session'); // Clear custom session
      setIsAuthenticated(false);
      setUserRole('admin');
      setCurrentUserId(null);
      setSelectedAcademyId(null);
      setSelectedStudentId(null);
      setLoginEmail('');
      setLoginPassword('');
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // toggleDarkMode is imported from useTheme

  // --- Backup & Restore Logic ---
  const handleExportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `backup_oss_manager_${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showNotification('Backup baixado com sucesso!');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Currently only local import logic
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content === 'string') {
          const parsedData = JSON.parse(content);
          if (parsedData.team && Array.isArray(parsedData.academies) && Array.isArray(parsedData.students)) {
            setData(parsedData);
            setIsTeamModalOpen(false);
            showNotification('Dados importados localmente (não salvos no Back4App automaticamente)!');
          } else {
            alert('Arquivo de backup inválido.');
          }
        }
      } catch (error) {
        console.error("Erro ao importar:", error);
        alert('Erro ao ler o arquivo.');
      }
    };
    reader.readAsText(file);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'team' | 'team-banner' | 'academy' | 'training' | 'student') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (target === 'training') {
      const fileArray = Array.from(files);
      const promises = fileArray.map((file: File) => {
        return new Promise<TrainingMedia>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              type: file.type.startsWith('video') ? 'video' : 'image',
              data: reader.result as string
            });
          };
          reader.readAsDataURL(file);
        });
      });

      const results = await Promise.all(promises);
      setNewTraining(prev => ({
        ...prev,
        media: [...(prev.media || []), ...results]
      }));

    } else {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        if (target === 'team') {
          setNewTeam(prev => ({ ...prev, logo: result }));
        } else if (target === 'team-banner') {
            // Immediately save banner for team since it's an overlay edit
            const updatedTeam = { ...data.team, banner: result };
            try {
                await ParseService.saveTeam(updatedTeam);
                setData(prev => ({ ...prev, team: updatedTeam }));
                showNotification('Banner atualizado!');
            } catch(e) {
                alert("Erro ao salvar banner.");
            }
        } else if (target === 'academy') {
          setNewAcademy(prev => ({ ...prev, logo: result }));
        } else if (target === 'student') {
          setNewStudent(prev => ({ ...prev, photo: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setNewTraining(prev => ({
      ...prev,
      media: (prev.media || []).filter((_, i) => i !== index)
    }));
  };

  const handleEditTeam = () => {
    setNewTeam({ ...data.team });
    setIsTeamModalOpen(true);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name) return;

    try {
        const savedTeam = await ParseService.saveTeam(newTeam);
        setData(prev => ({
            ...prev,
            team: { ...prev.team, ...savedTeam }
        }));
        setIsTeamModalOpen(false);
        showNotification('Configurações da equipe salvas!');
    } catch (e) {
        console.error(e);
        alert("Erro ao salvar configurações da equipe.");
    }
  };

  const handleSaveAcademy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAcademy.name || !newAcademy.instructorName) return;

    try {
        await ParseService.saveAcademy(newAcademy);
        await refreshData();
        setNewAcademy({});
        setIsAcademyModalOpen(false);
        showNotification('Academia salva com sucesso!');
    } catch (e) {
        alert("Erro ao salvar academia no Back4App.");
        console.error(e);
    }
  };

  const handleEditAcademy = (academy: Academy) => {
    setNewAcademy({ ...academy, schedule: academy.schedule || [] });
    setIsAcademyModalOpen(true);
  };

  const handleDeleteAcademy = async () => {
    if (!selectedAcademyId) return;
    try {
        await ParseService.deleteObject('Academy', selectedAcademyId);
        await refreshData();
        setSelectedAcademyId(null);
        setSessionPrefs(prev => ({ ...prev, lastAcademyId: null }));
        setIsDeleteModalOpen(false);
        showNotification('Academia removida.');
    } catch (e) {
        alert("Erro ao remover academia.");
    }
  };

  const handleOpenNewAcademyModal = () => {
    setNewAcademy({ schedule: [] });
    setIsAcademyModalOpen(true);
  };

  const handleSelectAcademy = (id: string) => {
      setSelectedAcademyId(id);
      setSessionPrefs(prev => ({ ...prev, lastAcademyId: id }));
      setAiAnalysis(null);
      setActiveAcademyTab('students');
  }

  const handleBackToAcademies = () => {
      setSelectedAcademyId(null);
      setSessionPrefs(prev => ({ ...prev, lastAcademyId: null }));
  }

  const handlePublicAcademyClick = (academyId: string) => {
      const targetAcademy = data.academies.find(a => a.id === academyId);
      if (!targetAcademy) return;

      if (isAuthenticated) {
          // If admin, always allow
          if (userRole === 'admin') {
              handleSelectAcademy(academyId);
              return;
          }

          // If student, check if it is THEIR academy
          if (userRole === 'student') {
              if (selectedAcademyId === academyId) {
                  // Already there or allowed
                  handleSelectAcademy(academyId);
              } else {
                   alert("Você só tem acesso à sua academia.");
              }
              return;
          }

          // If professor, check allowedEmails
          // Note: We need the email from session or state.
          // We can use loginEmail state if it persists, or better, get from LocalStorage or Parse User
          const currentUser = ParseService.getCurrentUser();
          let currentUserEmail = currentUser?.get('email');

          if (!currentUserEmail) {
             const stored = localStorage.getItem('oss_custom_session');
             if (stored) {
                 currentUserEmail = JSON.parse(stored).email;
             }
          }

          if (targetAcademy.allowedEmails && targetAcademy.allowedEmails.length > 0) {
              // Normalize emails for case-insensitive comparison (Trimmed & Lowercase)
              const normalizedAllowed = targetAcademy.allowedEmails.map(e => e.trim().toLowerCase());
              const normalizedCurrent = currentUserEmail ? currentUserEmail.trim().toLowerCase() : '';

              if (!normalizedCurrent || !normalizedAllowed.includes(normalizedCurrent)) {
                  // If denied, maybe they want to login as the professor for THIS academy?
                  // Prompt login
                  if (confirm("Você não tem permissão para esta academia com o usuário atual. Deseja fazer login com outra conta?")) {
                      setLoginTargetAcademyId(academyId);
                      setIsLoginModalOpen(true);
                  }
                  return;
              }
          }
          handleSelectAcademy(academyId);
      } else {
          setLoginTargetAcademyId(academyId);
          setIsLoginModalOpen(true);
      }
  };

  const handleScheduleChange = (day: string, action: 'toggleDay' | 'addRange' | 'removeRange' | 'updateRange', payload?: any) => {
    const currentSchedule = newAcademy.schedule || [];
    const existingDaySchedule = currentSchedule.find(s => s.day === day);

    if (action === 'toggleDay') {
      if (existingDaySchedule) {
        setNewAcademy({ ...newAcademy, schedule: currentSchedule.filter(s => s.day !== day) });
      } else {
        setNewAcademy({ 
          ...newAcademy, 
          schedule: [...currentSchedule, { day, timeRanges: [{ openTime: '08:00', closeTime: '22:00' }] }] 
        });
      }
    } 
    else if (action === 'addRange') {
      if (!existingDaySchedule) return;
      const updatedDay = {
        ...existingDaySchedule,
        timeRanges: [...existingDaySchedule.timeRanges, { openTime: '08:00', closeTime: '12:00' }]
      };
      setNewAcademy({ ...newAcademy, schedule: currentSchedule.map(s => s.day === day ? updatedDay : s) });
    }
    else if (action === 'removeRange') {
      if (!existingDaySchedule || payload === undefined) return;
      const indexToRemove = payload as number;
      const updatedRanges = existingDaySchedule.timeRanges.filter((_, i) => i !== indexToRemove);
      
      if (updatedRanges.length === 0) {
        setNewAcademy({ ...newAcademy, schedule: currentSchedule.filter(s => s.day !== day) });
      } else {
        const updatedDay = { ...existingDaySchedule, timeRanges: updatedRanges };
        setNewAcademy({ ...newAcademy, schedule: currentSchedule.map(s => s.day === day ? updatedDay : s) });
      }
    }
    else if (action === 'updateRange') {
      if (!existingDaySchedule || !payload) return;
      const { index, field, value } = payload;
      const updatedRanges = existingDaySchedule.timeRanges.map((range, i) => {
        if (i === index) {
          return { ...range, [field]: value };
        }
        return range;
      });
      const updatedDay = { ...existingDaySchedule, timeRanges: updatedRanges };
      setNewAcademy({ ...newAcademy, schedule: currentSchedule.map(s => s.day === day ? updatedDay : s) });
    }
  };
  
  const getScheduleForDay = (day: string) => {
      return (newAcademy.schedule || []).find(s => s.day === day);
  }

  const handleOpenNewStudentModal = () => {
    setNewStudent({ belt: BeltColor.WHITE, degrees: 0, photo: '' });
    setIsStudentModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setNewStudent({ ...student });
    setIsStudentModalOpen(true);
  };

  const handleConfirmDeleteStudent = (studentId: string) => {
      setStudentToDelete(studentId);
      setIsDeleteStudentModalOpen(true);
  };

  const handleDeleteStudent = async () => {
      if (!studentToDelete) return;
      try {
          // 1. Delete student financials first
          await ParseService.deleteAllTransactionsForStudent(studentToDelete);
          // 2. Delete student object
          await ParseService.deleteObject('Student', studentToDelete);
          
          await refreshData();
          setStudentToDelete(null);
          setIsDeleteStudentModalOpen(false);
          showNotification('Aluno excluído com sucesso.');
      } catch(e) {
          console.error(e);
          alert("Erro ao excluir aluno.");
      }
  };

  const handleUpdateStudentDegree = async (studentId: string, degree: number) => {
      if (userRole !== 'admin') return;
      const student = data.students.find(s => s.id === studentId);
      if(!student) return;

      const newDegree = student.degrees === degree ? degree - 1 : degree;
      const finalDegree = newDegree < 0 ? 0 : newDegree;

      try {
          // Reset stars if we are changing degree (optional logic, but makes sense for "evolution")
          await ParseService.saveStudent({ id: studentId, degrees: finalDegree, progressStars: 0 });
          setData(prev => ({
            ...prev,
            students: prev.students.map(s => s.id === studentId ? { ...s, degrees: finalDegree, progressStars: 0 } : s)
          }));
      } catch (e) {
          console.error("Erro ao atualizar grau", e);
      }
  };

  const handleUpdateStudentProgress = async (studentId: string, stars: number) => {
      if (userRole !== 'admin' && userRole !== 'professor') return;
      try {
          await ParseService.saveStudent({ id: studentId, progressStars: stars });
          setData(prev => ({
              ...prev,
              students: prev.students.map(s => s.id === studentId ? { ...s, progressStars: stars } : s)
          }));
      } catch (e) {
          console.error("Erro ao atualizar progresso", e);
      }
  };

  const calculateAge = (birthDateString?: string) => {
    if (!birthDateString) return 0;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use the academyId from the form if provided (migration), otherwise use the currently selected academy context
    const targetAcademyId = newStudent.academyId || selectedAcademyId;

    if (!newStudent.name || !targetAcademyId) return;
    try {
        const studentToSave = { ...newStudent, academyId: targetAcademyId };
        await ParseService.saveStudent(studentToSave);
        await refreshData();
        setNewStudent({ belt: BeltColor.WHITE, degrees: 0 });
        setIsStudentModalOpen(false);
        showNotification('Aluno salvo com sucesso!');
    } catch (e) {
        alert("Erro ao salvar aluno.");
        console.error(e);
    }
  };

  const handleOpenStudentProfile = (studentId: string) => {
      setSelectedStudentId(studentId);
  };

  const handleOpenNewTrainingModal = () => {
    setNewTraining({ 
        date: new Date().toISOString().split('T')[0],
        techniques: [],
        duration: '01:00',
        studentIds: [],
        media: []
    });
    setCurrentTechniqueToAdd(JIU_JITSU_TECHNIQUES[0]);
    setIsTrainingModalOpen(true);
  };

  const handleEditTraining = (training: TrainingSession) => {
      setNewTraining({ ...training, media: training.media || [] });
      setCurrentTechniqueToAdd(JIU_JITSU_TECHNIQUES[0]);
      setIsTrainingModalOpen(true);
  };

  const handleConfirmDeleteTraining = (trainingId: string) => {
      setTrainingToDelete(trainingId);
      setIsDeleteTrainingModalOpen(true);
  };

  const handleDeleteTraining = async () => {
      if (!selectedAcademyId || !trainingToDelete) return;
      try {
          await ParseService.deleteObject('TrainingSession', trainingToDelete);
          await refreshData();
          setIsDeleteTrainingModalOpen(false);
          setTrainingToDelete(null);
          showNotification("Treino excluído.");
      } catch (e) {
          alert("Erro ao excluir treino.");
      }
  };

  const handleAddTechnique = () => {
      if (!currentTechniqueToAdd) return;
      const currentTechniques = newTraining.techniques || [];
      if (!currentTechniques.includes(currentTechniqueToAdd)) {
          setNewTraining({ ...newTraining, techniques: [...currentTechniques, currentTechniqueToAdd] });
      }
  };

  const handleRemoveTechnique = (techToRemove: string) => {
      const currentTechniques = newTraining.techniques || [];
      setNewTraining({ ...newTraining, techniques: currentTechniques.filter(t => t !== techToRemove) });
  };

  const handleSaveTraining = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!selectedAcademyId) return;
      if(!newTraining.techniques || newTraining.techniques.length === 0) {
          alert("Adicione pelo menos uma técnica ao treino.");
          return;
      }
      try {
          await ParseService.saveTraining(newTraining, selectedAcademyId);
          await refreshData();
          setIsTrainingModalOpen(false);
          showNotification('Treino registrado com sucesso!');
      } catch (e) {
          alert("Erro ao salvar treino.");
          console.error(e);
      }
  };

  const handleOpenTransactionModal = () => {
    setNewTransaction({
      type: FinancialType.MONTHLY,
      amount: 150.00,
      dueDate: new Date().toISOString().split('T')[0],
      paidDate: null,
      description: ''
    });
    setRecurrenceCount(1);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (transaction: FinancialTransaction) => {
    setNewTransaction({
      id: transaction.id,
      studentId: transaction.studentId,
      type: transaction.type,
      amount: transaction.amount,
      dueDate: transaction.dueDate,
      paidDate: transaction.paidDate,
      description: transaction.description
    });
    setRecurrenceCount(1); // Reset default
    setIsTransactionModalOpen(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAcademyId || !newTransaction.studentId || !newTransaction.amount) return;
    
    try {
        // Se já tem ID e não é temporário (começa com fin- no mock local, mas no parse é alfanumérico)
        // No Back4App o ID é sempre gerado pelo servidor, então verificamos se existe
        const isEditing = newTransaction.id && !newTransaction.id.startsWith('fin-');

        if (isEditing) {
            // Edição: Atualiza apenas o registro existente
            await ParseService.saveTransaction(newTransaction);
            showNotification('Cobrança atualizada com sucesso!');
        } else {
            // Criação: Pode gerar recorrência
            const baseDate = new Date(newTransaction.dueDate || new Date().toISOString());
            for(let i = 0; i < recurrenceCount; i++) {
                const nextDueDate = new Date(baseDate);
                nextDueDate.setMonth(baseDate.getMonth() + i);
                const isoDate = nextDueDate.toISOString().split('T')[0];
                let description = newTransaction.description || '';
                if (recurrenceCount > 1) {
                    description = `${description} (${i + 1}/${recurrenceCount})`.trim();
                }
                const transaction = {
                    studentId: newTransaction.studentId,
                    type: newTransaction.type as FinancialType,
                    amount: Number(newTransaction.amount),
                    dueDate: isoDate,
                    paidDate: newTransaction.paidDate || null,
                    description: description
                };
                await ParseService.saveTransaction(transaction);
            }
            showNotification(recurrenceCount > 1 ? `${recurrenceCount} cobranças geradas!` : 'Cobrança registrada!');
        }
        
        await refreshData();
        setIsTransactionModalOpen(false);
    } catch(e) {
        alert("Erro ao salvar transação.");
        console.error(e);
    }
  };

  const handleMarkAsPaid = async (transactionId: string) => {
    try {
        await ParseService.saveTransaction({
            id: transactionId,
            paidDate: new Date().toISOString().split('T')[0]
        });
        await refreshData();
        showNotification('Pagamento confirmado!');
    } catch (e) {
        alert("Erro ao confirmar pagamento.");
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
     if (!window.confirm("Tem certeza que deseja excluir esta cobrança?")) return;
     try {
         await ParseService.deleteObject('FinancialTransaction', transactionId);
         await refreshData();
         showNotification('Cobrança excluída.');
     } catch (e) {
         alert("Erro ao excluir cobrança.");
     }
  };

  const handleClearStudentFinancials = async (studentId: string) => {
      if(!window.confirm("ATENÇÃO: Isso excluirá TODAS as transações financeiras deste aluno (histórico completo). Deseja continuar?")) return;
      try {
          await ParseService.deleteAllTransactionsForStudent(studentId);
          await refreshData();
          showNotification("Histórico financeiro limpo com sucesso.");
      } catch (e) {
          console.error(e);
          alert("Erro ao limpar financeiro.");
      }
  };

  const handleGenerateAiAnalysis = async () => {
    if (!selectedAcademyId) return;
    const academy = data.academies.find(a => a.id === selectedAcademyId);
    const students = data.students.filter(s => s.academyId === selectedAcademyId);
    if (!academy) return;
    setIsAiLoading(true);
    const analysis = await generateTeamAnalysis(academy, students);
    setAiAnalysis(analysis || "Não foi possível gerar análise.");
    setIsAiLoading(false);
  };

  const calculateAbsences = (student: Student, academyTrainings: TrainingSession[]) => {
      const possibleTrainings = academyTrainings.filter(t => t.date >= student.startDate);
      const attendedCount = possibleTrainings.filter(t => t.studentIds.includes(student.id)).length;
      return Math.max(0, possibleTrainings.length - attendedCount);
  };

  const isOverdue = (transaction: FinancialTransaction) => {
    if (transaction.paidDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return transaction.dueDate < today;
  };

  const handleUnpublishMedia = async (trainingId: string, mediaIndex: number) => {
      if (!window.confirm("Remover esta foto da galeria pública?")) return;

      try {
          // Find the training session globally (or via backend)
          // Since we have data in memory, let's find it.
          // Ideally we query Parse, but here we iterate academies
          let targetAcademyId: string | null = null;
          let targetTraining: TrainingSession | null = null;

          for (const ac of data.academies) {
              const tr = ac.trainings?.find(t => t.id === trainingId);
              if (tr) {
                  targetAcademyId = ac.id;
                  targetTraining = tr;
                  break;
              }
          }

          if (targetAcademyId && targetTraining && targetTraining.media) {
              const updatedMedia = [...targetTraining.media];
              if (updatedMedia[mediaIndex]) {
                  updatedMedia[mediaIndex] = { ...updatedMedia[mediaIndex], isPublic: false };

                  // Save via Parse
                  await ParseService.saveTraining({ ...targetTraining, media: updatedMedia }, targetAcademyId);
                  await refreshData();
                  showNotification("Foto removida da galeria.");
              }
          }
      } catch (e) {
          console.error(e);
          alert("Erro ao remover foto.");
      }
  };

  // --- Computed Data ---
  const selectedAcademy = data.academies.find(a => a.id === selectedAcademyId);
  const selectedAcademyStudents = data.students.filter(s => s.academyId === selectedAcademyId);
  const selectedStudent = data.students.find(s => s.id === selectedStudentId);
  const studentTrainings = selectedStudent && selectedAcademy 
      ? (selectedAcademy.trainings || []).filter(t => t.studentIds.includes(selectedStudent.id))
      : [];

  const academyFinancials = selectedAcademy?.financials || [];
  const totalRevenue = academyFinancials.filter(f => f.paidDate).reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = academyFinancials.filter(f => !f.paidDate && !isOverdue(f)).reduce((acc, curr) => acc + curr.amount, 0);
  const totalOverdue = academyFinancials.filter(f => isOverdue(f)).reduce((acc, curr) => acc + curr.amount, 0);

  const studentFinancialCards = selectedAcademyStudents.map(student => {
     const studentTxs = academyFinancials.filter(t => t.studentId === student.id);
     const paidSum = studentTxs.filter(t => t.paidDate).reduce((acc, c) => acc + c.amount, 0);
     const overdueSum = studentTxs.filter(t => isOverdue(t)).reduce((acc, c) => acc + c.amount, 0);
     const pendingSum = studentTxs.filter(t => !t.paidDate && !isOverdue(t)).reduce((acc, c) => acc + c.amount, 0);
     const pendingTxs = studentTxs.filter(t => !t.paidDate).sort((a,b) => a.dueDate.localeCompare(b.dueDate));
     const nextPayment = pendingTxs.length > 0 ? pendingTxs[0] : null;
     const lastMonthly = studentTxs.filter(t => t.type === FinancialType.MONTHLY).sort((a,b) => b.dueDate.localeCompare(a.dueDate))[0];
     const monthlyAmount = lastMonthly ? lastMonthly.amount : 0;
     return { student, paidSum, overdueSum, pendingSum, nextPayment, monthlyAmount, transactions: studentTxs };
  });

  const beltDistribution = selectedAcademyStudents.reduce((acc, student) => {
    const found = acc.find(item => item.name === student.belt);
    if (found) { found.value++; } else { acc.push({ name: student.belt, value: 1 }); }
    return acc;
  }, [] as { name: string; value: number }[]);

  const attendanceByDay = selectedAcademy && selectedAcademy.schedule ? selectedAcademy.schedule.map(scheduleItem => {
      const trainingsOnDay = (selectedAcademy.trainings || []).filter(t => {
          const tDate = new Date(t.date + 'T12:00:00');
          return WEEKDAYS[tDate.getDay()] === scheduleItem.day;
      });
      const totalPresence = trainingsOnDay.reduce((acc, t) => acc + t.studentIds.length, 0);
      return {
          name: scheduleItem.day.split('-')[0].substring(0, 3),
          fullName: scheduleItem.day,
          count: totalPresence
      };
  }) : [];

  // --- Render ---

  // Initial Public Load Skeleton (Splash Screen)
  if (!isPublicDataLoaded) {
      return (
        <div className={`min-h-screen font-sans pb-20 ${darkMode ? 'bg-jiu-dark' : 'bg-gray-50'}`}>
            {/* Header Skeleton */}
            <div className="h-20 bg-gray-800 shadow-lg border-b border-gray-700 animate-pulse mb-8"></div>

            <main className="container mx-auto px-4 py-8">
                {/* Banner Skeleton - Increased Size as Requested */}
                <div className="w-full h-64 md:h-96 bg-gray-300 dark:bg-gray-800 rounded-2xl animate-pulse mb-8 flex items-center justify-center shadow-inner">
                    <div className="flex flex-col items-center">
                         <IconCamera className="w-20 h-20 text-gray-400 opacity-20 mb-4" />
                         <span className="text-gray-400 opacity-50 font-bold uppercase tracking-widest">Carregando Equipe...</span>
                    </div>
                </div>

                {/* Title Skeleton */}
                <div className="flex justify-between items-end mb-6">
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-gray-300 dark:bg-gray-800 rounded animate-pulse"></div>
                        <div className="h-4 w-64 bg-gray-300 dark:bg-gray-800 rounded animate-pulse"></div>
                    </div>
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-gray-300 dark:bg-gray-800 rounded-xl animate-pulse shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between">
                             <div className="flex justify-between mb-4">
                                 <div className="w-16 h-16 bg-gray-400 dark:bg-gray-700 rounded-lg"></div>
                                 <div className="w-20 h-6 bg-gray-400 dark:bg-gray-700 rounded"></div>
                             </div>
                             <div className="space-y-2">
                                 <div className="h-6 w-3/4 bg-gray-400 dark:bg-gray-700 rounded"></div>
                                 <div className="h-4 w-1/2 bg-gray-400 dark:bg-gray-700 rounded"></div>
                             </div>
                             <div className="mt-4 pt-4 border-t border-gray-400/10 flex justify-between">
                                 <div className="h-4 w-1/3 bg-gray-400 dark:bg-gray-700 rounded"></div>
                                 <div className="h-8 w-24 bg-gray-400 dark:bg-gray-700 rounded"></div>
                             </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
      );
  }

  if (isLoadingData) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
              <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jiu-primary mb-4"></div>
                  <p>Carregando dados da nuvem...</p>
              </div>
          </div>
      )
  }

  // APP LOGGED IN
  return (
    <div className={`min-h-screen font-sans pb-20 transition-colors duration-300 ${darkMode ? 'bg-jiu-dark text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* Header */}
      <header className="bg-jiu-secondary text-white shadow-lg sticky top-0 z-40 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => {
              if (userRole === 'admin') {
                  setSelectedStudentId(null);
                  handleBackToAcademies();
              }
          }}>
            <div className="w-12 h-12 bg-white rounded-full overflow-hidden flex items-center justify-center text-jiu-secondary font-bold text-xl border-2 border-gray-200">
              {data.team.logo ? (
                <img src={data.team.logo} alt="Team Logo" className="w-full h-full object-cover" />
              ) : (
                "OSS"
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">{data.team.name}</h1>
              <p className="text-xs text-gray-400">
                  {userRole === 'student' ? 'Portal do Aluno' : 'Sistema de Gestão'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
               <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-white/20"
               >
                 Área Restrita (Login)
               </button>
            ) : (
                <>
                    {/* Show Settings only for Admin */}
                    {!selectedAcademyId && isAuthenticated && userRole === 'admin' && (
                    <button
                        onClick={handleEditTeam}
                        className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                        title="Configurações da Equipe"
                    >
                        <IconSettings className="w-6 h-6" />
                    </button>
                    )}

                    {/* Admin/Professor Navigation */}
                    {selectedAcademyId && !selectedStudentId && (userRole === 'admin' || userRole === 'professor') && (
                    <button
                        onClick={handleBackToAcademies}
                        className="md:hidden text-gray-300 hover:text-white"
                    >
                        <IconBack className="w-6 h-6" />
                    </button>
                    )}

                    {/* Admin/Professor Student Detail Navigation */}
                    {selectedStudentId && (userRole === 'admin' || userRole === 'professor') && (
                        <button
                        onClick={() => setSelectedStudentId(null)}
                        className="md:hidden text-gray-300 hover:text-white"
                    >
                        <IconBack className="w-6 h-6" />
                    </button>
                    )}

                    <div className="h-6 w-px bg-gray-700 mx-1 hidden md:block"></div>

                    <button
                        onClick={handleLogout}
                        className="text-gray-300 hover:text-red-400 p-2 rounded-full hover:bg-white/5 transition-colors flex items-center gap-1"
                        title="Sair"
                    >
                        <IconLogout className="w-6 h-6" />
                        <span className="text-xs font-medium hidden md:block">Sair</span>
                    </button>
                </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        
        {/* View 1: Team Dashboard (List of Academies) - PUBLIC & ADMIN & PROFESSOR */}
        {/* Note: Student role is redirected to profile automatically, so they don't see this list normally, but we hide it just in case */}
        {!selectedAcademyId && !selectedStudentId && (userRole === 'admin' || userRole === 'professor' || !isAuthenticated) && (
          <div className="space-y-8 animate-fade-in">

            {/* --- TEAM BANNER --- */}
            <div className={`relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg mb-8 group bg-gray-200`}>
                {data.team.banner ? (
                    <img src={data.team.banner} alt="Team Banner" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                ) : (
                    <div className={`w-full h-full flex flex-col items-center justify-center ${darkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-200 text-gray-400'}`}>
                        <IconCamera className="w-16 h-16 opacity-50" />
                        <span className="text-sm font-bold uppercase tracking-widest mt-2 opacity-50">Banner da Equipe</span>
                    </div>
                )}

                {/* Admin Upload Overlay */}
                {isAuthenticated && userRole === 'admin' && (
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-300">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center text-white font-bold hover:bg-white/20 transition-colors">
                            <IconEdit className="w-5 h-5 mr-2" />
                            {data.team.banner ? "Alterar Banner" : "Adicionar Banner"}
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'team-banner')} />
                    </label>
                )}
            </div>

            <div className="flex justify-between items-end">
              <div>
                <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-jiu-primary'}`}>Academias</h2>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {isAuthenticated ? "Gerencie as unidades da sua equipe." : "Escolha sua unidade para acessar."}
                </p>
              </div>
              {isAuthenticated && userRole === 'admin' && (
                <button
                    onClick={handleOpenNewAcademyModal}
                    className="bg-jiu-accent hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center transition-all transform hover:scale-105"
                >
                    <IconPlus className="w-5 h-5 mr-2" />
                    Nova Academia
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.academies.map(academy => {
                const studentCount = data.students.filter(s => s.academyId === academy.id).length;
                return (
                  <div 
                    key={academy.id}
                    onClick={() => handlePublicAcademyClick(academy.id)}
                    className={`rounded-xl shadow-sm hover:shadow-xl border p-6 cursor-pointer transition-all duration-200 group relative overflow-hidden 
                      ${darkMode ? 'bg-jiu-surface border-gray-700' : 'bg-white border-gray-100'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className={`w-16 h-16 rounded-lg border flex items-center justify-center overflow-hidden group-hover:border-jiu-primary transition-colors
                        ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'}
                      `}>
                        {academy.logo ? (
                          <img src={academy.logo} alt={academy.name} className="w-full h-full object-cover" />
                        ) : (
                          <IconAcademy className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {studentCount} Alunos
                      </span>
                    </div>
                    <h3 className={`text-xl font-bold mb-1 relative z-10 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{academy.name}</h3>
                    <p className={`text-sm mb-2 relative z-10 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{academy.address}</p>

                    {/* Schedule on Card */}
                    {academy.schedule && academy.schedule.length > 0 && (
                        <div className={`text-xs mb-4 relative z-10 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <p className="font-semibold mb-1 flex items-center"><IconClock className="w-3 h-3 mr-1"/> Horários:</p>
                            {academy.schedule.map((s, idx) => (
                                <div key={idx} className="flex justify-between max-w-[200px]">
                                    <span className="font-medium">{s.day.substring(0, 3)}:</span>
                                    <span>
                                        {s.timeRanges.map(r => `${r.openTime}-${r.closeTime}`).join(', ')}
                                    </span>
                                </div>
                            )).slice(0, 3)}
                            {academy.schedule.length > 3 && <span className="italic opacity-70">...e mais</span>}
                        </div>
                    )}

                    <div className={`flex items-center justify-between text-sm border-t pt-4 relative z-10 ${darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-100'}`}>
                      <div>
                          <span className="font-medium mr-1">Instrutor:</span>
                          <span className="truncate max-w-[120px] inline-block align-bottom">{academy.instructorName}</span>
                      </div>

                      <button
                         onClick={(e) => {
                             e.stopPropagation();
                             handlePublicAcademyClick(academy.id);
                         }}
                         className={`ml-2 px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all transform hover:scale-105 ${
                             isAuthenticated
                             ? 'bg-jiu-primary text-white hover:bg-blue-800'
                             : 'bg-green-600 text-white hover:bg-green-700'
                         }`}
                      >
                         {isAuthenticated ? 'Acessar' : 'Login'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* --- PUBLIC GALLERY CAROUSEL --- */}
            <div className="mt-12">
                <h3 className={`text-xl font-bold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <IconCamera className="w-6 h-6 mr-2 text-jiu-primary" />
                    Galeria de Treinos
                </h3>

                {data.academies.flatMap(a => (a.trainings || []).map(t => ({ ...t, academyName: a.name })))
                    .flatMap(t => (t.media || []).map((m, idx) => ({ ...m, trainingId: t.id, trainingDate: t.date, academyName: t.academyName, originalIndex: idx })))
                    .filter(m => m.isPublic)
                    .length === 0 ? (
                        <div className={`p-8 rounded-xl border border-dashed text-center ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-white border-gray-300 text-gray-400'}`}>
                            Nenhuma foto publicada na galeria ainda.
                        </div>
                    ) : (
                        <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                            {data.academies.flatMap(a => (a.trainings || []).map(t => ({ ...t, academyName: a.name })))
                                .flatMap(t => (t.media || []).map((m, idx) => ({ ...m, trainingId: t.id, trainingDate: t.date, academyName: t.academyName, originalIndex: idx })))
                                .filter(m => m.isPublic)
                                .map((item, i) => (
                                    <div key={`${item.trainingId}-${i}`} className="min-w-[280px] md:min-w-[320px] snap-center rounded-xl overflow-hidden shadow-md relative group">
                                        {item.type === 'video' ? (
                                            <video src={item.data} className="w-full h-64 object-cover" controls />
                                        ) : (
                                            <img src={item.data} alt="Galeria" className="w-full h-64 object-cover" />
                                        )}

                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                                            <p className="font-bold text-sm truncate">{item.academyName}</p>
                                            <p className="text-xs opacity-80">{new Date(item.trainingDate).toLocaleDateString('pt-BR')}</p>
                                        </div>

                                        {isAuthenticated && userRole === 'admin' && (
                                            <button
                                                onClick={() => handleUnpublishMedia(item.trainingId, item.originalIndex)}
                                                className="absolute top-2 right-2 bg-red-600/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg"
                                                title="Remover da Galeria (Admin)"
                                            >
                                                <IconTrash className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
            </div>

          </div>
        )}

        {/* View 2: Academy Detail - ADMIN & PROFESSOR */}
        {selectedAcademy && !selectedStudentId && (userRole === 'admin' || userRole === 'professor') && (
          <div className="space-y-6 md:space-y-8 animate-fade-in">
            
            {/* Breadcrumb / Back */}
            <button 
              onClick={handleBackToAcademies}
              className="flex items-center text-gray-500 hover:text-jiu-primary transition-colors mb-4 text-sm"
            >
              <IconBack className="w-4 h-4 mr-1" /> Voltar para Academias
            </button>

            {/* Academy Header */}
            <div className={`rounded-2xl shadow-sm border p-4 md:p-8 relative overflow-hidden ${darkMode ? 'bg-jiu-surface border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-jiu-primary opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
              
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 flex-1">
                  
                  {/* Academy Logo Large */}
                  <div className={`w-20 h-20 md:w-32 md:h-32 rounded-xl border-2 shadow-md overflow-hidden flex-shrink-0 flex items-center justify-center self-center md:self-start
                    ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-white'}
                  `}>
                    {selectedAcademy.logo ? (
                      <img src={selectedAcademy.logo} alt={selectedAcademy.name} className="w-full h-full object-cover" />
                    ) : (
                      <IconAcademy className="w-10 h-10 md:w-12 md:h-12 text-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-2 mb-2">
                      <h2 className={`text-2xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAcademy.name}</h2>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditAcademy(selectedAcademy)}
                          className="text-gray-400 hover:text-jiu-primary transition-colors p-1 rounded-full hover:bg-gray-100 hover:bg-opacity-10"
                          title="Editar Informações da Academia"
                        >
                          <IconEdit className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        {userRole === 'admin' && (
                        <button 
                          onClick={() => setIsDeleteModalOpen(true)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50 hover:bg-opacity-10"
                          title="Excluir Academia"
                        >
                          <IconTrash className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        )}
                      </div>
                    </div>
                    
                    {selectedAcademy.description && (
                      <p className={`mb-4 italic max-w-2xl text-sm md:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        "{selectedAcademy.description}"
                      </p>
                    )}

                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 mt-4 text-sm md:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <p className="flex items-center justify-center md:justify-start">
                        <span className="font-semibold w-auto md:w-24 mr-2 md:mr-0">Instrutor:</span>
                        <span>{selectedAcademy.instructorName}</span>
                      </p>
                      <p className="flex items-center justify-center md:justify-start">
                        <span className="font-semibold w-auto md:w-24 mr-2 md:mr-0">Endereço:</span>
                        <span className="truncate max-w-[200px]">{selectedAcademy.address}</span>
                      </p>
                      
                      {/* Display Schedule */}
                      {(selectedAcademy.schedule && selectedAcademy.schedule.length > 0) && (
                        <div className={`col-span-1 md:col-span-2 mt-2 px-4 py-3 rounded-lg border text-left ${darkMode ? 'bg-indigo-900/30 border-indigo-800 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
                          <div className="flex items-start">
                              <IconClock className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="font-bold text-sm mb-2">Horários de Funcionamento</p>
                                <div className="grid grid-cols-1 gap-1 text-sm">
                                    {selectedAcademy.schedule.map((s, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row md:justify-between max-w-md border-b border-indigo-200/30 pb-1 last:border-0 last:pb-0">
                                            <span className="font-medium mr-4">{s.day}:</span>
                                            <div className="flex flex-col md:flex-row gap-x-4">
                                                {s.timeRanges.map((range, rIdx) => (
                                                    <span key={rIdx}>{range.openTime} às {range.closeTime}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                              </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0 self-center md:self-start lg:self-auto w-full sm:w-auto">
                   <button 
                    onClick={handleGenerateAiAnalysis}
                    disabled={isAiLoading}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-3 rounded-lg shadow-md flex items-center justify-center transition-all disabled:opacity-50"
                  >
                    {isAiLoading ? (
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    ) : (
                      <IconSparkles className="w-5 h-5 mr-2" />
                    )}
                    Análise IA
                  </button>
                </div>
              </div>

              {/* AI Analysis Section */}
              {aiAnalysis && (
                <div className={`mt-6 border rounded-xl p-6 animate-fade-in ${darkMode ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-100'}`}>
                  <h4 className="text-indigo-500 font-bold mb-2 flex items-center">
                    <IconSparkles className="w-4 h-4 mr-2" /> 
                    Insight do Coach Virtual
                  </h4>
                  <div className={`prose prose-sm max-w-none whitespace-pre-line ${darkMode ? 'text-indigo-200' : 'text-indigo-800'}`}>
                    {aiAnalysis}
                  </div>
                </div>
              )}
            </div>
            
            {/* Academy Navigation Tabs */}
            <div className={`flex border-b overflow-x-auto ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button 
                onClick={() => setActiveAcademyTab('students')}
                className={`px-6 py-3 font-medium text-sm flex items-center transition-colors whitespace-nowrap
                  ${activeAcademyTab === 'students' 
                    ? 'border-b-2 border-jiu-primary text-jiu-primary' 
                    : `text-gray-500 hover:text-gray-700 ${darkMode ? 'hover:text-gray-300' : ''}`}`}
              >
                <IconUsers className="w-5 h-5 mr-2" />
                Tatame (Alunos)
              </button>
              <button 
                 onClick={() => setActiveAcademyTab('trainings')}
                 className={`px-6 py-3 font-medium text-sm flex items-center transition-colors whitespace-nowrap
                  ${activeAcademyTab === 'trainings' 
                    ? 'border-b-2 border-jiu-primary text-jiu-primary' 
                    : `text-gray-500 hover:text-gray-700 ${darkMode ? 'hover:text-gray-300' : ''}`}`}
              >
                <IconClipboard className="w-5 h-5 mr-2" />
                Aulas / Treinos
              </button>
              <button 
                 onClick={() => setActiveAcademyTab('financial')}
                 className={`px-6 py-3 font-medium text-sm flex items-center transition-colors whitespace-nowrap
                  ${activeAcademyTab === 'financial' 
                    ? 'border-b-2 border-green-600 text-green-600' 
                    : `text-gray-500 hover:text-gray-700 ${darkMode ? 'hover:text-gray-300' : ''}`}`}
              >
                <IconMoney className="w-5 h-5 mr-2" />
                Financeiro
              </button>
            </div>

            {/* Tab Content */}
            {activeAcademyTab === 'students' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Student List (Cards Layout) */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* BOTÃO MATRICULAR ALUNO RESTAURADO */}
                        <div className="flex justify-end">
                            <button 
                                onClick={handleOpenNewStudentModal}
                                className="bg-jiu-secondary hover:bg-black text-white px-4 py-2 rounded-lg shadow flex items-center transition-all text-sm font-medium"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Matricular Aluno
                            </button>
                        </div>

                        {selectedAcademyStudents.length === 0 ? (
                        <div className={`rounded-xl border-2 border-dashed p-12 text-center ${darkMode ? 'bg-jiu-surface border-gray-700 text-gray-500' : 'bg-white border-gray-300 text-gray-400'}`}>
                            Nenhum aluno matriculado nesta academia ainda.
                        </div>
                        ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedAcademyStudents.map(student => {
                            const style = BELT_STYLES[student.belt] || BELT_STYLES[BeltColor.WHITE];
                            const absences = calculateAbsences(student, selectedAcademy.trainings || []);

                            // Check financial status
                            const studentFinancials = academyFinancials.filter(f => f.studentId === student.id);
                            const hasOverdue = studentFinancials.some(f => isOverdue(f));

                            return (
                                <div key={student.id} onClick={() => handleOpenStudentProfile(student.id)} className="flex rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-200 h-32 cursor-pointer group">
                                {/* Left: Photo/Belt (30%) */}
                                <div 
                                    className="w-[30%] flex items-center justify-center p-3 relative"
                                    style={{ 
                                    background: style.background, 
                                    color: style.color,
                                    }}
                                >
                                    {student.photo ? (
                                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md z-10 relative">
                                        <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                                      </div>
                                    ) : (
                                      <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center z-10 border-2 border-white/50">
                                        <span className="text-2xl font-bold opacity-50">{student.name.charAt(0)}</span>
                                      </div>
                                    )}
                                </div>

                                {/* Middle: Info (60%) */}
                                <div className="w-[60%] bg-neutral-900 text-white p-3 flex flex-col justify-between relative">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-base truncate group-hover:text-jiu-primary transition-colors pr-2" title={student.name}>{student.name}</h4>
                                            <div className="flex space-x-1">
                                              <button 
                                                  onClick={(e) => { e.stopPropagation(); handleEditStudent(student); }}
                                                  className="text-gray-500 hover:text-white transition-colors p-1 rounded-full"
                                                  title="Editar Aluno"
                                              >
                                                  <IconEdit className="w-3 h-3" />
                                              </button>
                                              <button 
                                                  onClick={(e) => { e.stopPropagation(); handleConfirmDeleteStudent(student.id); }}
                                                  className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full"
                                                  title="Excluir Aluno"
                                              >
                                                  <IconTrash className="w-3 h-3" />
                                              </button>
                                            </div>
                                        </div>
                                        <p className="text-xs font-semibold mt-0.5" style={{color: style.solid}}>{student.belt}</p>
                                        
                                        {/* Added Phone Number here in the card */}
                                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{student.phone}</p>

                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-[10px] text-gray-400">Faltas: <span className="text-red-400 font-bold">{absences}</span></p>
                                            {hasOverdue && (
                                                <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded flex items-center">
                                                    <IconAlert className="w-3 h-3 mr-0.5" /> Financeiro
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Desde</p>
                                        <p className="text-xs font-medium text-gray-300">
                                            {new Date(student.startDate).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Rank Bar (Black Bar for Stripes) (10%) */}
                                <div className="w-[10%] bg-black border-l border-gray-800 flex flex-col-reverse items-center justify-evenly py-2" onClick={(e) => e.stopPropagation()}>
                                     {/* 4 Clickable Areas for Stripes */}
                                     {[1, 2, 3, 4].map(degree => (
                                         <div 
                                            key={degree}
                                            onClick={() => handleUpdateStudentDegree(student.id, degree)}
                                            className={`w-6 h-1.5 cursor-pointer transition-all duration-200 border border-white/30 ${student.degrees && student.degrees >= degree ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'bg-transparent hover:bg-white/20'}`}
                                            title={`Grau ${degree}`}
                                         />
                                     ))}
                                </div>
                                </div>
                            );
                            })}
                        </div>
                        )}
                    </div>

                    {/* Stats Panel (Pie Chart & Attendance Chart) */}
                    <div className="space-y-6">
                        {/* 1. Pie Chart: Belts */}
                        <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-jiu-surface border-gray-700' : 'bg-white border-gray-100'}`}>
                          <h3 className={`font-bold mb-4 text-center ${darkMode ? 'text-white' : 'text-gray-700'}`}>Distribuição de Faixas</h3>
                          <div className="h-64 w-full">
                              {beltDistribution.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                  <Pie
                                      data={beltDistribution}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={80}
                                      paddingAngle={5}
                                      dataKey="value"
                                  >
                                      {beltDistribution.map((entry, index) => (
                                      <Cell 
                                          key={`cell-${index}`} 
                                          fill={BELT_STYLES[entry.name as BeltColor]?.solid || '#ccc'} 
                                          strokeWidth={0}
                                      />
                                      ))}
                                  </Pie>
                                  <Tooltip 
                                      contentStyle={{ 
                                        borderRadius: '8px', 
                                        border: 'none', 
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        backgroundColor: darkMode ? '#1e293b' : '#fff',
                                        color: darkMode ? '#fff' : '#000'
                                      }}
                                  />
                                  <Legend verticalAlign="bottom" height={36}/>
                                  </PieChart>
                              </ResponsiveContainer>
                              ) : (
                              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                  Sem dados suficientes
                              </div>
                              )}
                          </div>
                        </div>

                        {/* 2. Bar Chart: Attendance by Day */}
                        <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-jiu-surface border-gray-700' : 'bg-white border-gray-100'}`}>
                            <h3 className={`font-bold mb-4 text-center ${darkMode ? 'text-white' : 'text-gray-700'}`}>Presenças por Dia</h3>
                            <div className="h-48 w-full">
                                {attendanceByDay.length > 0 && attendanceByDay.some(d => d.count > 0) ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={attendanceByDay}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                            <XAxis 
                                                dataKey="name" 
                                                tick={{fontSize: 10, fill: darkMode ? '#9ca3af' : '#4b5563'}}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis 
                                                allowDecimals={false}
                                                tick={{fontSize: 10, fill: darkMode ? '#9ca3af' : '#4b5563'}}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                cursor={{fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}}
                                                contentStyle={{ 
                                                    borderRadius: '8px', 
                                                    border: 'none', 
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                    backgroundColor: darkMode ? '#1e293b' : '#fff',
                                                    color: darkMode ? '#fff' : '#000'
                                                }}
                                            />
                                            <Bar dataKey="count" fill="#1e3a8a" radius={[4, 4, 0, 0]} name="Presenças" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400 text-sm text-center px-4">
                                        Sem dados de presença nos dias de funcionamento.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : activeAcademyTab === 'trainings' ? (
                // TRAININGS TAB CONTENT - ADMIN ONLY
                <div className="space-y-6">
                    <div className="flex justify-end">
                         <button 
                            onClick={handleOpenNewTrainingModal}
                            className="bg-jiu-secondary hover:bg-black text-white px-4 py-2 rounded-lg shadow flex items-center transition-all text-sm font-medium"
                        >
                            <IconClipboard className="w-4 h-4 mr-2" />
                            Registrar Treino
                        </button>
                    </div>

                    {(!selectedAcademy.trainings || selectedAcademy.trainings.length === 0) ? (
                         <div className={`p-12 rounded-xl text-center border-2 border-dashed ${darkMode ? 'bg-jiu-surface border-gray-700' : 'bg-white border-gray-200'}`}>
                             <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${darkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                                 <IconCalendar className="w-8 h-8" />
                             </div>
                             <h4 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Nenhum treino registrado</h4>
                             <p className="text-gray-500 max-w-md mx-auto mt-2">Comece a registrar as aulas para criar um histórico de evolução da academia.</p>
                         </div>
                     ) : (
                         <div className="space-y-4">
                             {selectedAcademy.trainings.map((training) => {
                                 // Get first media as cover if available
                                 const coverMedia = training.media && training.media.length > 0 ? training.media[0] : null;
                                 const mediaCount = training.media?.length || 0;

                                 return (
                                 <div 
                                    key={training.id} 
                                    className={`relative rounded-xl overflow-hidden shadow-sm border flex flex-col md:flex-row hover:shadow-md transition-shadow ${darkMode ? 'bg-jiu-surface border-gray-700' : 'bg-white border-gray-100'}`}
                                    style={coverMedia ? {
                                        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url(${coverMedia.data})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    } : {}}
                                >
                                     {/* Conditional Date Block (Darker if bg image) */}
                                     <div className={`p-6 flex-shrink-0 flex flex-col items-center justify-center w-full md:w-24 h-24 md:h-auto relative z-10 ${coverMedia ? 'text-white' : (darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-800')}`}>
                                         <span className="text-xs font-bold uppercase">{new Date(training.date).toLocaleString('pt-BR', { month: 'short' })}</span>
                                         <span className="text-2xl font-bold">{new Date(training.date).getDate()}</span>
                                         <span className="text-xs">{new Date(training.date).getFullYear()}</span>
                                         
                                         {mediaCount > 1 && (
                                             <div className="mt-2 px-2 py-0.5 bg-black/50 rounded-full text-[10px] font-bold border border-white/20">
                                                 +{mediaCount - 1} fotos
                                             </div>
                                         )}
                                     </div>

                                     <div className="flex-1 p-6 relative z-10">
                                         <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className={`font-bold text-lg ${coverMedia ? 'text-white' : (darkMode ? 'text-white' : 'text-gray-900')}`}>
                                                    {/* Display techniques as tags */}
                                                    {training.techniques && training.techniques.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {training.techniques.map((tech, idx) => (
                                                                <span key={idx} className={`text-xs px-2 py-1 rounded border ${coverMedia ? 'bg-white/20 border-white/30 text-white' : 'bg-jiu-primary/10 border-jiu-primary/20 text-jiu-primary'}`}>
                                                                    {tech}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        "Treino Geral"
                                                    )}
                                                </h4>
                                                <div className={`flex items-center text-xs mt-2 space-x-3 ${coverMedia ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    <span className="flex items-center"><IconClock className="w-3 h-3 mr-1"/> {training.duration} de duração</span>
                                                    <span className="flex items-center"><IconUsers className="w-3 h-3 mr-1"/> {training.studentIds.length} presentes</span>
                                                </div>
                                            </div>
                                            
                                            {/* Actions for Training */}
                                            <div className="flex space-x-1">
                                                <button 
                                                    onClick={() => handleEditTraining(training)}
                                                    className={`p-2 rounded-full transition-colors ${coverMedia ? 'text-white hover:bg-white/20' : 'text-gray-400 hover:text-jiu-primary hover:bg-gray-100'}`}
                                                    title="Editar Treino"
                                                >
                                                    <IconEdit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleConfirmDeleteTraining(training.id)}
                                                    className={`p-2 rounded-full transition-colors ${coverMedia ? 'text-white hover:bg-red-600/50' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                                                    title="Excluir Treino"
                                                >
                                                    <IconTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                         </div>
                                         
                                         {training.description && (
                                             <p className={`text-sm mt-3 p-3 rounded-lg border backdrop-blur-sm ${
                                                 coverMedia 
                                                 ? 'bg-black/40 border-white/10 text-gray-200' 
                                                 : (darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-600')
                                             }`}>
                                                 {training.description}
                                             </p>
                                         )}
                                     </div>
                                 </div>
                             )})}
                         </div>
                     )}
                </div>
            ) : (
              // FINANCIAL TAB CONTENT - ADMIN ONLY
              <div className="space-y-8 animate-fade-in">
                
                {/* Stats Cards (Header) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`rounded-xl p-6 border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-sm font-medium">Receita (Total)</p>
                        <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          R$ {totalRevenue.toFixed(2)}
                        </h3>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg text-green-600">
                        <IconMoney className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-xl p-6 border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-yellow-100'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-sm font-medium">A Receber</p>
                        <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          R$ {totalPending.toFixed(2)}
                        </h3>
                      </div>
                      <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600">
                        <IconWallet className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-xl p-6 border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-red-100'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-sm font-medium">Em Atraso (Inadimplentes)</p>
                        <h3 className="text-2xl font-bold mt-1 text-red-500">
                          R$ {totalOverdue.toFixed(2)}
                        </h3>
                      </div>
                      <div className="p-3 bg-red-100 rounded-lg text-red-600">
                        <IconAlert className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Situação dos Alunos</h3>
                    <button 
                      onClick={handleOpenTransactionModal}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center transition-colors text-sm font-medium"
                    >
                      <IconPlus className="w-4 h-4 mr-2" />
                      Lançar Pagamento / Cobrança
                    </button>
                </div>

                {/* STUDENT FINANCIAL CARDS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studentFinancialCards.length === 0 ? (
                         <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed rounded-xl dark:border-gray-700">
                             Nenhum aluno com histórico financeiro ou matrícula ativa.
                         </div>
                    ) : (
                        studentFinancialCards.map((cardData) => {
                            const { student, paidSum, overdueSum, pendingSum, nextPayment, monthlyAmount } = cardData;
                            const beltStyle = BELT_STYLES[student.belt] || BELT_STYLES[BeltColor.WHITE];
                            const isDefaulter = overdueSum > 0;

                            return (
                                <div key={student.id} className={`rounded-xl border shadow-sm overflow-hidden flex flex-col ${darkMode ? 'bg-jiu-surface border-gray-700' : 'bg-white border-gray-200'}`}>
                                    {/* Card Header */}
                                    <div className="p-4 flex items-center space-x-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                         <div className="w-12 h-12 rounded-full overflow-hidden border-2 shadow-sm flex-shrink-0" style={{borderColor: beltStyle.solid}}>
                                             {student.photo ? (
                                                 <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                                             ) : (
                                                 <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold">
                                                     {student.name.charAt(0)}
                                                 </div>
                                             )}
                                         </div>
                                         <div className="flex-1 min-w-0">
                                             <h4 className={`font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{student.name}</h4>
                                             <div className="flex items-center space-x-2">
                                                <span className="text-xs px-2 py-0.5 rounded text-white font-medium" style={{backgroundColor: beltStyle.solid}}>{student.belt}</span>
                                                {isDefaulter && (
                                                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase border border-red-200">Em Atraso</span>
                                                )}
                                             </div>
                                         </div>
                                         {/* Botão de Limpar Histórico do Aluno */}
                                         <button 
                                            onClick={() => handleClearStudentFinancials(student.id)}
                                            className="p-2 bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-full transition-colors ml-2"
                                            title="Limpar TODO histórico financeiro"
                                         >
                                            <IconTrash className="w-4 h-4" />
                                         </button>
                                    </div>

                                    {/* Card Body: Stats */}
                                    <div className="p-4 flex-1">
                                        <div className="mb-4">
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Mensalidade Estimada</p>
                                            <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                {monthlyAmount > 0 ? `R$ ${monthlyAmount.toFixed(2)}` : 'Não definida'}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-center mb-4">
                                            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-100 dark:border-green-900/30">
                                                <p className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase">Pago</p>
                                                <p className="text-sm font-bold text-green-700 dark:text-green-300">R${paidSum.toFixed(0)}</p>
                                            </div>
                                            <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-900/30">
                                                <p className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase">Devendo</p>
                                                <p className="text-sm font-bold text-red-700 dark:text-red-300">R${overdueSum.toFixed(0)}</p>
                                            </div>
                                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                                                <p className="text-[10px] text-yellow-600 dark:text-yellow-400 font-bold uppercase">Futuro</p>
                                                <p className="text-sm font-bold text-yellow-700 dark:text-yellow-300">R${pendingSum.toFixed(0)}</p>
                                            </div>
                                        </div>

                                        {/* Next Payment / Action Item */}
                                        <div className="space-y-2">
                                            <p className="text-xs text-gray-400 font-medium uppercase border-b border-gray-100 dark:border-gray-700 pb-1">Próximos Vencimentos / Pendências</p>
                                            <div className="max-h-32 overflow-y-auto space-y-2">
                                                {/* Filter only unpaid transactions for the quick list */}
                                                {cardData.transactions.filter(t => !t.paidDate).length === 0 ? (
                                                     <p className="text-xs text-gray-500 italic py-2 text-center">Tudo em dia! 🎉</p>
                                                ) : (
                                                    cardData.transactions
                                                    .filter(t => !t.paidDate)
                                                    .sort((a,b) => a.dueDate.localeCompare(b.dueDate))
                                                    .slice(0, 3) // Show top 3 pending
                                                    .map(tx => {
                                                        const isLate = isOverdue(tx);
                                                        return (
                                                            <div key={tx.id} className="flex justify-between items-center text-sm p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                                <div className="flex flex-col">
                                                                    <span className={`text-xs font-bold ${isLate ? 'text-red-500' : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                                                                        {new Date(tx.dueDate).toLocaleDateString('pt-BR')}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{tx.description || tx.type}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`font-mono text-xs ${isLate ? 'text-red-600 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>
                                                                        R${tx.amount.toFixed(0)}
                                                                    </span>
                                                                    <button 
                                                                        onClick={() => handleMarkAsPaid(tx.id)}
                                                                        className="text-green-500 hover:text-green-700 dark:hover:text-green-400 p-1 bg-green-50 dark:bg-green-900/30 rounded"
                                                                        title="Dar baixa (Pagar)"
                                                                    >
                                                                        <IconCheck className="w-3 h-3" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleEditTransaction(tx)}
                                                                        className="text-blue-400 hover:text-blue-600 p-1"
                                                                        title="Editar"
                                                                    >
                                                                        <IconEdit className="w-3 h-3" />
                                                                    </button>
                                                                     <button 
                                                                        onClick={() => handleDeleteTransaction(tx.id)}
                                                                        className="text-gray-400 hover:text-red-600 p-1"
                                                                        title="Excluir"
                                                                    >
                                                                        <IconTrash className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                                {cardData.transactions.filter(t => !t.paidDate).length > 3 && (
                                                    <p className="text-[10px] text-center text-gray-400 italic">
                                                        + {cardData.transactions.filter(t => !t.paidDate).length - 3} outros lançamentos
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

              </div>
            )}

          </div>
        )}

        {/* View 3: Student Profile (Read Only History or Admin View) */}
        {selectedStudent && (
            <div className="space-y-8 animate-fade-in">
                 {/* Only allow going back if NOT a student (since students are locked to this view) */}
                 {(userRole === 'admin' || userRole === 'professor') && (
                    <button 
                        onClick={() => setSelectedStudentId(null)}
                        className="flex items-center text-gray-500 hover:text-jiu-primary transition-colors mb-4"
                    >
                        <IconBack className="w-4 h-4 mr-1" /> Voltar para Lista de Alunos
                    </button>
                 )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Sidebar */}
                    <div className="space-y-6">
                        <div className={`rounded-xl shadow-md overflow-hidden border ${darkMode ? 'bg-jiu-surface border-gray-700' : 'bg-white border-gray-100'}`}>
                             {/* Belt Banner Header */}
                             <div
                                className="relative h-24 md:h-32 w-full border-b flex justify-between items-stretch overflow-hidden shadow-inner"
                                style={{
                                    background: BELT_STYLES[selectedStudent.belt]?.background || '#f3f4f6',
                                    borderColor: BELT_STYLES[selectedStudent.belt]?.borderColor || 'transparent'
                                }}
                             >
                                {/* Left: Avatar Area */}
                                <div className="flex items-center pl-4 md:pl-8 relative z-10">
                                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 relative">
                                        {selectedStudent.photo ? (
                                            <img src={selectedStudent.photo} alt={selectedStudent.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-2xl md:text-3xl">
                                                {selectedStudent.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Black Bar (Tarja Preta) for Stripes */}
                                <div className="w-24 md:w-32 bg-black h-full flex items-center justify-center gap-2 md:gap-3 px-2 md:px-4 shadow-[-5px_0_15px_rgba(0,0,0,0.3)] relative z-10 clip-path-slant">
                                    {/* Vertical Stripes (Graus) */}
                                    {[1, 2, 3, 4].map(degree => (
                                        <div
                                            key={degree}
                                            className={`w-2 md:w-3 h-12 md:h-20 rounded-full shadow-sm transition-all duration-300 ${
                                                selectedStudent.degrees && selectedStudent.degrees >= degree
                                                ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                                                : 'bg-white/10'
                                            }`}
                                            title={`Grau ${degree}`}
                                        ></div>
                                    ))}
                                </div>
                             </div>

                             <div className="p-6">
                                <div className="mb-6">
                                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedStudent.name}</h2>
                                    <p className="text-gray-500 text-sm mt-1">Início: {new Date(selectedStudent.startDate).toLocaleDateString()}</p>
                                </div>

                                {/* EVOLUTION / PROGRESS CARD */}
                                <div className={`mb-6 p-6 rounded-xl border border-yellow-200 ${darkMode ? 'bg-yellow-900/10 border-yellow-700/30' : 'bg-yellow-50'}`}>
                                    <h4 className={`text-sm font-bold uppercase mb-4 text-center tracking-wider ${darkMode ? 'text-yellow-500' : 'text-yellow-700'}`}>
                                        Progresso do Grau
                                    </h4>

                                    <div className="flex justify-center space-x-3 mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                disabled={userRole === 'student'}
                                                onClick={() => handleUpdateStudentProgress(selectedStudent.id, star === selectedStudent.progressStars ? star - 1 : star)}
                                                className={`transition-all transform ${userRole !== 'student' ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
                                            >
                                                <IconSparkles
                                                    className={`w-8 h-8 ${
                                                        (selectedStudent.progressStars || 0) >= star
                                                        ? 'text-yellow-400 fill-yellow-400 drop-shadow-md'
                                                        : 'text-gray-300 dark:text-gray-600'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Actions for Professor/Admin */}
                                    {(userRole === 'admin' || userRole === 'professor') && (
                                        <div className="flex justify-center space-x-2">
                                            {(selectedStudent.progressStars || 0) >= 5 && (selectedStudent.degrees || 0) < 4 && (
                                                <button
                                                    onClick={() => handleUpdateStudentDegree(selectedStudent.id, (selectedStudent.degrees || 0) + 1)}
                                                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow animate-pulse"
                                                >
                                                    + Graduar Grau
                                                </button>
                                            )}
                                            {(selectedStudent.degrees || 0) >= 4 && (
                                                <button
                                                    onClick={() => {
                                                        // Simple alert for now, could be a belt selector modal
                                                        alert("Parabéns! Hora de trocar a faixa. Edite o aluno para alterar a cor da faixa manualmente.");
                                                        handleEditStudent(selectedStudent);
                                                    }}
                                                    className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold shadow animate-pulse border border-gray-700"
                                                >
                                                    🎓 Trocar Faixa
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className={`space-y-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                                    <div className={`flex justify-between border-b pb-2 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                        <span className="text-gray-500">Idade</span>
                                        <span className="font-medium">
                                            {selectedStudent.birthDate ? `${new Date().getFullYear() - new Date(selectedStudent.birthDate).getFullYear()} anos` : '-'}
                                        </span>
                                    </div>
                                    <div className={`flex justify-between border-b pb-2 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                        <span className="text-gray-500">Presenças Totais</span>
                                        <span className="font-medium">{studentTrainings.length}</span>
                                    </div>
                                    <div className={`flex justify-between border-b pb-2 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                        <span className="text-gray-500">Faltas Estimadas</span>
                                        <span className="font-medium text-red-500">{calculateAbsences(selectedStudent, selectedAcademy?.trainings || [])}</span>
                                    </div>
                                    
                                    {/* Contacts Section */}
                                    <div className={`flex justify-between border-b pb-2 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                        <span className="text-gray-500">Email</span>
                                        <span className="font-medium truncate max-w-[150px]">{selectedStudent.email}</span>
                                    </div>
                                    <div className={`flex justify-between border-b pb-2 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                        <span className="text-gray-500">Telefone</span>
                                        <span className="font-medium truncate max-w-[150px]">{selectedStudent.phone}</span>
                                    </div>

                                    {/* Guardian Information (Conditional) */}
                                    {selectedStudent.guardianName && (
                                       <>
                                           <div className={`flex justify-between border-b pb-2 mt-4 bg-gray-50 p-2 rounded ${darkMode ? 'bg-gray-800 border-gray-700' : 'border-gray-100'}`}>
                                               <span className="text-gray-500 font-bold text-xs uppercase">Responsável</span>
                                           </div>
                                           <div className={`flex justify-between border-b pb-2 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                               <span className="text-gray-500">Nome</span>
                                               <span className="font-medium truncate max-w-[150px]">{selectedStudent.guardianName}</span>
                                           </div>
                                           {selectedStudent.guardianPhone && (
                                               <div className={`flex justify-between border-b pb-2 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                                   <span className="text-gray-500">Telefone</span>
                                                   <span className="font-medium truncate max-w-[150px]">{selectedStudent.guardianPhone}</span>
                                               </div>
                                           )}
                                           {selectedStudent.guardianCpf && (
                                               <div className={`flex justify-between border-b pb-2 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                                   <span className="text-gray-500">CPF</span>
                                                   <span className="font-medium truncate max-w-[150px]">{selectedStudent.guardianCpf}</span>
                                               </div>
                                           )}
                                       </>
                                    )}
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Training History Feed */}
                    <div className="lg:col-span-2 space-y-6">
                         <h3 className={`font-bold text-xl flex items-center ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            <IconHistory className="w-6 h-6 mr-2 text-jiu-primary" />
                            Seu Diário de Evolução
                         </h3>

                         {studentTrainings.length === 0 ? (
                             <div className={`p-12 rounded-xl text-center border-2 border-dashed ${darkMode ? 'bg-jiu-surface border-gray-700' : 'bg-white border-gray-200'}`}>
                                 <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${darkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                                     <IconClipboard className="w-8 h-8" />
                                 </div>
                                 <h4 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Nenhuma presença registrada</h4>
                                 <p className="text-gray-500 max-w-md mx-auto mt-2">Você ainda não possui presenças registradas em treinos.</p>
                             </div>
                         ) : (
                             <div className="space-y-4">
                                 {studentTrainings.map((training) => (
                                     <div key={training.id} className={`rounded-xl p-6 shadow-sm border flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow ${darkMode ? 'bg-jiu-surface border-gray-700' : 'bg-white border-gray-100'}`}>
                                         {/* Date Block */}
                                         <div className={`flex-shrink-0 flex flex-col items-center justify-center rounded-lg w-full md:w-20 h-20 ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-800'}`}>
                                             <span className="text-xs font-bold uppercase">{new Date(training.date).toLocaleString('pt-BR', { month: 'short' })}</span>
                                             <span className="text-2xl font-bold">{new Date(training.date).getDate()}</span>
                                             <span className="text-xs">{new Date(training.date).getFullYear()}</span>
                                         </div>

                                         <div className="flex-1">
                                             <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex flex-wrap gap-2 mb-1">
                                                        {(training.techniques || []).map((t, i) => (
                                                            <span key={i} className={`text-xs font-bold px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                                                        <span className="flex items-center"><IconClock className="w-3 h-3 mr-1"/> {training.duration} de duração</span>
                                                    </div>
                                                </div>
                                                <div className={`flex items-center px-2 py-1 rounded text-xs font-bold ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'}`}>
                                                    <IconCheck className="w-3 h-3 mr-1" />
                                                    Presente
                                                </div>
                                             </div>
                                             
                                             {training.description && (
                                                 <p className={`text-sm mt-3 p-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                                                     {training.description}
                                                 </p>
                                             )}
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         )}
                    </div>
                </div>
            </div>
        )}

      </main>

      {/* --- Modals --- */}

      {/* Login Modal */}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="Acesso Restrito"
      >
        <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <IconLock className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-500 text-sm text-center">Entre com suas credenciais para acessar esta área.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IconMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="email"
                        required
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jiu-primary focus:border-transparent outline-none transition-all"
                        placeholder="seu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IconLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="password"
                        required
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jiu-primary focus:border-transparent outline-none transition-all"
                        placeholder="••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                    />
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-jiu-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                    Entrar
                </button>
            </div>
        </form>
      </Modal>
      
      {/* Delete Student Modal */}
      <Modal
        isOpen={isDeleteStudentModalOpen}
        onClose={() => setIsDeleteStudentModalOpen(false)}
        title="Excluir Aluno"
      >
        <div className="space-y-4 text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <IconTrash className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-gray-700">
                Tem certeza que deseja excluir este aluno permanentemente?
            </p>
            <p className="text-sm text-red-500 font-semibold">
                Isso também excluirá todo o histórico financeiro associado a ele.
            </p>
            <p className="text-xs text-gray-500">
                As presenças em treinos passados serão mantidas apenas como estatística geral.
            </p>
            
            <div className="pt-4 flex justify-center space-x-3">
                <button 
                onClick={() => setIsDeleteStudentModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                Cancelar
                </button>
                <button 
                onClick={handleDeleteStudent}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transition-colors"
                >
                Sim, excluir aluno
                </button>
            </div>
        </div>
      </Modal>

      {/* Transaction Modal */}
      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        title={newTransaction.id && !newTransaction.id.startsWith('fin-') ? "Editar Cobrança" : "Nova Cobrança / Pagamento"}
      >
        <form onSubmit={handleSaveTransaction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aluno</label>
            <select 
              required
              className="w-full rounded-lg border-gray-300 border p-2.5 bg-white"
              value={newTransaction.studentId || ''}
              onChange={e => setNewTransaction({...newTransaction, studentId: e.target.value})}
            >
              <option value="">Selecione um aluno...</option>
              {selectedAcademyStudents.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select 
                className="w-full rounded-lg border-gray-300 border p-2.5 bg-white"
                value={newTransaction.type}
                onChange={e => setNewTransaction({...newTransaction, type: e.target.value as FinancialType})}
              >
                {Object.values(FinancialType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) - Por parcela</label>
              <input 
                type="number"
                step="0.01"
                required
                className="w-full rounded-lg border-gray-300 border p-2.5 bg-white"
                value={newTransaction.amount}
                onChange={e => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento (1ª Parcela)</label>
              <input 
                type="date"
                required
                className="w-full rounded-lg border-gray-300 border p-2.5 bg-white"
                value={newTransaction.dueDate}
                onChange={e => setNewTransaction({...newTransaction, dueDate: e.target.value})}
              />
            </div>
            {/* Oculta opção de recorrência se estiver editando uma cobrança existente */}
            {!(newTransaction.id && !newTransaction.id.startsWith('fin-')) && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade de Meses</label>
                    <input 
                        type="number"
                        min="1"
                        max="120"
                        required
                        className="w-full rounded-lg border-gray-300 border p-2.5 bg-white"
                        value={recurrenceCount}
                        onChange={e => setRecurrenceCount(parseInt(e.target.value))}
                    />
                </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pago em (Opcional - Quita todas)</label>
            <input 
                type="date"
                className="w-full rounded-lg border-gray-300 border p-2.5 bg-white"
                value={newTransaction.paidDate || ''}
                onChange={e => setNewTransaction({...newTransaction, paidDate: e.target.value})}
            />
            <p className="text-xs text-gray-500 mt-1">Deixe em branco se estiver pendente</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (Opcional)</label>
            <input 
              type="text"
              className="w-full rounded-lg border-gray-300 border p-2.5 bg-white"
              placeholder="Ex: Mensalidade 2023"
              value={newTransaction.description || ''}
              onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button"
              onClick={() => setIsTransactionModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition-colors"
            >
              {newTransaction.id && !newTransaction.id.startsWith('fin-') ? "Salvar Alterações" : "Confirmar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Training Confirmation Modal */}
      <Modal
        isOpen={isDeleteTrainingModalOpen}
        onClose={() => setIsDeleteTrainingModalOpen(false)}
        title="Excluir Treino"
      >
        <div className="space-y-4 text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <IconTrash className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-gray-700">
                Tem certeza que deseja excluir este registro de treino?
            </p>
            <p className="text-sm text-gray-500">
                Isso removerá a presença dos alunos associados a este dia.
            </p>
            
            <div className="pt-4 flex justify-center space-x-3">
                <button 
                onClick={() => setIsDeleteTrainingModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                Cancelar
                </button>
                <button 
                onClick={handleDeleteTraining}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transition-colors"
                >
                Sim, excluir
                </button>
            </div>
        </div>
      </Modal>

      {/* Delete Academy Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Excluir Academia"
      >
        <div className="space-y-4 text-center">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <IconTrash className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-700">
            Tem certeza que deseja excluir a academia <span className="font-bold">{selectedAcademy?.name}</span>?
          </p>
          <p className="text-sm text-red-500">
            Esta ação removerá permanentemente a academia e <strong>todos os {selectedAcademyStudents.length} alunos</strong> vinculados a ela.
          </p>
          
          <div className="pt-4 flex justify-center space-x-3">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleDeleteAcademy}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transition-colors"
            >
              Sim, excluir academia
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Team Modal (SETTINGS) */}
      <Modal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title="Configurações da Equipe"
      >
        <form onSubmit={handleSaveTeam} className="space-y-6">
          <div className="flex flex-col items-center justify-center">
             <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 mb-2 overflow-hidden relative group">
               {newTeam.logo ? (
                 <img src={newTeam.logo} alt="Logo Preview" className="w-full h-full object-cover" />
               ) : (
                 <div className="flex flex-col items-center justify-center h-full text-gray-400">
                   <IconCamera className="w-8 h-8" />
                 </div>
               )}
               <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold">
                 Alterar Logo
                 <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'team')} />
               </label>
             </div>
             <span className="text-xs text-gray-500">Clique para alterar o logo da equipe</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Equipe</label>
            <input 
              required
              type="text" 
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-jiu-primary focus:border-transparent outline-none transition-all bg-white"
              value={newTeam.name || ''}
              onChange={e => setNewTeam({...newTeam, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição / Slogan</label>
            <textarea
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-jiu-primary focus:border-transparent outline-none transition-all bg-white"
              rows={3}
              value={newTeam.description || ''}
              onChange={e => setNewTeam({...newTeam, description: e.target.value})}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
              <h4 className="font-bold text-gray-800 text-sm border-b pb-2">Credenciais de Administrador (Global)</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email do Admin</label>
                <input
                  type="email"
                  className="w-full rounded-lg border-gray-300 border p-2.5 bg-white"
                  placeholder="admin@equipe.com"
                  value={newTeam.adminEmail || ''}
                  onChange={e => setNewTeam({...newTeam, adminEmail: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha do Admin</label>
                <input
                  type="password"
                  className="w-full rounded-lg border-gray-300 border p-2.5 bg-white"
                  placeholder="Definir senha de acesso"
                  value={newTeam.adminPassword || ''}
                  onChange={e => setNewTeam({...newTeam, adminPassword: e.target.value})}
                />
              </div>
          </div>

          {/* Data Management (Backup) Section */}
          <div className="border-t pt-4 mt-4">
             <h4 className="font-bold text-gray-800 text-sm mb-3">Gerenciamento de Dados (Backup)</h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <button
                    type="button"
                    onClick={handleExportData}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                 >
                    <span className="mr-2">⬇️</span> Exportar Dados
                 </button>
                 
                 <label className="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    <span className="mr-2">⬆️</span> Restaurar Backup
                    <input type="file" className="hidden" accept=".json" onChange={handleImportData} />
                 </label>
             </div>
             <p className="text-xs text-gray-500 mt-2">
               Baixe o arquivo JSON para salvar seus dados ou carregue-o em outro dispositivo.
             </p>
          </div>

          {/* UI Preferences Section */}
          <div className="border-t pt-4 mt-4">
              <h4 className="font-bold text-gray-800 text-sm mb-3">Preferências de Interface</h4>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">Modo Escuro (Dark Mode)</span>
                  </div>
                  <button 
                    type="button"
                    onClick={toggleDarkMode}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${darkMode ? 'bg-jiu-primary' : 'bg-gray-200'}`}
                  >
                      <span className="sr-only">Use setting</span>
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${darkMode ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                  </button>
              </div>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button 
              type="button"
              onClick={() => setIsTeamModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-jiu-primary text-white rounded-lg hover:bg-blue-900 shadow-md transition-colors"
            >
              Salvar Configurações
            </button>
          </div>
        </form>
      </Modal>

      {/* Add/Edit Academy Modal */}
      <Modal
        isOpen={isAcademyModalOpen}
        onClose={() => setIsAcademyModalOpen(false)}
        title={newAcademy.id ? "Editar Academia" : "Nova Academia"}
      >
        <form onSubmit={handleSaveAcademy} className="space-y-4">
          
          {/* Academy Logo Upload */}
          <div className="flex justify-center mb-4">
             <div className="w-full max-w-xs">
               <label className="flex flex-col items-center px-4 py-4 bg-white text-blue rounded-lg shadow-sm tracking-wide border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
                  {newAcademy.logo ? (
                     <div className="relative w-20 h-20 mb-2">
                       <img src={newAcademy.logo} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                       <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                         <IconEdit className="text-white w-6 h-6 drop-shadow-md" />
                       </div>
                     </div>
                  ) : (
                    <>
                      <IconCamera className="w-8 h-8 text-jiu-primary mb-2" />
                      <span className="text-sm font-medium text-gray-600">Logo da Academia</span>
                    </>
                  )}
                  <input type='file' className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'academy')} />
               </label>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Academia</label>
            <input 
              required
              type="text" 
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-jiu-primary focus:border-transparent outline-none transition-all bg-white text-gray-900"
              placeholder="Ex: Matriz Centro"
              value={newAcademy.name || ''}
              onChange={e => setNewAcademy({...newAcademy, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
            <input 
              type="text" 
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-jiu-primary focus:border-transparent outline-none transition-all bg-white text-gray-900"
              placeholder="Rua..."
              value={newAcademy.address || ''}
              onChange={e => setNewAcademy({...newAcademy, address: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instrutor Responsável</label>
            <input 
              required
              type="text" 
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-jiu-primary focus:border-transparent outline-none transition-all bg-white text-gray-900"
              placeholder="Nome do Professor"
              value={newAcademy.instructorName || ''}
              onChange={e => setNewAcademy({...newAcademy, instructorName: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 bg-gray-50 p-3 rounded-lg border">
            <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Credenciais de Acesso (Professor)</label>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email de Login</label>
                <input
                type="email"
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-jiu-primary outline-none bg-white text-gray-900"
                placeholder="email@professor.com"
                value={newAcademy.allowedEmails?.[0] || ''}
                onChange={e => setNewAcademy({...newAcademy, allowedEmails: [e.target.value]})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input
                type="password"
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-jiu-primary outline-none bg-white text-gray-900"
                placeholder="Senha de acesso"
                value={newAcademy.adminPassword || ''}
                onChange={e => setNewAcademy({...newAcademy, adminPassword: e.target.value})}
                />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-jiu-primary focus:border-transparent outline-none transition-all bg-white text-gray-900"
              placeholder="Sobre a academia..."
              rows={3}
              value={newAcademy.description || ''}
              onChange={e => setNewAcademy({...newAcademy, description: e.target.value})}
            />
          </div>

          {/* Operating Days/Hours Per Day */}
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Horários de Funcionamento</label>
             <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
                {WEEKDAYS.map(day => {
                  const schedule = getScheduleForDay(day);
                  const isChecked = !!schedule;

                  return (
                    <div key={day} className={`p-2 rounded-lg transition-colors ${isChecked ? 'bg-white border shadow-sm' : ''}`}>
                      <div className="flex justify-between items-center">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                            type="checkbox"
                            className="rounded text-jiu-primary focus:ring-jiu-primary h-4 w-4"
                            checked={isChecked}
                            onChange={() => handleScheduleChange(day, 'toggleDay')}
                            />
                            <span className={`text-sm ${isChecked ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{day}</span>
                        </label>
                        
                        {isChecked && (
                            <button
                                type="button"
                                onClick={() => handleScheduleChange(day, 'addRange')}
                                className="text-xs text-jiu-primary font-bold hover:underline"
                            >
                                + Adicionar Horário
                            </button>
                        )}
                      </div>
                      
                      {isChecked && schedule && (
                        <div className="mt-2 space-y-2 pl-6 animate-fade-in">
                            {schedule.timeRanges.map((range, rangeIndex) => (
                                <div key={rangeIndex} className="flex items-center space-x-2">
                                    <div className="flex-1">
                                        <span className="text-[10px] text-gray-500 block uppercase">Início</span>
                                        <input 
                                        type="time" 
                                        className="w-full rounded border-gray-300 border p-1 text-sm focus:ring-1 focus:ring-jiu-primary bg-white text-gray-900"
                                        value={range.openTime}
                                        onChange={(e) => handleScheduleChange(day, 'updateRange', { index: rangeIndex, field: 'openTime', value: e.target.value })}
                                        />
                                    </div>
                                    <span className="text-gray-400 pt-3">às</span>
                                    <div className="flex-1">
                                        <span className="text-[10px] text-gray-500 block uppercase">Fim</span>
                                        <input 
                                        type="time" 
                                        className="w-full rounded border-gray-300 border p-1 text-sm focus:ring-1 focus:ring-jiu-primary bg-white text-gray-900"
                                        value={range.closeTime}
                                        onChange={(e) => handleScheduleChange(day, 'updateRange', { index: rangeIndex, field: 'closeTime', value: e.target.value })}
                                        />
                                    </div>
                                    <div className="pt-3">
                                        <button
                                            type="button"
                                            onClick={() => handleScheduleChange(day, 'removeRange', rangeIndex)}
                                            className="text-red-400 hover:text-red-600 p-1"
                                            title="Remover horário"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}
             </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button"
              onClick={() => setIsAcademyModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-jiu-primary text-white rounded-lg hover:bg-blue-900 shadow-md transition-colors"
            >
              {newAcademy.id ? "Salvar Academia" : "Cadastrar Academia"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add/Edit Student Modal */}
      <Modal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        title={newStudent.id ? "Editar Aluno" : "Novo Aluno"}
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          
          {/* Student Photo Upload */}
          <div className="flex justify-center mb-4">
             <div className="w-24 h-24 relative group cursor-pointer">
               <label className="block w-full h-full rounded-full overflow-hidden border-4 border-gray-200 shadow-sm hover:border-jiu-primary transition-colors">
                 {newStudent.photo ? (
                   <img src={newStudent.photo} alt="Student" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                     <IconCamera className="w-8 h-8" />
                   </div>
                 )}
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                   <IconEdit className="w-6 h-6 text-white" />
                 </div>
                 <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'student')} />
               </label>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input 
              required
              type="text" 
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-jiu-primary focus:border-transparent outline-none transition-all bg-white text-gray-900"
              value={newStudent.name || ''}
              onChange={e => setNewStudent({...newStudent, name: e.target.value})}
            />
          </div>

          {/* Admin Migration Feature */}
          {userRole === 'admin' && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <label className="block text-sm font-bold text-blue-800 mb-1">Academia (Migração)</label>
                  <select
                      className="w-full rounded-lg border-blue-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newStudent.academyId || selectedAcademyId || ''}
                      onChange={e => setNewStudent({...newStudent, academyId: e.target.value})}
                  >
                      {data.academies.map(academy => (
                          <option key={academy.id} value={academy.id}>
                              {academy.name}
                          </option>
                      ))}
                  </select>
                  <p className="text-xs text-blue-600 mt-1">
                      Alterar a academia moverá o aluno e seu histórico para a nova unidade.
                  </p>
              </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
              <input 
                type="date" 
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-jiu-primary focus:border-transparent outline-none transition-all bg-white text-gray-900"
                value={newStudent.birthDate || ''}
                onChange={e => setNewStudent({...newStudent, birthDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input 
                type="tel" 
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-jiu-primary focus:border-transparent outline-none transition-all bg-white text-gray-900"
                value={newStudent.phone || ''}
                onChange={e => setNewStudent({...newStudent, phone: e.target.value})}
              />
            </div>
          </div>

          {/* Conditional Guardian Fields */}
          {calculateAge(newStudent.birthDate) < 18 && newStudent.birthDate && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 space-y-3 animate-fade-in">
                  <h4 className="text-sm font-bold text-yellow-800 border-b border-yellow-200 pb-1 mb-2">
                      Dados do Responsável (Menor de Idade)
                  </h4>
                  <div>
                      <label className="block text-xs font-medium text-yellow-800 mb-1">Nome do Responsável</label>
                      <input 
                          type="text" 
                          placeholder="Nome completo do pai, mãe ou tutor"
                          className="w-full rounded border-yellow-300 border p-2 text-sm focus:ring-1 focus:ring-yellow-500 bg-white"
                          value={newStudent.guardianName || ''}
                          onChange={e => setNewStudent({...newStudent, guardianName: e.target.value})}
                      />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                          <label className="block text-xs font-medium text-yellow-800 mb-1">WhatsApp Responsável</label>
                          <input 
                              type="tel" 
                              placeholder="(00) 00000-0000"
                              className="w-full rounded border-yellow-300 border p-2 text-sm focus:ring-1 focus:ring-yellow-500 bg-white"
                              value={newStudent.guardianPhone || ''}
                              onChange={e => setNewStudent({...newStudent, guardianPhone: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-yellow-800 mb-1">CPF Responsável</label>
                          <input 
                              type="text" 
                              placeholder="000.000.000-00"
                              className="w-full rounded border-yellow-300 border p-2 text-sm focus:ring-1 focus:ring-yellow-500 bg-white"
                              value={newStudent.guardianCpf || ''}
                              onChange={e => setNewStudent({...newStudent, guardianCpf: e.target.value})}
                          />
                      </div>
                  </div>
              </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Login)</label>
                <input
                type="email"
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-jiu-primary focus:border-transparent outline-none transition-all bg-white text-gray-900"
                value={newStudent.email || ''}
                onChange={e => setNewStudent({...newStudent, email: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha (Login)</label>
                <input
                type="password"
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-jiu-primary focus:border-transparent outline-none transition-all bg-white text-gray-900"
                placeholder="Definir senha"
                value={newStudent.password || ''}
                onChange={e => setNewStudent({...newStudent, password: e.target.value})}
                />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faixa Atual</label>
              <select 
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-jiu-primary focus:border-transparent outline-none transition-all bg-white text-gray-900"
                value={newStudent.belt}
                onChange={e => setNewStudent({...newStudent, belt: e.target.value as BeltColor})}
              >
                <optgroup label="Infantil (04 a 15 anos)">
                  {BELT_GROUPS.KIDS.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </optgroup>
                <optgroup label="Adulto (16 anos ou mais)">
                  {BELT_GROUPS.ADULTS.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Início dos Treinos</label>
              <input 
                type="date" 
                required
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-jiu-primary focus:border-transparent outline-none transition-all bg-white text-gray-900"
                value={newStudent.startDate || ''}
                onChange={e => setNewStudent({...newStudent, startDate: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button"
              onClick={() => setIsStudentModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-jiu-primary text-white rounded-lg hover:bg-blue-900 shadow-md transition-colors"
            >
              {newStudent.id ? "Salvar Alterações" : "Matricular"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add/Edit Training Modal */}
      <Modal
        isOpen={isTrainingModalOpen}
        onClose={() => setIsTrainingModalOpen(false)}
        title={newTraining.id ? "Editar Treino" : "Registrar Treino da Academia"}
      >
        <form onSubmit={handleSaveTraining} className="space-y-4">
           <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data do Treino</label>
                <input 
                    type="date" 
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-jiu-primary outline-none bg-white text-gray-900"
                    value={newTraining.date || ''}
                    onChange={e => setNewTraining({...newTraining, date: e.target.value})}
                />
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Duração</label>
                   <input 
                       type="text" 
                       placeholder="ex: 1h 30min"
                       className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-jiu-primary outline-none bg-white text-gray-900"
                       value={newTraining.duration || ''}
                       onChange={e => setNewTraining({...newTraining, duration: e.target.value})}
                   />
               </div>
           </div>

           {/* Multiple Techniques Logic */}
           <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Focos do Treino / Movimentos</label>
                <div className="flex gap-2 mb-2">
                    <select 
                        className="flex-1 rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-jiu-primary outline-none bg-white text-gray-900"
                        value={currentTechniqueToAdd}
                        onChange={e => setCurrentTechniqueToAdd(e.target.value)}
                    >
                        {JIU_JITSU_TECHNIQUES.map(tech => (
                            <option key={tech} value={tech}>{tech}</option>
                        ))}
                    </select>
                    <button 
                        type="button"
                        onClick={handleAddTechnique}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                        Adicionar
                    </button>
                </div>
                
                {/* Chips of selected techniques */}
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 rounded-lg border border-gray-100">
                    {!newTraining.techniques || newTraining.techniques.length === 0 ? (
                        <span className="text-sm text-gray-400 italic">Nenhuma técnica adicionada</span>
                    ) : (
                        newTraining.techniques.map((tech, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {tech}
                                <button 
                                    type="button"
                                    onClick={() => handleRemoveTechnique(tech)}
                                    className="ml-2 text-blue-600 hover:text-blue-900 font-bold focus:outline-none"
                                >
                                    ×
                                </button>
                            </span>
                        ))
                    )}
                </div>
           </div>

           <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição / Detalhes</label>
                <textarea
                    className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-jiu-primary outline-none bg-white text-gray-900"
                    rows={3}
                    placeholder="Descreva o que foi treinado, pontos de dificuldade, etc."
                    value={newTraining.description || ''}
                    onChange={e => setNewTraining({...newTraining, description: e.target.value})}
                />
           </div>

           {/* Attendance List */}
           <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Lista de Presença (Chamada)</label>
               <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                   {selectedAcademyStudents.length === 0 ? (
                       <p className="text-sm text-gray-500 text-center py-4">Nenhum aluno cadastrado nesta academia.</p>
                   ) : (
                       selectedAcademyStudents.map(student => (
                           <label key={student.id} className="flex items-center p-2 hover:bg-white rounded cursor-pointer transition-colors">
                               <input 
                                   type="checkbox" 
                                   className="rounded text-jiu-primary focus:ring-jiu-primary h-4 w-4 mr-3"
                                   checked={newTraining.studentIds?.includes(student.id) || false}
                                   onChange={(e) => {
                                       const currentIds = newTraining.studentIds || [];
                                       if (e.target.checked) {
                                           setNewTraining({ ...newTraining, studentIds: [...currentIds, student.id] });
                                       } else {
                                           setNewTraining({ ...newTraining, studentIds: currentIds.filter(id => id !== student.id) });
                                       }
                                   }}
                               />
                               <div>
                                   <p className="text-sm font-medium text-gray-700">{student.name}</p>
                                   <p className="text-xs text-gray-500">{student.belt}</p>
                               </div>
                           </label>
                       ))
                   )}
               </div>
               <p className="text-xs text-gray-500 mt-1 text-right">{newTraining.studentIds?.length || 0} alunos selecionados</p>
           </div>

           <div>
             <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Galeria de Mídia (Fotos/Vídeos)</label>
             </div>
             
             <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3 flex items-start">
                 <IconAlert className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                 <p className="text-xs text-yellow-800">
                     <strong>Atenção:</strong> Proteja a privacidade. Não publique rostos de crianças na galeria pública sem autorização expressa dos responsáveis.
                 </p>
             </div>

             {/* Dropzone / Upload Button */}
             <div className="flex items-center justify-center w-full mb-4">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors bg-white">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <IconCamera className="w-8 h-8 text-gray-400 mb-1" />
                        <p className="text-sm text-gray-500"><span className="font-semibold">Clique para adicionar</span> fotos ou vídeos</p>
                    </div>
                    <input type="file" multiple className="hidden" accept="image/*,video/*" onChange={(e) => handleImageUpload(e, 'training')} />
                </label>
             </div>

             {/* Media Grid Preview */}
             {newTraining.media && newTraining.media.length > 0 && (
                 <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                     {newTraining.media.map((mediaItem, index) => (
                         <div key={index} className="flex gap-2 p-2 border rounded-lg bg-gray-50">
                             {/* Thumbnail */}
                             <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-gray-200 border">
                                {mediaItem.type === 'video' ? (
                                    <video src={mediaItem.data} className="w-full h-full object-cover" />
                                ) : (
                                    <img src={mediaItem.data} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                )}
                                {mediaItem.type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                                            <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[5px] border-l-black border-b-[3px] border-b-transparent ml-0.5"></div>
                                        </div>
                                    </div>
                                )}
                             </div>

                             {/* Controls */}
                             <div className="flex flex-col justify-between flex-1 py-1">
                                 <label className="flex items-start cursor-pointer group">
                                     <input
                                        type="checkbox"
                                        className="mt-1 rounded text-jiu-primary focus:ring-jiu-primary"
                                        checked={mediaItem.isPublic || false}
                                        onChange={(e) => {
                                            const updatedMedia = [...(newTraining.media || [])];
                                            updatedMedia[index] = { ...mediaItem, isPublic: e.target.checked };
                                            setNewTraining({ ...newTraining, media: updatedMedia });
                                        }}
                                     />
                                     <span className="ml-2 text-xs text-gray-600 group-hover:text-gray-900 leading-tight">
                                         Publicar na Galeria do Site
                                     </span>
                                 </label>

                                 <button
                                     type="button"
                                     onClick={() => handleRemoveMedia(index)}
                                     className="self-end text-xs text-red-500 hover:text-red-700 flex items-center bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                                 >
                                     <IconTrash className="w-3 h-3 mr-1" /> Remover
                                 </button>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
           </div>

           <div className="pt-4 flex justify-end space-x-3">
                <button 
                type="button"
                onClick={() => setIsTrainingModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                Cancelar
                </button>
                <button 
                type="submit"
                className="px-4 py-2 bg-jiu-primary text-white rounded-lg hover:bg-blue-900 shadow-md transition-colors"
                >
                {newTraining.id ? "Atualizar Treino" : "Salvar Treino"}
                </button>
            </div>
        </form>
      </Modal>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl z-[60] flex items-center space-x-3 animate-bounce-in transition-all duration-300 border border-green-500">
            <div className="bg-white text-green-600 rounded-full p-1">
                <IconCheck className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">{notification}</span>
        </div>
      )}

    </div>
  );
};

export default App;
