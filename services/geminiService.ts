
import Parse from 'parse';
import { Student, Academy } from "../types";

// Agora chamamos a função no servidor (Cloud Code)
// Isso protege sua API Key e centraliza a lógica
export const generateTeamAnalysis = async (academy: Academy, students: Student[]) => {
  try {
    // Preparamos um payload mais leve apenas com o necessário para a análise
    // Evita enviar dados sensíveis desnecessários ou objetos muito grandes
    const studentsPayload = students.map(s => ({
      belt: s.belt
    }));

    const result = await Parse.Cloud.run('analyzeTeam', {
      academyName: academy.name,
      instructorName: academy.instructorName,
      students: studentsPayload
    });
    
    return result as string;

  } catch (error: any) {
    console.error("Erro ao chamar Cloud Code:", error);
    
    if (error.code === 141) {
       return "Erro no servidor: Verifique se a GEMINI_API_KEY foi configurada no Back4App.";
    }
    
    return "Não foi possível gerar a análise. Verifique sua conexão ou tente novamente mais tarde.";
  }
};
