
import Parse from 'parse';
import { AppData, Academy, Student, TrainingSession, FinancialTransaction, Team, BeltColor } from '../types';
import { INITIAL_DATA } from '../constants';

// --- CONFIGURAÇÃO ---
const PARSE_APP_ID = import.meta.env.VITE_PARSE_APP_ID;
const PARSE_JS_KEY = import.meta.env.VITE_PARSE_JS_KEY;

export const initializeParse = () => {
  if (!PARSE_APP_ID || !PARSE_JS_KEY) {
    const msg = "[Back4App] Credenciais ausentes! Verifique o arquivo .env (VITE_PARSE_APP_ID e VITE_PARSE_JS_KEY).";
    console.error(msg);
    throw new Error(msg);
  }
  Parse.initialize(PARSE_APP_ID, PARSE_JS_KEY);
  Parse.serverURL = 'https://parseapi.back4app.com/';
  console.log('[Back4App] Parse inicializado com sucesso.');
};

// --- HELPERS ---

// Converte objeto Parse para nossa interface Academy
const mapAcademy = (obj: Parse.Object): Academy => ({
  id: obj.id,
  name: obj.get('name'),
  address: obj.get('address'),
  instructorName: obj.get('instructorName'),
  description: obj.get('description'),
  logo: obj.get('logo'),
  schedule: obj.get('schedule') || [],
  allowedEmails: obj.get('allowedEmails') || [],
  adminPassword: obj.get('adminPassword'),
  trainings: [], // Serão populados separadamente
  financials: [] // Serão populados separadamente
});

// Secure mapper for public views (excludes credentials)
const mapPublicAcademy = (obj: Parse.Object): Academy => ({
  id: obj.id,
  name: obj.get('name'),
  address: obj.get('address'),
  instructorName: obj.get('instructorName'),
  description: obj.get('description'),
  logo: obj.get('logo'),
  schedule: obj.get('schedule') || [],
  allowedEmails: [], // Hidden
  adminPassword: '', // Hidden
  trainings: [],
  financials: []
});

// Converte objeto Parse para nossa interface Student
const mapStudent = (obj: Parse.Object): Student => ({
  id: obj.id,
  name: obj.get('name'),
  email: obj.get('email'),
  phone: obj.get('phone'),
  birthDate: obj.get('birthDate'),
  startDate: obj.get('startDate'),
  belt: obj.get('belt') as BeltColor,
  degrees: obj.get('degrees'),
  academyId: obj.get('academy') ? obj.get('academy').id : '',
  photo: obj.get('photo'),
  password: obj.get('password'),
  progressStars: obj.get('progressStars') || 0,
  guardianName: obj.get('guardianName'),
  guardianPhone: obj.get('guardianPhone'),
  guardianCpf: obj.get('guardianCpf'),
});

// --- ACTIONS ---

export const loginUser = async (email: string, pass: string) => {
  try {
    const user = await Parse.User.logIn(email, pass);
    return user;
  } catch (error) {
    throw error;
  }
};



export const logoutUser = async () => {
  await Parse.User.logOut();
};

export const getCurrentUser = () => {
  return Parse.User.current();
};

