import { NextResponse } from "next/server";
import { createGeminiChat, formatGeminiResponse } from "../../../aiConfig";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const chat = await createGeminiChat();
    
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const formattedResponse = await formatGeminiResponse(response.text());
    
    return NextResponse.json({ 
      response: formattedResponse,
      raw: response.text()
    });
    
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "喵呜...出错了，请稍后再试喵~" },
      { status: 500 }
    );
  }
}