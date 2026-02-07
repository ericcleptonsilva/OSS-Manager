

import { AppData, BeltColor, FinancialType } from './types';

export const INITIAL_DATA: AppData = {
  team: {
    id: 'team-1',
    name: 'Alliance Eagle Team',
    description: 'Focados na excelência técnica e disciplina.',
    logo: 'https://ui-avatars.com/api/?name=Alliance+Eagle&background=1e3a8a&color=fff&size=128'
  },
  academies: [
    {
      id: 'ac-1',
      name: 'Matriz Centro',
      address: 'Rua das Palmeiras, 123, Centro',
      instructorName: 'Mestre Carlos',
      schedule: [
        { 
          day: 'Segunda-feira', 
          timeRanges: [
            { openTime: '07:00', closeTime: '09:00' }, 
            { openTime: '18:00', closeTime: '22:00' }
          ] 
        },
        { 
          day: 'Terça-feira', 
          timeRanges: [{ openTime: '07:00', closeTime: '22:00' }] 
        },
        { 
          day: 'Quarta-feira', 
          timeRanges: [
            { openTime: '07:00', closeTime: '09:00' }, 
            { openTime: '18:00', closeTime: '22:00' }
          ] 
        },
        { 
          day: 'Quinta-feira', 
          timeRanges: [{ openTime: '07:00', closeTime: '22:00' }] 
        },
        { 
          day: 'Sexta-feira', 
          timeRanges: [{ openTime: '18:00', closeTime: '21:00' }] 
        }
      ],
      description: 'A maior estrutura da região, com 3 áreas de tatame e musculação inclusa.',
      logo: '',
      trainings: [
        {
          id: 'tr-1',
          date: '2023-10-25',
          duration: '01:30',
          techniques: ['Passagem de Guarda (Toreando)', 'Cem Quilos (Lateral)'],
          description: 'Foco em velocidade e controle de quadril.',
          studentIds: ['st-1', 'st-2'],
          media: []
        },
        {
          id: 'tr-2',
          date: '2023-10-27',
          duration: '01:00',
          techniques: ['Finalização: Armlock', 'Montada'],
          description: 'Armlock partindo da montada e variações.',
          studentIds: ['st-2', 'st-4'],
          media: []
        }
      ],
      financials: [
        {
          id: 'fin-1',
          studentId: 'st-1',
          type: FinancialType.MONTHLY,
          amount: 150.00,
          dueDate: '2023-10-10',
          paidDate: '2023-10-09',
          description: 'Mensalidade Outubro'
        },
        {
          id: 'fin-2',
          studentId: 'st-2',
          type: FinancialType.MONTHLY,
          amount: 150.00,
          dueDate: '2023-10-15',
          paidDate: null, // Atrasado (se hoje for > 15/10)
          description: 'Mensalidade Outubro'
        },
        {
          id: 'fin-3',
          studentId: 'st-4',
          type: FinancialType.ENROLLMENT,
          amount: 80.00,
          dueDate: '2023-10-01',
          paidDate: '2023-10-01',
          description: 'Matrícula 2023'
        },
        {
          id: 'fin-4',
          studentId: 'st-3',
          type: FinancialType.ANNUAL,
          amount: 120.00,
          dueDate: '2024-01-10',
          paidDate: null,
          description: 'Anuidade Federação'
        }
      ]
    },
    {
      id: 'ac-2',
      name: 'Unidade Sul',
      address: 'Av. Atlântica, 4500, Zona Sul',
      instructorName: 'Prof. André',
      schedule: [
        { 
          day: 'Segunda-feira', 
          timeRanges: [{ openTime: '18:00', closeTime: '21:00' }] 
        },
        { 
          day: 'Quarta-feira', 
          timeRanges: [{ openTime: '18:00', closeTime: '21:00' }] 
        },
        { 
          day: 'Sexta-feira', 
          timeRanges: [{ openTime: '18:00', closeTime: '20:00' }] 
        }
      ],
      description: 'Foco em turmas de competição e aulas particulares.',
      logo: '',
      trainings: [],
      financials: []
    }
  ],
  students: [
    {
      id: 'st-1',
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-9999',
      birthDate: '1995-05-20',
      startDate: '2023-01-15',
      belt: BeltColor.WHITE,
      degrees: 2,
      academyId: 'ac-1',
      photo: ''
    },
    {
      id: 'st-2',
      name: 'Maria Souza',
      email: 'maria@email.com',
      phone: '(11) 98888-8888',
      birthDate: '1990-10-10',
      startDate: '2020-03-10',
      belt: BeltColor.PURPLE,
      degrees: 4,
      academyId: 'ac-1',
      photo: 'https://ui-avatars.com/api/?name=Maria+Souza&background=random'
    },
    {
      id: 'st-3',
      name: 'Pedro Rocha',
      email: 'pedro@email.com',
      phone: '(21) 97777-7777',
      birthDate: '1988-12-01',
      startDate: '2015-06-20',
      belt: BeltColor.BLACK,
      degrees: 0,
      academyId: 'ac-2',
      photo: ''
    },
    {
      id: 'st-4',
      name: 'Enzo Gabriel',
      email: 'enzo@email.com',
      phone: '(11) 99999-0000',
      birthDate: '2014-05-20',
      startDate: '2022-01-15',
      belt: BeltColor.GRAY_WHITE,
      degrees: 1,
      academyId: 'ac-1',
      photo: ''
    }
  ]
};

