
import Parse from 'parse';
import { AppData, Academy, Student, TrainingSession, FinancialTransaction, Team, BeltColor } from '../types';
import { INITIAL_DATA } from '../constants';

// --- CONFIGURAÇÃO ---
// IMPORTANTE: Substitua estas chaves pelas chaves do seu painel no Back4App
const PARSE_APP_ID = 'tSwKlqOexCKWESqHycKZLhia9AKM41Dhg4UW6v1p';
const PARSE_JS_KEY = 'yQA8RsPUdifmE5ANBOmqEMqmhksYNbjYj9T0g9Sn';

export const initializeParse = () => {
  Parse.initialize(PARSE_APP_ID, PARSE_JS_KEY);
  Parse.serverURL = 'https://parseapi.back4app.com/';
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
  trainings: [], // Serão populados separadamente
  financials: [] // Serão populados separadamente
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

export const registerUser = async (email: string, pass: string) => {
  const user = new Parse.User();
  user.set("username", email); // Usamos email como username
  user.set("password", pass);
  user.set("email", email);
  
  try {
    await user.signUp();
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
        logo: teamObj.get('logo')
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
    // Note: Em um app maior, faríamos isso sob demanda, mas aqui vamos carregar tudo para manter a estrutura do App.tsx
    
    const trainingQuery = new Parse.Query('TrainingSession');
    const trainingObjs = await trainingQuery.limit(1000).descending('date').find();
    
    const financialQuery = new Parse.Query('FinancialTransaction');
    const financialObjs = await financialQuery.limit(1000).descending('dueDate').find();

    // Distribute data to academies
    academies.forEach(ac => {
      // Filter trainings for this academy (assumindo que o treino tem ponteiro para academia)
      ac.trainings = trainingObjs
        .filter(t => t.get('academy') && t.get('academy').id === ac.id)
        .map(t => ({
          id: t.id,
          date: t.get('date'),
          duration: t.get('duration'),
          techniques: t.get('techniques') || [],
          description: t.get('description'),
          media: t.get('media') || [], // Base64 strings stored in array
          studentIds: t.get('studentIds') || []
        }));

      // Filter financials based on students belonging to this academy
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
          description: f.get('description')
        }));
    });

    return {
      team,
      academies,
      students
    };

  } catch (error) {
    console.error("Erro ao buscar dados do Parse:", error);
    return INITIAL_DATA; // Fallback graceful
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
        logo: teamObj.get('logo')
      };
    } else {
      team = INITIAL_DATA.team;
    }

    // 2. Fetch Academies (Basic Info Only)
    const academyQuery = new Parse.Query('Academy');
    const academyObjs = await academyQuery.find();
    const academies = academyObjs.map(mapAcademy);

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
