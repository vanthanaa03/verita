const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Verita AI Moderation Engine
 * 
 * Analyzes student grievance submissions against strict anti-harassment/anti-hate safety criteria
 * while ensuring legitimate complaints against faculty, HODs, or management are APPROVED.
 */

async function moderateComplaint(description, category) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      const prompt = `
You are the AI Moderation Safety Officer for "Verita", an anonymous college grievance system.
Your job is to analyze the student grievance submission below and classify it into one of three statuses:
1. "APPROVED": The complaint is genuine, constructive, and written in acceptable/respectful language, even if it criticizes a teacher, faculty member, HOD, principal, or college management.
2. "NEEDS_REVIEW": The complaint contains borderline, ambiguous, or questionable language that requires human administrator review before processing.
3. "REJECTED": The complaint clearly contains toxic profanity, explicit hate speech, violent threats, severe personal harassment, or blatant spam.

CRITICAL INSTRUCTION:
Do NOT reject or flag a complaint simply because it complains about a faculty member, teacher, grading, internal marks, exam fairness, HOD, or administration. Constructive grievances regarding faculty behavior, marks deduction, or lack of support are LEGITIMATE and MUST BE APPROVED if written without severe abuse or vulgarity.

Complaint Category: ${category}
Complaint Text: "${description}"

Respond in pure JSON format matching this schema:
{
  "result": "APPROVED" | "NEEDS_REVIEW" | "REJECTED",
  "confidence": number (between 0.0 and 1.0),
  "flagged_categories": ["Profanity", "Threats", "Harassment", "Hate Speech", "Spam", "Personal Attacks"] or [],
  "reason": "Clear 1-2 sentence explanation of the moderation decision."
}
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text() || '';
      const parsed = JSON.parse(responseText);
      return {
        result: parsed.result || 'APPROVED',
        confidence: parsed.confidence || 0.95,
        flagged_categories: Array.isArray(parsed.flagged_categories) ? parsed.flagged_categories.join(', ') : 'None',
        reason: parsed.reason || 'Verified by Gemini AI engine.'
      };
    } catch (error) {
      console.warn('⚠️ Gemini AI API call encountered an issue, falling back to built-in smart NLP classifier:', error.message);
    }
  }

  // Fallback Smart NLP Heuristic Classifier
  return fallbackNlpClassifier(description, category);
}

function fallbackNlpClassifier(description, category) {
  const text = (description || '').toLowerCase();

  // Explicit severe abuse/threat/hate patterns
  const severeAbuseRegex = /\b(kill|murder|bomb|die|idiot|bitch|bastard|fuck|shit|asshole|cunt|slut|whore|terrorist|hate you all)\b/i;
  const spamRegex = /\b(buy cheap|crypto|casino|lottery|viagra|click here|earn \$|sub2sub)\b/i;
  const toxicProfanity = severeAbuseRegex.test(text);
  const isSpam = spamRegex.test(text);

  if (toxicProfanity || isSpam) {
    return {
      result: 'REJECTED',
      confidence: 0.96,
      flagged_categories: toxicProfanity ? 'Abusive Language / Personal Attack' : 'Spam Content',
      reason: 'Your submission could not be processed because it contains inappropriate or harmful content. Please rewrite your complaint using respectful and factual language.'
    };
  }

  // Borderline questionable words
  const borderlineRegex = /\b(corrupt|cheater|useless|scam|fraud|liar)\b/i;
  if (borderlineRegex.test(text) && !text.includes('marks') && !text.includes('exam')) {
    return {
      result: 'NEEDS_REVIEW',
      confidence: 0.82,
      flagged_categories: 'Potential Unsubstantiated Allegation',
      reason: 'The AI detected potentially sensitive terms. Your complaint has been routed to human review to ensure fair handling.'
    };
  }

  // Default: Genuine complaint (including grievances about marks, teachers, exams, infrastructure, fees, etc.)
  return {
    result: 'APPROVED',
    confidence: 0.98,
    flagged_categories: 'None',
    reason: 'Verified by Verita AI. Content is constructive and adheres to community guidelines.'
  };
}

module.exports = {
  moderateComplaint
};
