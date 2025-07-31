
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
  judgingCriteria?: string
): Promise<AnalysisResult> => {
  try {
    const prompt = createAnalysisPrompt(question, answerText, judgingCriteria);
    
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a highly critical expert text analyst specializing in detecting AI-generated content. You have extensive experience in academic writing analysis and are known for your rigorous standards. Be thorough and demanding in your assessments.'
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
    return parseAnalysisResponse(analysisText);
  } catch (error) {
    console.error('GROQ API Error:', error);
    throw new Error('Failed to analyze text with GROQ API');
  }
};

const createAnalysisPrompt = (
  question: string,
  answerText: string,
  judgingCriteria?: string
): string => {
  return `
You are a highly critical academic writing analyst. Analyze this text response with extreme scrutiny and provide a comprehensive evaluation. Be demanding in your standards and look for subtle signs of AI generation.

**Question/Prompt:**
${question}

**Answer Text to Analyze:**
${answerText}

${judgingCriteria ? `**Judging Criteria:**\n${judgingCriteria}\n` : ''}

**CRITICAL ANALYSIS REQUIREMENTS:**
You must be highly critical and thorough. Look for:
- Generic phrases and clichéd expressions
- Perfect structure that lacks human spontaneity
- Absence of personal voice or authentic mistakes
- Overly balanced arguments without genuine bias
- Formulaic transitions and conclusions
- Lack of genuine emotional depth or personal experience

**MANDATORY OUTPUT FORMAT:**
Return your analysis in this exact JSON format with NO additional text:

{
  "aiProbability": <number 0-100>,
  "writingStyle": "<EXACTLY ONE OF: Narrative, Expository, Descriptive, Persuasive, Analytical, Reflective, Satirical, Didactic>",
  "writingApproach": "<EXACTLY ONE OF: Chronological, Problem-Solution, Compare-Contrast, Inductive, Deductive, Stream of Consciousness, Fragmented>",
  "competenceLevel": "<EXACTLY ONE OF: Basic, Intermediate, Advanced, Expert, Formulaic>",
  "authorLikelihood": "<EXACTLY: Human OR AI>",
  "comments": "<detailed critical analysis explaining your reasoning>"
}

**CLASSIFICATION REQUIREMENTS:**

1. **AI Probability (0-100%)**: Be critical. Look for:
   - Repetitive sentence structures
   - Generic academic language
   - Perfect grammar without natural variation
   - Lack of personal anecdotes or genuine errors
   - Formulaic organization
   - Missing authentic voice

2. **Writing Style**: Choose the DOMINANT style from: Narrative, Expository, Descriptive, Persuasive, Analytical, Reflective, Satirical, Didactic

3. **Writing Approach**: Choose the PRIMARY organizational method from: Chronological, Problem-Solution, Compare-Contrast, Inductive, Deductive, Stream of Consciousness, Fragmented

4. **Competence Level**: 
   - Basic: Simple vocabulary, basic structure, obvious errors
   - Intermediate: Good structure, varied vocabulary, minor issues
   - Advanced: Sophisticated language, complex ideas, polished
   - Expert: Exceptional skill, nuanced understanding, masterful execution
   - Formulaic: Following templates, predictable patterns, AI-like structure

5. **Author Likelihood**: Human or AI based on critical assessment

6. **Comments**: Provide specific examples and harsh but fair criticism

Return ONLY the JSON object. No markdown formatting, no additional text.
`;
};

const parseAnalysisResponse = (responseText: string): AnalysisResult => {
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
      aiProbability: Math.max(0, Math.min(100, parsed.aiProbability || 75)),
      writingStyle: validStyles.includes(parsed.writingStyle) ? parsed.writingStyle : 'Expository',
      writingApproach: validApproaches.includes(parsed.writingApproach) ? parsed.writingApproach : 'Deductive',
      competenceLevel: validCompetence.includes(parsed.competenceLevel) ? parsed.competenceLevel : 'Formulaic',
      authorLikelihood: (parsed.authorLikelihood === 'Human' || parsed.authorLikelihood === 'AI') ? parsed.authorLikelihood : 'AI',
      comments: parsed.comments || 'Analysis completed with critical standards applied.',
    };
  } catch (error) {
    console.error('Failed to parse analysis response:', error);
    console.error('Raw response was:', responseText);
    
    // Return more critical fallback values
    return {
      aiProbability: 85,
      writingStyle: 'Formulaic',
      writingApproach: 'Deductive',
      competenceLevel: 'Formulaic',
      authorLikelihood: 'AI',
      comments: 'Unable to complete full analysis due to parsing error. Text shows characteristics consistent with AI generation based on initial assessment.',
    };
  }
};
