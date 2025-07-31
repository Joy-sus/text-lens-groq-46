
import axios from 'axios';

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface AnalysisResult {
  aiProbability: number;
  writingStyle: string;
  writingApproach: string;
  competenceLevel: string;
  authorLikelihood: string;
  comments: string;
}

export const analyzeText = async (
  question: string,
  answerText: string,
  judgingCriteria?: string,
  isCriticalMode: boolean = true
): Promise<AnalysisResult> => {
  try {
    const prompt = createAnalysisPrompt(question, answerText, judgingCriteria, isCriticalMode);
    
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: isCriticalMode 
              ? 'You are a highly critical expert text analyst specializing in detecting AI-generated content. You have extensive experience in academic writing analysis and are known for your rigorous standards. Be thorough and demanding in your assessments.'
              : 'You are an experienced and fair text analyst specializing in balanced content evaluation. You provide thorough analysis while being reasonable and objective in your assessments, giving both human and AI-generated content fair consideration.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1500,
        top_p: 0.9,
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const analysisText = response.data.choices[0].message.content;
    console.log('Raw API Response:', analysisText);
    return parseAnalysisResponse(analysisText, isCriticalMode);
  } catch (error) {
    console.error('GROQ API Error:', error);
    throw new Error('Failed to analyze text with GROQ API');
  }
};

const createAnalysisPrompt = (
  question: string,
  answerText: string,
  judgingCriteria?: string,
  isCriticalMode: boolean = true
): string => {
  const analysisApproach = isCriticalMode 
    ? `**CRITICAL ANALYSIS REQUIREMENTS:**
You must be highly critical and thorough. Look for:
- Generic phrases and clichéd expressions
- Perfect structure that lacks human spontaneity
- Absence of personal voice or authentic mistakes
- Overly balanced arguments without genuine bias
- Formulaic transitions and conclusions
- Lack of genuine emotional depth or personal experience

Set your standards high and be demanding in your evaluation.`
    : `**BALANCED ANALYSIS REQUIREMENTS:**
You should be thorough but fair in your assessment. Look for:
- Natural writing patterns and authentic voice
- Reasonable structure and organization
- Appropriate vocabulary and complexity for the context
- Genuine engagement with the topic
- Balance between polish and authenticity
- Consider both human and AI capabilities objectively

Provide a balanced evaluation that considers the context and purpose.`;

  return `
You are analyzing this text response with ${isCriticalMode ? 'critical scrutiny' : 'balanced objectivity'}. Provide a comprehensive evaluation using ${isCriticalMode ? 'demanding' : 'fair'} standards.

**Question/Prompt:**
${question}

**Answer Text to Analyze:**
${answerText}

${judgingCriteria ? `**Judging Criteria:**\n${judgingCriteria}\n` : ''}

${analysisApproach}

**MANDATORY OUTPUT FORMAT:**
Return your analysis in this exact JSON format with NO additional text:

{
  "aiProbability": <number 0-100>,
  "writingStyle": "<EXACTLY ONE OF: Narrative, Expository, Descriptive, Persuasive, Analytical, Reflective, Satirical, Didactic>",
  "writingApproach": "<EXACTLY ONE OF: Chronological, Problem-Solution, Compare-Contrast, Inductive, Deductive, Stream of Consciousness, Fragmented>",
  "competenceLevel": "<EXACTLY ONE OF: Basic, Intermediate, Advanced, Expert, Formulaic>",
  "authorLikelihood": "<EXACTLY: Human OR AI>",
  "comments": "<detailed ${isCriticalMode ? 'critical' : 'balanced'} analysis explaining your reasoning>"
}

**CLASSIFICATION REQUIREMENTS:**

1. **AI Probability (0-100%)**: ${isCriticalMode 
    ? 'Be critical. Look for repetitive patterns, generic language, perfect grammar, lack of personal voice, and formulaic organization.' 
    : 'Be objective. Assess genuine markers of AI generation while considering that humans can also write polished, well-structured content.'}

2. **Writing Style**: Choose the DOMINANT style from: Narrative, Expository, Descriptive, Persuasive, Analytical, Reflective, Satirical, Didactic

3. **Writing Approach**: Choose the PRIMARY organizational method from: Chronological, Problem-Solution, Compare-Contrast, Inductive, Deductive, Stream of Consciousness, Fragmented

4. **Competence Level**: 
   - Basic: Simple vocabulary, basic structure, obvious errors
   - Intermediate: Good structure, varied vocabulary, minor issues
   - Advanced: Sophisticated language, complex ideas, polished
   - Expert: Exceptional skill, nuanced understanding, masterful execution
   - Formulaic: Following templates, predictable patterns, AI-like structure

5. **Author Likelihood**: Human or AI based on ${isCriticalMode ? 'critical' : 'balanced'} assessment

6. **Comments**: Provide specific examples and ${isCriticalMode ? 'demanding but fair criticism' : 'balanced, objective analysis'}

Return ONLY the JSON object. No markdown formatting, no additional text.
`;
};

const parseAnalysisResponse = (responseText: string, isCriticalMode: boolean): AnalysisResult => {
  try {
    console.log('Parsing response:', responseText);
    
    // Remove any markdown formatting and extract JSON
    let cleanText = responseText.trim();
    cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find JSON object in the response
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const jsonString = jsonMatch[0];
    console.log('Extracted JSON:', jsonString);
    
    const parsed = JSON.parse(jsonString);
    console.log('Parsed object:', parsed);
    
    // Validate required fields and provide defaults if needed
    const validStyles = ['Narrative', 'Expository', 'Descriptive', 'Persuasive', 'Analytical', 'Reflective', 'Satirical', 'Didactic'];
    const validApproaches = ['Chronological', 'Problem-Solution', 'Compare-Contrast', 'Inductive', 'Deductive', 'Stream of Consciousness', 'Fragmented'];
    const validCompetence = ['Basic', 'Intermediate', 'Advanced', 'Expert', 'Formulaic'];
    
    return {
      aiProbability: Math.max(0, Math.min(100, parsed.aiProbability || (isCriticalMode ? 75 : 50))),
      writingStyle: validStyles.includes(parsed.writingStyle) ? parsed.writingStyle : 'Expository',
      writingApproach: validApproaches.includes(parsed.writingApproach) ? parsed.writingApproach : 'Deductive',
      competenceLevel: validCompetence.includes(parsed.competenceLevel) ? parsed.competenceLevel : (isCriticalMode ? 'Formulaic' : 'Intermediate'),
      authorLikelihood: (parsed.authorLikelihood === 'Human' || parsed.authorLikelihood === 'AI') ? parsed.authorLikelihood : (isCriticalMode ? 'AI' : 'Human'),
      comments: parsed.comments || `Analysis completed with ${isCriticalMode ? 'critical' : 'balanced'} standards applied.`,
    };
  } catch (error) {
    console.error('Failed to parse analysis response:', error);
    console.error('Raw response was:', responseText);
    
    // Return fallback values based on mode
    return {
      aiProbability: isCriticalMode ? 85 : 50,
      writingStyle: 'Expository',
      writingApproach: 'Deductive',
      competenceLevel: isCriticalMode ? 'Formulaic' : 'Intermediate',
      authorLikelihood: isCriticalMode ? 'AI' : 'Human',
      comments: `Unable to complete full analysis due to parsing error. Text shows characteristics assessed with ${isCriticalMode ? 'critical' : 'balanced'} standards.`,
    };
  }
};
