// app/api/gemini/suggest-options/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { questionLabel } = await req.json();

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured in environment variables.");
      return NextResponse.json({ error: 'Server configuration error: API Key missing.' }, { status: 500 });
    }

    const prompt = `Berdasarkan pertanyaan "${questionLabel}", sarankan 3-5 opsi ringkas dan beragam untuk pertanyaan pilihan ganda/kotak centang/dropdown. Jika pertanyaan menyiratkan skala (misalnya "seberapa sering"), berikan opsi yang sesuai (misalnya "Sangat Sering", "Sering", "Kadang-kadang", "Jarang", "Tidak Pernah"). Berikan saran sebagai array JSON dari string, contoh: ["Opsi A", "Opsi B"].`;

    const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = {
      contents: chatHistory,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: { "type": "STRING" }
        }
      }
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error response:", errorData);
      return NextResponse.json({ error: `Gemini API error: ${errorData.error?.message || 'Unknown error'}` }, { status: response.status });
    }

    const result = await response.json();

    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      const jsonString = result.candidates[0].content.parts[0].text;
      const parsedSuggestions = JSON.parse(jsonString);
      if (Array.isArray(parsedSuggestions)) {
        return NextResponse.json({ suggestions: parsedSuggestions });
      } else {
        console.error("Gemini returned invalid JSON format for options:", jsonString);
        return NextResponse.json({ error: 'Invalid response format from AI.' }, { status: 500 });
      }
    } else {
      console.error("No valid candidates or content from Gemini for options:", JSON.stringify(result, null, 2));
      return NextResponse.json({ error: 'No suggestions found from AI.' }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Error generating options in API route:", error);
    return NextResponse.json({ error: `Internal Server Error: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}