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
              ? 'You are an expert academic evaluator and AI detection specialist. You have extensive experience in distinguishing between human and AI writing patterns in academic contexts. You evaluate student work based on question relevance, depth of understanding, originality of thought, and writing authenticity. You are thorough but fair in your assessments.'
              : 'You are a balanced academic evaluator with expertise in both human and AI writing assessment. You approach each text objectively, focusing on content quality, question relevance, and genuine academic merit. You recognize that students have varying writing abilities and give appropriate consideration to effort and understanding.'
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
    ? `**CRITICAL ACADEMIC EVALUATION MODE:**
You should thoroughly evaluate both AI detection AND academic quality:

**AI Detection Criteria:**
- Look for AI patterns: repetitive phrasing, formulaic structures, generic responses
- Check for human indicators: personal voice, specific examples, natural imperfections
- Assess originality vs template-like responses
- Consider context-appropriate language and genuine understanding

**Academic Quality Assessment:**
- **Question Relevance**: Does the response directly address what was asked?
- **Depth of Understanding**: Shows genuine comprehension vs superficial treatment
- **Critical Thinking**: Evidence of analysis, evaluation, or synthesis
- **Use of Examples**: Specific, relevant examples vs generic illustrations
- **Academic Voice**: Appropriate tone and scholarly approach
- **Organization**: Logical flow and structure appropriate for the question type

**Quality Indicators:**
- Good: Demonstrates understanding, addresses question, shows original thinking
- Poor: Off-topic, superficial, lacks engagement with the question, purely generic`
    : `**BALANCED ACADEMIC EVALUATION MODE:**
You should provide fair assessment focusing on:

**Primary Focus - Academic Merit:**
- How well does the response answer the specific question asked?
- Does it show genuine understanding of the topic?
- Is there evidence of personal engagement with the material?
- Are examples and explanations appropriate and relevant?

**Secondary Focus - Authenticity:**
- Clear AI indicators: obvious templates, repetitive patterns, generic phrasing
- Human indicators: personal insights, specific examples, natural voice
- Give benefit of doubt when writing quality could reflect student ability

**Evaluation Standards:**
- Recognize that good student writing can be well-structured and polished
- Focus on substance over style unless style clearly indicates AI generation
- Consider question complexity when evaluating response depth`;

  return `
You are evaluating a student's written response with ${isCriticalMode ? 'rigorous academic standards' : 'balanced academic assessment'}.

**QUESTION/ASSIGNMENT:**
${question}

**STUDENT RESPONSE:**
${answerText}

${judgingCriteria ? `**GRADING CRITERIA:**\n${judgingCriteria}\n` : ''}

${analysisApproach}

**EVALUATION FRAMEWORK:**

1. **Content Quality Assessment:**
   - Does the response directly address the question asked?
   - Is there evidence of genuine understanding vs mere information regurgitation?
   - Are arguments well-supported with appropriate examples?
   - Does it show critical thinking and original analysis?

2. **Academic Writing Evaluation:**
   - Is the writing style appropriate for the academic level?
   - Is the organization logical and coherent?
   - Does it demonstrate subject knowledge and vocabulary?
   - Are sources or examples used effectively?

3. **Authenticity Indicators:**
   - Human: Personal insights, specific examples, natural voice variations, contextual understanding
   - AI: Generic responses, formulaic patterns, template-like structure, lack of personal engagement

**CALIBRATION GUIDELINES:**
- ${isCriticalMode ? 'Balance AI detection with academic merit - a poor response is not necessarily AI-generated' : 'Prioritize academic quality assessment - focus on learning demonstration'}
- Consider question complexity when evaluating response depth
- ${isCriticalMode ? 'Most genuine student work should score 25-65% AI probability depending on quality' : 'Most authentic student work should score 15-45% AI probability'}
- High-quality human responses with good structure should not automatically indicate AI generation
- Poor responses may still be human if they show genuine effort and understanding

**MANDATORY OUTPUT FORMAT:**
Return your analysis in this exact JSON format with NO additional text:

{
  "aiProbability": <number 0-100>,
  "writingStyle": "<EXACTLY ONE OF: Narrative, Expository, Descriptive, Persuasive, Analytical, Reflective, Satirical, Didactic>",
  "writingApproach": "<EXACTLY ONE OF: Chronological, Problem-Solution, Compare-Contrast, Inductive, Deductive, Stream of Consciousness, Fragmented>",
  "competenceLevel": "<EXACTLY ONE OF: Basic, Intermediate, Advanced, Expert, Formulaic>",
  "authorLikelihood": "<EXACTLY: Human OR AI>",
  "comments": "<detailed analysis covering: 1) How well the response addresses the question, 2) Academic quality and depth, 3) Evidence for AI vs human authorship, 4) Overall assessment of student work quality>"
}

**DETAILED REQUIREMENTS:**

1. **AI Probability (0-100%)**: 
   Base on combination of AI detection indicators AND academic authenticity
   - Consider both writing patterns and genuine engagement with the question
   - ${isCriticalMode ? 'Score 25-65% for most authentic student work' : 'Score 15-45% for most genuine responses'}

2. **Comments Structure**: Must address:
   - Question relevance and how well the response answers what was asked
   - Academic quality: depth, understanding, examples, critical thinking
   - Authenticity indicators: human vs AI characteristics observed
   - Overall evaluation of the student work (good/poor and why)

3. **Academic Context**: Remember this is student work - evaluate appropriately for educational setting

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