// Função para popular o DB com dados iniciais se estiver vazio
export const seedInitialData = async () => {
  // Verifica se já existem academias
  const query = new Parse.Query('Academy');
  const count = await query.count();

  if (count > 0) return; // Já tem dados, não faz nada

  console.log("Semeando banco de dados com dados iniciais...");

  // 1. Salvar Time
  const TeamClass = Parse.Object.extend('Team');
  const team = new TeamClass();
  team.set('name', INITIAL_DATA.team.name);
  team.set('description', INITIAL_DATA.team.description);
  // team.set('logo', INITIAL_DATA.team.logo); // Ignorar logo base64 grande para evitar erro de tamanho no seed
  await team.save();

  // 2. Salvar Academias
  const createdAcademies: Record<string, Parse.Object> = {};

  for (const acData of INITIAL_DATA.academies) {
    const acObj = new Parse.Object('Academy');
    acObj.set('name', acData.name);
    acObj.set('address', acData.address);
    acObj.set('instructorName', acData.instructorName);
    acObj.set('schedule', acData.schedule);
    acObj.set('description', acData.description);
    await acObj.save();
    createdAcademies[acData.id] = acObj; // Map old ID to new Object
  }

  // 3. Salvar Alunos
  const createdStudents: Record<string, Parse.Object> = {};

  for (const stData of INITIAL_DATA.students) {
    const stObj = new Parse.Object('Student');
    stObj.set('name', stData.name);
    stObj.set('email', stData.email);
    stObj.set('belt', stData.belt);
    stObj.set('degrees', stData.degrees);
    stObj.set('startDate', stData.startDate);
    stObj.set('phone', stData.phone);

    // Link Academy
    if (createdAcademies[stData.academyId]) {
      stObj.set('academy', createdAcademies[stData.academyId]);
    }

    await stObj.save();
    createdStudents[stData.id] = stObj;
  }

  console.log("Dados iniciais criados com sucesso!");
  return true;
};

// Função principal para carregar TODOS os dados e montar a estrutura AppData
// Isso substitui o carregamento do localStorage
export const fetchFullData = async (): Promise<AppData> => {
  try {
    // 1. Fetch Team (Singleton for this app mostly)
    const teamQuery = new Parse.Query('Team');
    const teamObj = await teamQuery.first();
    let team: Team;

    if (teamObj) {
      team = {
        id: teamObj.id,
        name: teamObj.get('name'),
        description: teamObj.get('description'),
        logo: teamObj.get('logo'),
        banner: teamObj.get('banner'),
        adminEmail: teamObj.get('adminEmail'),
        adminPassword: teamObj.get('adminPassword')
      };
    } else {
      team = INITIAL_DATA.team; // Fallback
    }

    // 2. Fetch Academies
    const academyQuery = new Parse.Query('Academy');
    const academyObjs = await academyQuery.find();
    const academies = academyObjs.map(mapAcademy);

    // 3. Fetch Students
    const studentQuery = new Parse.Query('Student');
    const studentObjs = await studentQuery.limit(1000).find();
    const students = studentObjs.map(mapStudent);

    // 4. Fetch Trainings & Financials and attach to Academies

    let trainingObjs: Parse.Object[] = [];
    try {
      const trainingQuery = new Parse.Query('TrainingSession');
      // IMPORTANT: Do NOT use .descending('date') here!
      // Reason: TrainingSession docs contain large base64 'media' fields.
      // MongoDB exceeds its 32MB RAM sort limit without an index on 'date'.
      // Fix #1 (code): Remove server-side sort — sort on the client below instead.
      // Fix #2 (Back4App): Add an index on the 'date' field via Index Manager.
      trainingObjs = await trainingQuery.limit(100).find();
      // Sort client-side by date descending (newest first)
      trainingObjs.sort((a, b) => {
        const da = a.get('date') || '';
        const db = b.get('date') || '';
        return db.localeCompare(da);
      });
    } catch (trainingError) {
      console.warn('[Back4App] Falha ao carregar treinos (TrainingSession):', trainingError);
      // Continue without trainings — other data still loads
    }

    const financialQuery = new Parse.Query('FinancialTransaction');
    const financialObjs = await financialQuery.limit(1000).descending('dueDate').find();

    // Distribute data to academies
    academies.forEach(ac => {
      ac.trainings = trainingObjs
        .filter(t => t.get('academy') && t.get('academy').id === ac.id)
        .map(t => ({
          id: t.id,
          date: t.get('date'),
          duration: t.get('duration'),
          techniques: t.get('techniques') || [],
          description: t.get('description'),
          media: t.get('media') || [],
          studentIds: t.get('studentIds') || []
        }));

      const academyStudentIds = students.filter(s => s.academyId === ac.id).map(s => s.id);

      ac.financials = financialObjs
        .filter(f => {
          const sId = f.get('student') ? f.get('student').id : null;
          return sId && academyStudentIds.includes(sId);
        })
        .map(f => ({
          id: f.id,
          studentId: f.get('student').id,
          type: f.get('type'),
          amount: f.get('amount'),
          dueDate: f.get('dueDate'),
          paidDate: f.get('paidDate'),
          description: f.get('description'),
          createdAt: f.createdAt ? f.createdAt.toISOString() : undefined,
          updatedAt: f.updatedAt ? f.updatedAt.toISOString() : undefined,
        }));
    });

    return {
      team,
      academies,
      students
    };

  } catch (error) {
    console.error("Erro ao buscar dados do Parse:", error);
    throw error; // Propaga o erro para a UI exibir mensagem adequada
  }
};

