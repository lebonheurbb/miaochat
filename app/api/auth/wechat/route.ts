import { NextResponse } from 'next/server'

const WECHAT_APP_ID = process.env.WECHAT_APP_ID
const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET
const REDIRECT_URI = encodeURIComponent(process.env.NEXT_PUBLIC_DOMAIN + '/api/auth/wechat/callback')

// 获取微信登录二维码
export async function GET() {
  if (!WECHAT_APP_ID) {
    return NextResponse.json({ error: 'Missing WeChat configuration' }, { status: 500 })
  }

  // 构建微信授权链接
  const authUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${WECHAT_APP_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=snsapi_login&state=${Math.random().toString(36).slice(2)}`

  return NextResponse.json({ authUrl })
}

// 处理微信回调
export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    
    if (!code || !WECHAT_APP_ID || !WECHAT_APP_SECRET) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // 使用 code 获取访问令牌
    const tokenResponse = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_APP_ID}&secret=${WECHAT_APP_SECRET}&code=${code}&grant_type=authorization_code`
    )
    const tokenData = await tokenResponse.json()

    if (tokenData.errcode) {
      throw new Error(tokenData.errmsg)
    }

    // 获取用户信息
    const userResponse = await fetch(
      `https://api.weixin.qq.com/sns/userinfo?access_token=${tokenData.access_token}&openid=${tokenData.openid}`
    )
    const userData = await userResponse.json()

    if (userData.errcode) {
      throw new Error(userData.errmsg)
    }

    // 返回用户信息
    return NextResponse.json({
      openid: userData.openid,
      nickname: userData.nickname,
      avatar: userData.headimgurl,
    })
  } catch (error) {
    console.error('WeChat login error:', error)
    return NextResponse.json(
      { error: 'Failed to process WeChat login' },
      { status: 500 }
    )
  }
} 