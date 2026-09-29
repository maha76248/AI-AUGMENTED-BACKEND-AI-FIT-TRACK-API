const { GoogleGenAI } = require('@google/genai');

// Check API key
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is missing from environment variables');
}

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Primary and fallback models
const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-3.5-flash-lite';

/**
 * Generate content with retry + fallback model
 */
const generateWithGemini = async (prompt) => {
  const models = [PRIMARY_MODEL, FALLBACK_MODEL];

  let lastError;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(
          `Gemini request: model=${model}, attempt=${attempt}`
        );

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        const text = response?.text?.trim();

        if (text) {
          console.log(`Gemini success using ${model}`);
          return text;
        }

        throw new Error('Gemini returned an empty response');
      } catch (error) {
        lastError = error;

        console.error(
          `Gemini error [${model}] attempt ${attempt}:`,
          error?.message || error
        );

        // Wait before retry
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
    }

    console.log(`Trying fallback model: ${FALLBACK_MODEL}`);
  }

  throw lastError || new Error('Gemini request failed');
};


/**
 * Generate personalized workout recommendation
 */
const generateWorkoutRecommendation = async (
  age,
  fitnessGoal,
  experience
) => {
  try {
    const prompt = `
Generate a personalized workout recommendation for a person with:

Age: ${age}
Fitness Goal: ${fitnessGoal}
Experience Level: ${experience}

Requirements:
Keep it extremely direct, practical and concise.
Use 2-3 short paragraphs.
Do not use greetings.
Do not use markdown bold.
Do not use bullet points.
Do not use introductory phrases.
Speak directly to the user.
Include a clear step-by-step execution plan.
`;

    return await generateWithGemini(prompt);

  } catch (error) {
    console.error(
      'Gemini Workout Recommendation Error:',
      error?.message || error
    );

    throw new Error(
      'Failed to generate workout recommendation from Gemini AI'
    );
  }
};


/**
 * Generate personalized fitness insights
 */
const generateFitnessInsights = async (
  totalWorkouts,
  averageDuration,
  totalCaloriesBurned
) => {
  try {
    const prompt = `
Analyze this user's fitness progress and generate a personalized fitness insight.

Total Workouts Logged: ${totalWorkouts}
Average Workout Duration: ${averageDuration} minutes
Total Calories Burned: ${totalCaloriesBurned} kcal

Requirements:
Keep the insight extremely direct, actionable and concise.
Use 2-3 sentences.
Do not use greetings.
Do not use markdown bold.
Do not use bullet points.
Do not use introductory phrases.
Explain what the user should continue or adjust.
`;

    return await generateWithGemini(prompt);

  } catch (error) {
    console.error(
      'Gemini Fitness Insights Error:',
      error?.message || error
    );

    throw new Error(
      'Failed to generate fitness insights from Gemini AI'
    );
  }
};


module.exports = {
  generateWorkoutRecommendation,
  generateFitnessInsights,
};