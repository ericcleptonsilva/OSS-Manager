

import { AppData, BeltColor, FinancialType } from './types';

export const INITIAL_DATA: AppData = {
  team: {
    id: '',
    name: '',
    description: '',
    logo: ''
  },
  academies: [],
  students: []
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