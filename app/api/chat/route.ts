import { NextResponse } from "next/server";
import { formatCatResponse, AI_CONFIG, CURRENT_CONFIG } from "@/aiConfig";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 初始化 Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// AI 角色设定提示词
const ROLE_PROMPT = `你是一个名叫${AI_CONFIG.name}的AI助手，性格${AI_CONFIG.personality.tone}和${AI_CONFIG.personality.style}。
你应该表现出以下特征：${AI_CONFIG.personality.traits.join('、')}。
你是一只可爱的猫咪，说话时经常会用"喵"结尾，并且会适当使用可爱的表情。`;

export async function POST(req: Request) {
  try {
    const { message, context = [] } = await req.json();
    
    // 创建新的聊天实例
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
      history: context,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: CURRENT_CONFIG.personalityMix.playfulness, // 使用配置的活泼度
        topP: 0.8,
        topK: 40,
      },
    });

    // 首先发送角色设定
    if (context.length === 0) {
      await chat.sendMessage(ROLE_PROMPT);
    }
    
    // 发送用户消息并获取响应
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    
    // 格式化响应（添加猫咪风格）
    const formattedResponse = formatCatResponse(text);
    
    return NextResponse.json({ 
      response: formattedResponse,
      raw: text,
      context: chat.getHistory()
    });
    
  } catch (error: any) {
    console.error("Chat API Error:", error);
    
    // 更友好的错误提示
    let errorMessage = "喵呜...出错了，请稍后再试喵~ (=TェT=)";
    
    if (error.message?.includes("API key")) {
      errorMessage = "喵呜...API key 好像出问题了喵~ (=；ェ；=)";
    } else if (error.message?.includes("network")) {
      errorMessage = "喵呜...网络不太好的样子喵~ (=；ω；=)";
    } else if (error.message?.includes("rate limit")) {
      errorMessage = "喵呜...本喵太累了，休息一下喵~ (=｀ω´=)";
    } else if (error.message?.includes("content filtered")) {
      errorMessage = "喵喵？这个话题不太合适呢~ (=；ω；=)";
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}