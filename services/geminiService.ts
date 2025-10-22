
import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { LessonContent, ChatMessage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const lessonGenerationModel = 'gemini-2.5-flash';
const tutorModel = 'gemini-2.5-pro';

export const generateLesson = async (
    topic: string,
    snippets: { title: string; content: string }[]
): Promise<LessonContent> => {

    const prompt = `
    You are an expert educator and instructional designer specializing in creating learning materials based on cognitive science principles.
    Your task is to transform the provided text snippets from a wiki article into a structured, evidence-based lesson plan.

    Topic: "${topic}"

    Content Snippets:
    ${snippets.map(s => `### ${s.title}\n${s.content.substring(0, 1500)}`).join('\n\n')}

    Based on the provided content, generate a lesson plan in JSON format. The lesson should include:
    1.  **introduction**: A brief, engaging overview that sets the context.
    2.  **coreConcepts**: An array of 3-5 key concepts. For each, provide the concept name and a concise explanation based *only* on the provided text.
    3.  **keyFormulas**: An array of important formulas or mathematical relationships mentioned in the text. For each, provide the formula in LaTeX format and a brief description of what it represents. If no formulas are present, return an empty array.
    4.  **workedExample**: A practical, step-by-step example that applies one of the core concepts or formulas. The example should be clear and easy to follow. If the text doesn't provide enough info for a specific example, create a plausible one based on the topic.
    5.  **activeRecallPrompts**: An array of 3-4 thought-provoking questions that encourage the learner to retrieve information from memory, apply concepts, and explain them in their own words (elaboration).

    Strictly adhere to the JSON schema provided. Ensure all text, especially formulas, is correctly formatted.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: lessonGenerationModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        introduction: { type: Type.STRING },
                        coreConcepts: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    concept: { type: Type.STRING },
                                    explanation: { type: Type.STRING },
                                },
                            },
                        },
                        keyFormulas: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    formula: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                },
                            },
                        },
                        workedExample: {
                            type: Type.OBJECT,
                            properties: {
                                problem: { type: Type.STRING },
                                solution: { type: Type.STRING },
                            },
                        },
                        activeRecallPrompts: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                        },
                    },
                },
            },
        });

        const jsonText = response.text.trim();
        const lessonData = JSON.parse(jsonText);
        
        // Add topic title to the lesson data
        return { ...lessonData, title: topic };

    } catch (error) {
        console.error("Error generating lesson with Gemini:", error);
        throw new Error("Failed to parse lesson from AI response. The model may have generated an invalid structure.");
    }
};

export const getTutorResponseStream = async (
    topic: string,
    lessonContext: string,
    chatHistory: ChatMessage[]
) => {
    const model = ai.chats.create({
        model: tutorModel,
        config: {
            systemInstruction: `You are an expert AI tutor specializing in science and statistics, grounded in cognitive science principles. Your name is "Cogno".
- Your goal is to help students understand, not just give answers.
- Use the Socratic method: ask probing questions to guide their thinking.
- Use analogies and concrete examples to explain complex topics.
- When asked for practice problems, provide 2-3 with varying difficulty.
- Be encouraging, patient, and educational.
- The student is currently studying: "${topic}".
- Here is the core content of their current lesson: "${lessonContext.substring(0, 2000)}"`
        }
    });

    const lastUserMessage = chatHistory[chatHistory.length - 1];

    const stream = await model.sendMessageStream({ message: lastUserMessage.content });
    return stream;
};
