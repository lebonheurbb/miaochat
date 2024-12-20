import { NextResponse } from "next/server";
import { formatCatResponse } from "@/aiConfig";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 初始化 Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // 创建新的聊天实例
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.9,
        topP: 0.8,
        topK: 40,
      },
    });
    
    // 发送消息并获取响应
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    
    // 格式化响应（添加猫咪风格）
    const formattedResponse = formatCatResponse(text);
    
    return NextResponse.json({ 
      response: formattedResponse,
      raw: text
    });
    
  } catch (error: any) {
    console.error("Chat API Error:", error);
    
    // 更友好的错误提示
    let errorMessage = "喵呜...出错了，请稍后再试喵~ (=TェT=)";
    
    if (error.message?.includes("API key")) {
      errorMessage = "喵呜...API key 好像出问题了喵~ (=；ェ；=)";
    } else if (error.message?.includes("network")) {
      errorMessage = "喵呜...网络不太好的样子喵~ (=；ω；=)";
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}