export const BELT_STYLES: Record<BeltColor, { background: string; color: string; solid: string; borderColor?: string }> = {
  // Kids
  [BeltColor.WHITE]: { background: '#FFFFFF', color: '#000000', solid: '#F3F4F6', borderColor: '#E5E7EB' },
  
  [BeltColor.GRAY_WHITE]: { background: 'linear-gradient(to bottom, #9CA3AF 35%, #FFFFFF 35%, #FFFFFF 65%, #9CA3AF 65%)', color: '#000000', solid: '#9CA3AF' },
  [BeltColor.GRAY]: { background: '#9CA3AF', color: '#FFFFFF', solid: '#6B7280' },
  [BeltColor.GRAY_BLACK]: { background: 'linear-gradient(to bottom, #9CA3AF 35%, #1F2937 35%, #1F2937 65%, #9CA3AF 65%)', color: '#FFFFFF', solid: '#4B5563' },
  
  [BeltColor.YELLOW_WHITE]: { background: 'linear-gradient(to bottom, #FACC15 35%, #FFFFFF 35%, #FFFFFF 65%, #FACC15 65%)', color: '#000000', solid: '#FDE047' },
  [BeltColor.YELLOW]: { background: '#FACC15', color: '#000000', solid: '#EAB308' },
  [BeltColor.YELLOW_BLACK]: { background: 'linear-gradient(to bottom, #FACC15 35%, #1F2937 35%, #1F2937 65%, #FACC15 65%)', color: '#000000', solid: '#CA8A04' },
  
  [BeltColor.ORANGE_WHITE]: { background: 'linear-gradient(to bottom, #FB923C 35%, #FFFFFF 35%, #FFFFFF 65%, #FB923C 65%)', color: '#000000', solid: '#FDBA74' },
  [BeltColor.ORANGE]: { background: '#FB923C', color: '#FFFFFF', solid: '#F97316' },
  [BeltColor.ORANGE_BLACK]: { background: 'linear-gradient(to bottom, #FB923C 35%, #1F2937 35%, #1F2937 65%, #FB923C 65%)', color: '#FFFFFF', solid: '#EA580C' },
  
  [BeltColor.GREEN_WHITE]: { background: 'linear-gradient(to bottom, #22C55E 35%, #FFFFFF 35%, #FFFFFF 65%, #22C55E 65%)', color: '#000000', solid: '#86EFAC' },
  [BeltColor.GREEN]: { background: '#22C55E', color: '#FFFFFF', solid: '#16A34A' },
  [BeltColor.GREEN_BLACK]: { background: 'linear-gradient(to bottom, #22C55E 35%, #1F2937 35%, #1F2937 65%, #22C55E 65%)', color: '#FFFFFF', solid: '#15803D' },

  // Adults
  [BeltColor.BLUE]: { background: '#3B82F6', color: '#FFFFFF', solid: '#2563EB' },
  [BeltColor.PURPLE]: { background: '#A855F7', color: '#FFFFFF', solid: '#9333EA' },
  [BeltColor.BROWN]: { background: '#78350F', color: '#FFFFFF', solid: '#78350F' },
  [BeltColor.BLACK]: { background: '#000000', color: '#FFFFFF', solid: '#000000' },
  
  [BeltColor.RED_BLACK]: { background: 'linear-gradient(to right, #DC2626 50%, #000000 50%)', color: '#FFFFFF', solid: '#991B1B' },
  [BeltColor.RED_WHITE]: { background: 'linear-gradient(to right, #DC2626 50%, #FFFFFF 50%)', color: '#000000', solid: '#EF4444' },
  [BeltColor.RED]: { background: '#DC2626', color: '#FFFFFF', solid: '#B91C1C' },
};

export const BELT_GROUPS = {
  KIDS: [
    BeltColor.WHITE,
    BeltColor.GRAY_WHITE,
    BeltColor.GRAY,
    BeltColor.GRAY_BLACK,
    BeltColor.YELLOW_WHITE,
    BeltColor.YELLOW,
    BeltColor.YELLOW_BLACK,
    BeltColor.ORANGE_WHITE,
    BeltColor.ORANGE,
    BeltColor.ORANGE_BLACK,
    BeltColor.GREEN_WHITE,
    BeltColor.GREEN,
    BeltColor.GREEN_BLACK,
  ],
  ADULTS: [
    BeltColor.WHITE,
    BeltColor.BLUE,
    BeltColor.PURPLE,
    BeltColor.BROWN,
    BeltColor.BLACK,
    BeltColor.RED_BLACK,
    BeltColor.RED_WHITE,
    BeltColor.RED
  ]
};

export const WEEKDAYS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado"
];

export const JIU_JITSU_TECHNIQUES = [
  "Aquecimento / Drill",
  "Rolamento Livre",
  "Queda: Double Leg",
  "Queda: Single Leg",
  "Queda: Osoto Gari",
  "Queda: Seoi Nage",
  "Guarda Fechada",
  "Guarda Aranha",
  "Guarda De La Riva",
  "Meia Guarda",
  "Guarda Borboleta",
  "Passagem de Guarda (Toreando)",
  "Passagem de Guarda (Emborcada)",
  "Passagem de Meia Guarda",
  "Montada",
  "Cem Quilos (Lateral)",
  "Joelho na Barriga",
  "Pegada pelas Costas",
  "Finalização: Armlock",
  "Finalização: Triângulo",
  "Finalização: Omoplata",
  "Finalização: Kimura",
  "Finalização: Americana",
  "Finalização: Mata-leão",
  "Finalização: Estrangulamento de Gola",
  "Finalização: Chave de Pé",
  "Raspagem de Tesoura",
  "Raspagem de Gancho",
  "Defesa Pessoal"
];