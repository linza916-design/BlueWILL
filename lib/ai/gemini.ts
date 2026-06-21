// Gemini AI Utilities for WILLY AI Assistant

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIContext {
  userProfile?: {
    name: string;
    interests: string[];
    location: string;
  };
  currentPath?: string;
  activeClub?: string;
}

export async function chatWithWilly(
  message: string,
  history: ChatMessage[] = [],
  context?: AIContext
): Promise<string> {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
        context: context ? JSON.stringify(context) : undefined,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return data.response;
    }

    throw new Error(data.error || 'AI request failed');
  } catch (error: any) {
    console.error('WILLY chat error:', error);
    return "I'm having trouble connecting right now. Please try again in a moment!";
  }
}

// Specialized Willy prompts
export const WILLY_PROMPTS = {
  writePost: (topic: string) =>
    `Help me write a social media post about: ${topic}. Keep it engaging, concise (under 280 characters), and include relevant hashtags.`,

  productDescription: (item: string, price: string) =>
    `Write a compelling product description for: ${item}, priced at ${price}. Highlight key features and benefits.`,

  findDeals: (category: string, location: string) =>
    `What are the best deals in the ${category} category near ${location}? Or what should I look for?`,

  joinClubs: (interests: string[]) =>
    `Based on my interests: ${interests.join(', ')}, which BlueWILL clubs should I join and why?`,

  improveBio: (currentBio: string) =>
    `Help me improve my profile bio. Current: "${currentBio}". Make it more engaging and professional.`,

  connectionMessage: (recipientName: string, context: string) =>
    `Write a friendly connection request message to ${recipientName}. Context: ${context}`,
};

// Suggested prompts for users
export const SUGGESTED_PROMPTS = [
  "Find me deals on electronics in my area",
  "Help me write a product description",
  "What clubs should I join?",
  "Improve my profile bio",
  "Write a post about my hobby",
  "What's trending on BlueWILL?",
];
