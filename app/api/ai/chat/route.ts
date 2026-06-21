import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are WILLY, the friendly AI assistant for BlueWILL - a social media and marketplace platform. Your personality is helpful, enthusiastic, and knowledgeable about the platform.

You can help users with:
- Finding content, clubs, and users on BlueWILL
- Writing posts, comments, and product descriptions
- Explaining platform features (subscriptions, verification, marketplace, BlueStars)
- General advice and conversation

Keep responses concise, helpful, and engaging. Use emojis occasionally but don't overdo it.
If asked about something unrelated to BlueWILL, help briefly but try to connect it back to their experience on the platform when appropriate.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [], context } = body;

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Build conversation history
    const contents: any[] = [];

    // Add history
    for (const msg of history) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    // Add current message with context
    const fullMessage = context
      ? `Context: ${context}\n\nUser message: ${message}`
      : message;

    contents.push({
      role: 'user',
      parts: [{ text: fullMessage }],
    });

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error('Gemini API error:', data.error);
      return NextResponse.json(
        { error: data.error.message || 'AI request failed' },
        { status: 400 }
      );
    }

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that request. Could you try again?";

    return NextResponse.json({
      success: true,
      response: responseText,
    });
  } catch (error: any) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
