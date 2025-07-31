
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
              ? 'You are a thorough text analyst specializing in detecting AI-generated content. While you are rigorous in your analysis, you maintain objectivity and give fair consideration to genuinely human-written content. Look for clear indicators of AI generation while acknowledging that humans can also write well-structured, polished content.'
              : 'You are a balanced and fair text analyst. You approach each text with an open mind, giving equal consideration to both human and AI authorship possibilities. You recognize that both humans and AI can produce high-quality, well-structured content, and you base your analysis on genuine indicators rather than assumptions.'
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
    ? `**CRITICAL BUT FAIR ANALYSIS:**
You should be thorough and look for genuine AI indicators such as:
- Highly repetitive phrasing or sentence structures
- Overly generic responses that could apply to any context
- Lack of personal anecdotes, specific examples, or unique perspectives
- Perfect grammar with no natural human variations or informal elements
- Responses that seem template-like or formulaic
- Missing emotional nuance or personal voice

However, remember that humans can also write polished, well-structured content. Don't automatically assume good writing equals AI generation. Look for authentic human elements like:
- Personal experiences or specific examples
- Natural conversational flow with slight imperfections
- Unique perspectives or creative insights
- Appropriate use of informal language or colloquialisms
- Genuine emotional expression or personal voice`
    : `**GENEROUS AND BALANCED ANALYSIS:**
You should give equal consideration to both human and AI authorship. Focus on:
- Authentic indicators that genuinely suggest AI generation
- Natural writing patterns that suggest human authorship
- Personal voice, unique perspectives, and individual writing style
- Creative insights, personal anecdotes, or specific examples
- Natural imperfections that indicate human writing
- Context-appropriate language and genuine engagement

Avoid penalizing text simply for being well-written, grammatically correct, or well-structured, as humans are perfectly capable of producing high-quality content. Give the benefit of the doubt when indicators are ambiguous.`;

  return `
You are analyzing this text response with ${isCriticalMode ? 'thorough but fair' : 'generous and balanced'} standards.

**Question/Prompt:**
${question}

**Answer Text to Analyze:**
${answerText}

${judgingCriteria ? `**Judging Criteria:**\n${judgingCriteria}\n` : ''}

${analysisApproach}

**IMPORTANT CALIBRATION GUIDELINES:**
- ${isCriticalMode ? '60-80% of well-written human content should score below 50% AI probability' : '80-90% of human content should score below 40% AI probability'}
- Only assign high AI probability (70%+) when there are multiple strong indicators
- Consider the context: academic writing naturally sounds more formal and structured
- Personal anecdotes, specific examples, and unique perspectives strongly suggest human authorship
- Minor grammatical errors or informal language often indicate human writing
- ${isCriticalMode ? 'Be skeptical but fair' : 'Give the benefit of the doubt when uncertain'}

**MANDATORY OUTPUT FORMAT:**
Return your analysis in this exact JSON format with NO additional text:

{
  "aiProbability": <number 0-100>,
  "writingStyle": "<EXACTLY ONE OF: Narrative, Expository, Descriptive, Persuasive, Analytical, Reflective, Satirical, Didactic>",
  "writingApproach": "<EXACTLY ONE OF: Chronological, Problem-Solution, Compare-Contrast, Inductive, Deductive, Stream of Consciousness, Fragmented>",
  "competenceLevel": "<EXACTLY ONE OF: Basic, Intermediate, Advanced, Expert, Formulaic>",
  "authorLikelihood": "<EXACTLY: Human OR AI>",
  "comments": "<detailed ${isCriticalMode ? 'thorough but fair' : 'balanced and generous'} analysis explaining your reasoning>"
}

**CLASSIFICATION REQUIREMENTS:**

1. **AI Probability (0-100%)**: 
   ${isCriticalMode 
     ? 'Look for genuine AI indicators but don\'t penalize good writing. Most human content should score 30-60% unless there are clear AI markers.' 
     : 'Be generous in assessment. Most human content should score 15-40% unless there are obvious AI generation patterns.'}

2. **Writing Style**: Choose the DOMINANT style from the list

3. **Writing Approach**: Choose the PRIMARY organizational method from the list

4. **Competence Level**: 
   - Basic: Simple vocabulary, basic structure, obvious errors
   - Intermediate: Good structure, varied vocabulary, minor issues
   - Advanced: Sophisticated language, complex ideas, polished
   - Expert: Exceptional skill, nuanced understanding, masterful execution
   - Formulaic: Following obvious templates, predictable AI-like patterns

5. **Author Likelihood**: 
   - Human: When personal voice, authentic examples, natural imperfections, or unique perspectives are present
   - AI: Only when there are multiple strong indicators of artificial generation

6. **Comments**: Provide specific examples and ${isCriticalMode ? 'thorough but fair reasoning' : 'balanced, generous analysis'}

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
    
    // Adjust probability bounds based on mode for more balanced results
    let adjustedProbability = parsed.aiProbability;
    if (!isCriticalMode) {
      // In generous mode, reduce AI probability by 15-20 points for more balanced results
      adjustedProbability = Math.max(0, adjustedProbability - 15);
    }
    
    return {
      aiProbability: Math.max(0, Math.min(100, adjustedProbability || (isCriticalMode ? 45 : 25))),
      writingStyle: validStyles.includes(parsed.writingStyle) ? parsed.writingStyle : 'Expository',
      writingApproach: validApproaches.includes(parsed.writingApproach) ? parsed.writingApproach : 'Deductive',
      competenceLevel: validCompetence.includes(parsed.competenceLevel) ? parsed.competenceLevel : (isCriticalMode ? 'Advanced' : 'Intermediate'),
      authorLikelihood: (parsed.authorLikelihood === 'Human' || parsed.authorLikelihood === 'AI') ? parsed.authorLikelihood : (isCriticalMode ? 'Human' : 'Human'),
      comments: parsed.comments || `Analysis completed with ${isCriticalMode ? 'thorough but fair' : 'balanced and generous'} standards applied.`,
    };
  } catch (error) {
    console.error('Failed to parse analysis response:', error);
    console.error('Raw response was:', responseText);
    
    // Return more balanced fallback values
    return {
      aiProbability: isCriticalMode ? 45 : 25,
      writingStyle: 'Expository',
      writingApproach: 'Deductive',
      competenceLevel: isCriticalMode ? 'Advanced' : 'Intermediate',
      authorLikelihood: 'Human',
      comments: `Unable to complete full analysis due to parsing error. Text assessed with ${isCriticalMode ? 'thorough but fair' : 'balanced and generous'} standards shows characteristics more consistent with human authorship.`,
    };
  }
};
