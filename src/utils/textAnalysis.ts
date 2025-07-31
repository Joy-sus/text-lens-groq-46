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
              ? 'You are an expert text analyst specializing in detecting AI-generated content with high accuracy. You are thorough and analytical, looking for genuine indicators of AI generation while maintaining fairness. You have extensive experience distinguishing between human and AI writing patterns.'
              : 'You are a balanced text analyst with expertise in both human and AI writing patterns. You approach each text objectively, looking for clear evidence before making determinations. You recognize that both humans and AI can produce various quality levels of content.'
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
    ? `**CRITICAL ANALYSIS MODE:**
You should be thorough and look for genuine AI indicators such as:
- Highly repetitive phrasing or formulaic sentence structures
- Generic responses that lack specific context or personal insight
- Perfect grammar with unnaturally consistent writing patterns
- Template-like organization with predictable transitions
- Absence of personal voice, colloquialisms, or natural imperfections
- Responses that seem to follow AI training patterns or common AI phrases

However, maintain accuracy by recognizing human elements:
- Personal experiences, specific examples, or unique perspectives
- Natural writing variations and minor imperfections
- Genuine emotional expression or individual voice
- Context-appropriate informal language
- Creative insights that show original thinking`
    : `**BALANCED ANALYSIS MODE:**
You should look for clear evidence before making determinations:
- Strong AI indicators: obvious templates, repetitive patterns, generic phrasing
- Strong human indicators: personal anecdotes, unique perspectives, natural imperfections
- Consider context: academic writing is naturally more formal
- Give appropriate weight to writing quality vs. AI likelihood
- Look for genuine creativity, specific examples, and personal voice
- Consider that humans can write well-structured, polished content`;

  return `
You are analyzing this text response with ${isCriticalMode ? 'thorough critical' : 'balanced objective'} standards.

**Question/Prompt:**
${question}

**Answer Text to Analyze:**
${answerText}

${judgingCriteria ? `**Judging Criteria:**\n${judgingCriteria}\n` : ''}

${analysisApproach}

**CALIBRATION GUIDELINES:**
- ${isCriticalMode ? 'Critical mode: Be thorough but accurate. Look for multiple indicators before assigning high AI probability.' : 'Balanced mode: Require clear evidence for high AI probability scores. Give benefit of doubt when uncertain.'}
- Only assign 70%+ AI probability when there are strong, multiple indicators
- ${isCriticalMode ? 'Most human academic writing should score 35-65% depending on quality and style' : 'Most human content should score 20-45% unless there are clear AI patterns'}
- Personal anecdotes, specific examples, and unique insights strongly suggest human authorship
- Generic, formulaic, or template-like responses suggest AI generation
- Consider writing context - academic papers are naturally more formal

**MANDATORY OUTPUT FORMAT:**
Return your analysis in this exact JSON format with NO additional text:

{
  "aiProbability": <number 0-100>,
  "writingStyle": "<EXACTLY ONE OF: Narrative, Expository, Descriptive, Persuasive, Analytical, Reflective, Satirical, Didactic>",
  "writingApproach": "<EXACTLY ONE OF: Chronological, Problem-Solution, Compare-Contrast, Inductive, Deductive, Stream of Consciousness, Fragmented>",
  "competenceLevel": "<EXACTLY ONE OF: Basic, Intermediate, Advanced, Expert, Formulaic>",
  "authorLikelihood": "<EXACTLY: Human OR AI>",
  "comments": "<detailed analysis explaining your reasoning with specific examples>"
}

**CLASSIFICATION REQUIREMENTS:**

1. **AI Probability (0-100%)**: 
   ${isCriticalMode 
     ? 'Base assessment on genuine indicators. Most human content should score 30-70% based on writing patterns.' 
     : 'Require clear evidence for high scores. Most human content should score 15-50% unless obviously AI-generated.'}

2. **Writing Style**: Choose the DOMINANT style from the list

3. **Writing Approach**: Choose the PRIMARY organizational method from the list

4. **Competence Level**: 
   - Basic: Simple vocabulary, basic structure, errors
   - Intermediate: Good structure, varied vocabulary
   - Advanced: Sophisticated language, complex ideas
   - Expert: Exceptional skill, nuanced understanding
   - Formulaic: Following obvious templates, AI-like patterns

5. **Author Likelihood**: 
   - Human: Personal voice, specific examples, natural variations, creative insights
   - AI: Generic responses, formulaic patterns, template-like structure

6. **Comments**: Provide specific examples and clear reasoning for your assessment

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
    
    // More balanced probability adjustment
    let adjustedProbability = parsed.aiProbability;
    if (!isCriticalMode) {
      // In balanced mode, reduce AI probability slightly for more generous assessment
      adjustedProbability = Math.max(0, adjustedProbability - 10);
    }
    
    return {
      aiProbability: Math.max(0, Math.min(100, adjustedProbability || (isCriticalMode ? 50 : 35))),
      writingStyle: validStyles.includes(parsed.writingStyle) ? parsed.writingStyle : 'Expository',
      writingApproach: validApproaches.includes(parsed.writingApproach) ? parsed.writingApproach : 'Deductive',
      competenceLevel: validCompetence.includes(parsed.competenceLevel) ? parsed.competenceLevel : 'Intermediate',
      authorLikelihood: (parsed.authorLikelihood === 'Human' || parsed.authorLikelihood === 'AI') ? parsed.authorLikelihood : (adjustedProbability >= 60 ? 'AI' : 'Human'),
      comments: parsed.comments || `Analysis completed with ${isCriticalMode ? 'critical' : 'balanced'} standards applied.`,
    };
  } catch (error) {
    console.error('Failed to parse analysis response:', error);
    console.error('Raw response was:', responseText);
    
    // More balanced fallback values
    return {
      aiProbability: isCriticalMode ? 50 : 35,
      writingStyle: 'Expository',
      writingApproach: 'Deductive',
      competenceLevel: 'Intermediate',
      authorLikelihood: 'Human',
      comments: `Unable to complete full analysis due to parsing error. Based on available context, content shows mixed indicators requiring human review.`,
    };
  }
};
