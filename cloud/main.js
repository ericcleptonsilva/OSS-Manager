
/* 
  COPIE ESTE CONTEÚDO PARA O ARQUIVO main.js NO CLOUD CODE DO BACK4APP 
*/

Parse.Cloud.define("analyzeTeam", async (request) => {
  const { academyName, instructorName, students } = request.params;

  // Verifica se a chave está configurada nas Variáveis de Ambiente do Back4App
  if (!process.env.GEMINI_API_KEY) {
    throw new Parse.Error(500, "A chave GEMINI_API_KEY não está configurada no servidor.");
  }

  // 1. Processar dados (Resumo estatístico para economizar tokens)
  const beltCount = {};
  students.forEach(s => {
    const belt = s.belt || 'Branca';
    beltCount[belt] = (beltCount[belt] || 0) + 1;
  });

  const beltSummary = Object.entries(beltCount)
    .map(([belt, count]) => `- ${belt}: ${count}`)
    .join('\n');

  // 2. Montar o Prompt
  const prompt = `
    Você é um mestre estrategista de Jiu-Jitsu e gestor de equipes esportivas.
    Analise os dados da academia "${academyName || 'Desconhecida'}" liderada por "${instructorName || 'Mestre'}".
    
    Distribuição de faixas:
    ${beltSummary}
    Total de alunos analisados: ${students.length}

    Forneça:
    1. Resumo do perfil da turma (iniciante, avançada, infantil, etc).
    2. Sugestão técnica para a semana.
    3. Frase motivacional "OSS".

    Seja breve e use Markdown.
  `;

  // 3. Chamar API do Google Gemini via REST (Fetch)
  // O Node.js do Back4App suporta fetch nativamente nas versões recentes ou axios.
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error: ${errorText}`);
    }

    const data = await response.json();
    
    // Extrair texto da resposta
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return "Não foi possível gerar uma análise com os dados fornecidos.";
    }

  } catch (error) {
    console.error("Erro no Cloud Code analyzeTeam:", error);
    throw new Parse.Error(500, "Falha ao conectar com a IA no servidor.");
  }
});