export const fetchPublicData = async (): Promise<{ team: Team, academies: Academy[] }> => {
  try {
    // 1. Fetch Team
    const teamQuery = new Parse.Query('Team');
    const teamObj = await teamQuery.first();
    let team: Team;

    if (teamObj) {
      team = {
        id: teamObj.id,
        name: teamObj.get('name'),
        description: teamObj.get('description'),
        logo: teamObj.get('logo'),
        banner: teamObj.get('banner'),
        adminEmail: '', // Hidden in public
        adminPassword: '' // Hidden in public
      };
    } else {
      team = INITIAL_DATA.team;
    }

    // 2. Fetch Academies (Basic Info Only)
    const academyQuery = new Parse.Query('Academy');
    const academyObjs = await academyQuery.find();
    const academies = academyObjs.map(mapPublicAcademy);

    return { team, academies };

  } catch (error) {
    console.error("Erro ao buscar dados públicos:", error);
    return { team: INITIAL_DATA.team, academies: [] };
  }
};

// --- SAVING FUNCTIONS ---

export const saveStudent = async (studentData: Partial<Student>) => {
  const StudentClass = Parse.Object.extend('Student');
  const student = new StudentClass();

  if (studentData.id && !studentData.id.startsWith('st-')) {
    student.id = studentData.id;
  }

  student.set('name', studentData.name);
  student.set('email', studentData.email);
  student.set('phone', studentData.phone);
  student.set('birthDate', studentData.birthDate);
  student.set('startDate', studentData.startDate);
  student.set('belt', studentData.belt);
  student.set('degrees', studentData.degrees);
  student.set('photo', studentData.photo);
  if (studentData.password) student.set('password', studentData.password);
  if (studentData.progressStars !== undefined) student.set('progressStars', studentData.progressStars);
  student.set('guardianName', studentData.guardianName);
  student.set('guardianPhone', studentData.guardianPhone);
  student.set('guardianCpf', studentData.guardianCpf);

  // Pointer to Academy
  if (studentData.academyId) {
    const AcademyClass = Parse.Object.extend('Academy');
    const academy = new AcademyClass();
    academy.id = studentData.academyId;
    student.set('academy', academy);
  }

  await student.save();
  return mapStudent(student);
};

export const saveAcademy = async (academyData: Partial<Academy>) => {
  const AcademyClass = Parse.Object.extend('Academy');
  const academy = new AcademyClass();

  if (academyData.id && !academyData.id.startsWith('ac-')) {
    academy.id = academyData.id;
  }

  academy.set('name', academyData.name);
  academy.set('address', academyData.address);
  academy.set('instructorName', academyData.instructorName);
  academy.set('description', academyData.description);
  academy.set('logo', academyData.logo);
  academy.set('schedule', academyData.schedule);
  if (academyData.allowedEmails) {
    academy.set('allowedEmails', academyData.allowedEmails);
  }
  if (academyData.adminPassword) {
    academy.set('adminPassword', academyData.adminPassword);
  }

  await academy.save();
  // Return minimal for UI update, fetchFullData syncs perfectly later
  return academyData;
};

