import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    const difyApiKey = process.env.DIFY_API_KEY
    if (!difyApiKey) {
      throw new Error('DIFY_API_KEYが設定されていません')
    }

    // Dify APIにリクエストを送信
    const response = await fetch('https://api.dify.ai/v1/chat-messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${difyApiKey}`
      },
      body: JSON.stringify({
        inputs: {},
        query: message,
        response_mode: 'blocking',
        conversation_id: '',
        user: 'user'
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Dify APIエラー:', errorData)
      return NextResponse.json(
        { error: `APIでエラーが発生しました: ${errorData.message || response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    if (!data.answer) {
      throw new Error('Dify APIからの無効な応答')
    }
    return NextResponse.json({ response: data.answer })
  } catch (error) {
    console.error('サーバーエラー:', error)
    return NextResponse.json(
      { error: `サーバーでエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}` },
      { status: 500 }
    )
  }
}

