

export enum BeltColor {
  // Infantil (04-15 anos)
  WHITE = 'Branca',
  GRAY_WHITE = 'Cinza e Branca',
  GRAY = 'Cinza',
  GRAY_BLACK = 'Cinza e Preta',
  YELLOW_WHITE = 'Amarela e Branca',
  YELLOW = 'Amarela',
  YELLOW_BLACK = 'Amarela e Preta',
  ORANGE_WHITE = 'Laranja e Branca',
  ORANGE = 'Laranja',
  ORANGE_BLACK = 'Laranja e Preta',
  GREEN_WHITE = 'Verde e Branca',
  GREEN = 'Verde',
  GREEN_BLACK = 'Verde e Preta',

  // Adulto (16+ anos) - Branca já listada acima
  BLUE = 'Azul',
  PURPLE = 'Roxa',
  BROWN = 'Marrom',
  BLACK = 'Preta',
  RED_BLACK = 'Vermelha e Preta',
  RED_WHITE = 'Vermelha e Branca',
  RED = 'Vermelha'
}

export enum FinancialType {
  MONTHLY = 'Mensalidade',
  ENROLLMENT = 'Matrícula',
  ANNUAL = 'Anuidade',
  OTHER = 'Outro'
}

export interface TrainingMedia {
  type: 'image' | 'video';
  data: string; // Base64
  isPublic?: boolean;
}

export interface TrainingSession {
  id: string;
  date: string;
  duration: string; // ex: "1h 30min"
  techniques: string[]; // Lista de técnicas treinadas no dia
  description: string;
  media: TrainingMedia[]; // Lista de fotos ou vídeos
  studentIds: string[]; // Lista de presença (IDs dos alunos)
}

export interface FinancialTransaction {
  id: string;
  studentId: string;
  type: FinancialType;
  amount: number;
  dueDate: string; // Data de vencimento
  paidDate?: string | null; // Data do pagamento (se null, está em aberto)
  description?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  startDate: string;
  belt: BeltColor;
  degrees: number; // 0 a 4 graus
  academyId: string;
  photo?: string; // Base64 da foto do aluno
  // Dados do Responsável (se menor de idade)
  guardianName?: string;
  guardianPhone?: string;
  guardianCpf?: string;
}

export interface TimeRange {
  openTime: string;
  closeTime: string;
}

export interface AcademySchedule {
  day: string;
  timeRanges: TimeRange[];
}

export interface Academy {
  id: string;
  name: string;
  address: string;
  instructorName: string;
  schedule: AcademySchedule[]; // Lista de dias e horários específicos
  description?: string;
  logo?: string;
  allowedEmails?: string[]; // Lista de emails permitidos para gerenciar a academia
  adminPassword?: string; // Senha para acesso do professor
  trainings: TrainingSession[]; // Histórico de aulas da academia
  financials: FinancialTransaction[]; // Histórico financeiro
}

export interface Team {
  id: string;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  adminEmail?: string;
  adminPassword?: string;
}

export interface AppData {
  team: Team;
  academies: Academy[];
  students: Student[];
}