export const saveTraining = async (trainingData: Partial<TrainingSession>, academyId: string) => {
  const TrainingClass = Parse.Object.extend('TrainingSession');
  const training = new TrainingClass();

  if (trainingData.id && !trainingData.id.startsWith('tr-')) {
    training.id = trainingData.id;
  }

  training.set('date', trainingData.date);
  training.set('duration', trainingData.duration);
  training.set('techniques', trainingData.techniques);
  training.set('description', trainingData.description);
  training.set('media', trainingData.media); // Saving base64 arrays directly (caution with size)
  training.set('studentIds', trainingData.studentIds);

  const AcademyClass = Parse.Object.extend('Academy');
  const academy = new AcademyClass();
  academy.id = academyId;
  training.set('academy', academy);

  await training.save();
  return training;
};

export const saveTransaction = async (txData: Partial<FinancialTransaction>) => {
  const TransactionClass = Parse.Object.extend('FinancialTransaction');
  const tx = new TransactionClass();

  if (txData.id && !txData.id.startsWith('fin-')) {
    tx.id = txData.id;
  }

  tx.set('type', txData.type);
  tx.set('amount', txData.amount);
  tx.set('dueDate', txData.dueDate);
  tx.set('paidDate', txData.paidDate);
  tx.set('description', txData.description);

  if (txData.studentId) {
    const StudentClass = Parse.Object.extend('Student');
    const student = new StudentClass();
    student.id = txData.studentId;
    tx.set('student', student);
  }

  await tx.save();
  return tx;
};

export const deleteObject = async (className: string, objectId: string) => {
  const Obj = Parse.Object.extend(className);
  const query = new Parse.Query(Obj);
  const obj = await query.get(objectId);
  await obj.destroy();
};

export const deleteAllTransactionsForStudent = async (studentId: string) => {
  // Query all transactions for this student
  const TransactionClass = Parse.Object.extend('FinancialTransaction');
  const query = new Parse.Query(TransactionClass);

  const StudentClass = Parse.Object.extend('Student');
  const student = new StudentClass();
  student.id = studentId;

  query.equalTo('student', student);
  const results = await query.limit(1000).find();

  // Bulk destroy
  await Parse.Object.destroyAll(results);
};

