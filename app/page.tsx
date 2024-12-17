'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { LoadingDots } from '@/components/loading-dots'
import { AnimatedGradientBackground } from '@/components/animated-gradient-background'
import { Building, MapPin, Briefcase, Phone } from 'lucide-react'

export default function Home() {
  const [messages, setMessages] = useState<Array<{ role: string, content: string }>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    const deviceType = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(userAgent) ? 'モバイル' : 'デスクトップ';
    const browserName = getBrowserName(userAgent);

    const initialMessage = `${deviceType}の${browserName}ブラウザでお越しいただき、ありがとうございます！
LIFE合同会社へようこそ。弊社はチャットボットが主軸の会社ですので、会社HPもチャット形式にしています。
下記のクイックリプライボタンか、自由にメッセージを入力してください。どのようなことでもお答えいたします！`;

    setMessages([{ role: 'assistant', content: initialMessage }]);
  }, []);

  const getBrowserName = (userAgent: string) => {
    if (userAgent.indexOf("Chrome") > -1) return "Chrome";
    if (userAgent.indexOf("Safari") > -1) return "Safari";
    if (userAgent.indexOf("Firefox") > -1) return "Firefox";
    if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident/") > -1) return "Internet Explorer";
    if (userAgent.indexOf("Edge") > -1) return "Edge";
    return "不明なブラウザ";
  };

  const handleSend = async () => {
    if (input.trim() === '') return

    setIsLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: input }])
    setInput('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'APIリクエストが失敗しました')
      }

      const data = await response.json()
      if (!data.response) {
        throw new Error('APIからの無効な応答')
      }
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('エラー:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}` 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const quickReplies = [
    { label: '会社概要', content: '会社概要を教えてください', icon: Building },
    { label: 'アクセス', content: 'オフィスへのアクセス方法を教えてください', icon: MapPin },
    { label: '事業内容', content: 'LIFE合同会社の事業内容を教えてください', icon: Briefcase },
    { label: 'お問い合わせ', content: 'お問い合わせ方法を教えてください', icon: Phone }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <AnimatedGradientBackground />
      <Card className="w-full max-w-2xl mx-4 bg-white bg-opacity-90 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">LIFE合同会社 コーポレートサイト</CardTitle>
        </CardHeader>
        <CardContent className="h-[60vh] overflow-y-auto space-y-4 p-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] p-3 rounded-lg bg-gray-200">
                <LoadingDots />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="grid grid-cols-2 gap-2 w-full">
            {quickReplies.map((reply, index) => (
              <Button 
                key={index} 
                onClick={() => setInput(reply.content)} 
                variant="outline" 
                className="flex items-center justify-start space-x-2 h-auto py-2"
              >
                <reply.icon size={16} />
                <span>{reply.label}</span>
              </Button>
            ))}
          </div>
          <div className="flex w-full space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="メッセージを入力..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} disabled={isLoading}>
              送信
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