export const saveTeam = async (teamData: Partial<Team>) => {
  const TeamClass = Parse.Object.extend('Team');
  let team;

  // Se tiver ID, usa. Senão, tenta buscar o primeiro registro de Team (Single Team App)
  if (teamData.id) {
    try {
      const query = new Parse.Query(TeamClass);
      team = await query.get(teamData.id);
    } catch (e) {
      // Se não achar pelo ID, cria um novo
      team = new TeamClass();
    }
  } else {
    const query = new Parse.Query(TeamClass);
    team = await query.first();
    if (!team) {
      team = new TeamClass();
    }
  }

  team.set('name', teamData.name);
  team.set('description', teamData.description);
  if (teamData.logo) {
    team.set('logo', teamData.logo);
  }
  if (teamData.banner) {
    team.set('banner', teamData.banner);
  }
  if (teamData.adminEmail) {
    team.set('adminEmail', teamData.adminEmail);
  }
  if (teamData.adminPassword) {
    team.set('adminPassword', teamData.adminPassword);
  }

  await team.save();
  return {
    id: team.id,
    name: team.get('name'),
    description: team.get('description'),
    logo: team.get('logo'),
    banner: team.get('banner'),
    adminEmail: team.get('adminEmail'),
    adminPassword: team.get('adminPassword')
  };
};
export const performCustomLogin = async (email: string, pass: string): Promise<Parse.User> => {
  try {
    // 1. Try Standard Parse Login (_User class)
    try {
      const user = await Parse.User.logIn(email, pass);
      // Determine role: check 'role' field first, then Parse.Role
      let role = user.get('role') as string | undefined;
      if (!role) {
        try {
          const roleQuery = new Parse.Query(Parse.Role);
          roleQuery.equalTo('users', user);
          const roles = await roleQuery.find();
          if (roles.length > 0) {
            // Map first matching role name to our role system
            const roleName = roles[0].get('name') as string;
            if (roleName === 'admin' || roleName === 'Admin') role = 'admin';
            else if (roleName === 'professor' || roleName === 'Professor') role = 'professor';
            else role = 'student';
          } else {
            // Parse User with no role = treat as admin (backward compat)
            role = 'admin';
          }
        } catch {
          role = 'admin'; // fallback
        }
      }
      user.set('role', role);
      return user;
    } catch (e: any) {
      // Ignore code 101 (Invalid login) to try other methods, rethrow others
      if (e.code !== 101) throw e;
    }

    // 2. Try Team Admin Login
    const teamQuery = new Parse.Query('Team');
    const team = await teamQuery.first();
    const normalizedInputEmail = email.trim().toLowerCase();

    if (team) {
      const teamEmail = team.get('adminEmail');
      const teamPass = team.get('adminPassword');
      if (teamEmail && teamPass && teamEmail.toLowerCase() === normalizedInputEmail && teamPass === pass) {
        const mockUser = new Parse.User();
        mockUser.id = 'admin-user';
        mockUser.set('email', teamEmail);
        mockUser.set('username', 'Admin');
        mockUser.set('role', 'admin');
        return mockUser;
      }
    }

    // 3. Try Academy (Professor) Login via allowedEmails + academy adminPassword
    const academyQuery = new Parse.Query('Academy');
    const academies = await academyQuery.find();

    // Check old method first
    for (const academy of academies) {
      const allowedEmails = (academy.get('allowedEmails') || []) as string[];
      const academyPass = academy.get('adminPassword');
      const normalizedInputEmail = email.trim().toLowerCase();
      const isEmailAllowed = allowedEmails.some(e => e.trim().toLowerCase() === normalizedInputEmail);
      if (isEmailAllowed && academyPass === pass) {
        const mockUser = new Parse.User();
        mockUser.id = `user-${academy.id}`;
        mockUser.set('email', email);
        mockUser.set('username', academy.get('instructorName') || 'Professor');
        mockUser.set('academyId', academy.id);
        mockUser.set('role', 'professor');
        return mockUser;
      }
    }

    // 4. Try ProfessorAccount Login (new explicit professor accounts)
    const profQuery = new Parse.Query('ProfessorAccount');
    const normalizedInputEmailProf = email.trim().toLowerCase();
    const profAccounts = await profQuery.find();
    const matchingProf = profAccounts.find(p => p.get('email')?.toLowerCase() === normalizedInputEmailProf && p.get('password') === pass);

    if (matchingProf) {
      const mockUser = new Parse.User();
      mockUser.id = `prof-${matchingProf.id}`;
      mockUser.set('email', matchingProf.get('email'));
      mockUser.set('username', matchingProf.get('name') || 'Professor');
      mockUser.set('role', 'professor');
      return mockUser;
    }

    // 5. Try Student Login
    const studentQuery = new Parse.Query('Student');
    studentQuery.equalTo('email', email);
    studentQuery.equalTo('password', pass);
    const student = await studentQuery.first();
    if (student) {
      const mockUser = new Parse.User();
      mockUser.id = student.id;
      mockUser.set('email', student.get('email'));
      mockUser.set('username', student.get('name'));
      mockUser.set('academyId', student.get('academy')?.id);
      mockUser.set('role', 'student');
      return mockUser;
    }

    throw new Parse.Error(101, "Email ou senha inválidos.");

  } catch (error) {
    throw error;
  }
};

// Cadastro de novo usuário via Parse User
export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<Parse.User> => {
  const user = new Parse.User();
  user.set('username', email); // Parse requer username único
  user.set('email', email);
  user.set('password', password);
  user.set('name', name);
  user.set('role', 'student'); // Padrão: aluno. Admin pode promover depois.
  await user.signUp();
  return user;
};

export const saveProfessorAccount = async (email: string, name: string, password?: string): Promise<Parse.Object> => {
  const query = new Parse.Query('ProfessorAccount');
  query.equalTo('email', email.trim().toLowerCase());
  let account = await query.first();
  if (!account) {
    account = new Parse.Object('ProfessorAccount');
  }

  account.set('email', email.trim().toLowerCase());
  if (name) account.set('name', name);
  if (password) account.set('password', password);

  return await account.save();
};
