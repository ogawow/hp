const { useState, useEffect, useRef } = React;

const ninbenInfo = {
    overview: `ninben.aiは、LINE公式アカウントを通じて高度なAIチャットボットサービスを提供するソリューションです。24時間365日の自動応答、パーソナライズされた商品レコメンド、柔軟なカスタマイズが特徴です。`,
    features: [
        "データ収集と効率的な整理",
        "OpenAIモデルによる高度な学習",
        "24時間365日の自動応答",
        "パーソナライズされた商品レコメンド",
        "柔軟なカスタマイズオプション"
    ],
    benefits: [
        "顧客満足度の向上",
        "業務効率化による人件費削減",
        "クロスセル・アップセルによる売上向上"
    ],
    pricing: {
        initial: "初期費用：3,000,000円",
        monthly: "月額費用：350,000円/月",
        includes: "システムの導入、設定、カスタマイズ、トレーニング、保守が含まれます"
    }
};

function LoadingDots() {
    return (
        <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
        </div>
    );
}

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const userAgent = window.navigator.userAgent;
        const deviceType = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(userAgent) ? 'モバイル' : 'デスクトップ';
        const browserName = getBrowserName(userAgent);

        const initialMessage = `${deviceType}の${browserName}ブラウザでお越しいただき、ありがとうございます！
LIFE合同会社へようこそ。弊社はチャットボットが主軸の会社ですので、会社HPもチャット形式にしています。
ninben.aiについて、または他の情報について、お気軽にお尋ねください。`;

        setMessages([{ role: 'assistant', content: initialMessage }]);

        // Initialize background animation
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '0';
        document.body.prepend(canvas);
        new WaveBackground(canvas);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getBrowserName = (userAgent) => {
        if (userAgent.indexOf("Chrome") > -1) return "Chrome";
        if (userAgent.indexOf("Safari") > -1) return "Safari";
        if (userAgent.indexOf("Firefox") > -1) return "Firefox";
        if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident/") > -1) return "Internet Explorer";
        if (userAgent.indexOf("Edge") > -1) return "Edge";
        return "不明なブラウザ";
    };

    const getNinbenResponse = (query) => {
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes('ninben') || lowerQuery.includes('にんべん')) {
            return ninbenInfo.overview;
        }
        if (lowerQuery.includes('機能') || lowerQuery.includes('特徴')) {
            return `ninben.aiの主な機能は以下の通りです：\n${ninbenInfo.features.join('\n')}`;
        }
        if (lowerQuery.includes('料金') || lowerQuery.includes('価格')) {
            return `ninben.aiの料金プラン：\n${ninbenInfo.pricing.initial}\n${ninbenInfo.pricing.monthly}\n${ninbenInfo.pricing.includes}`;
        }
        if (lowerQuery.includes('メリット') || lowerQuery.includes('利点')) {
            return `ninben.aiの主なメリット：\n${ninbenInfo.benefits.join('\n')}`;
        }
        
        return null;
    };

    const handleSend = async () => {
        if (input.trim() === '') return;

        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'user', content: input }]);
        setInput('');

        try {
            // First check for ninben.ai related queries
            const ninbenResponse = getNinbenResponse(input);
            if (ninbenResponse) {
                setTimeout(() => {
                    setMessages(prev => [...prev, { role: 'assistant', content: ninbenResponse }]);
                    setIsLoading(false);
                }, 1000);
                return;
            }

            // If not ninben.ai related, proceed with Dify API
            const response = await fetch('https://api.dify.ai/v1/chat-messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.DIFY_API_KEY}`
                },
                body: JSON.stringify({
                    inputs: {},
                    query: input,
                    response_mode: 'blocking',
                    conversation_id: '',
                    user: 'user'
                })
            });

            if (!response.ok) {
                throw new Error('APIリクエストが失敗しました');
            }

            const data = await response.json();
            if (!data.answer) {
                throw new Error('APIからの無効な応答');
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
        } catch (error) {
            console.error('エラー:', error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}` 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickReplies = [
        { label: 'ninben.aiとは？', content: 'ninben.aiについて教えてください' },
        { label: 'サービスの特徴', content: 'ninben.aiの主な機能を教えてください' },
        { label: '料金プラン', content: 'ninben.aiの料金プランを教えてください' },
        { label: '導入メリット', content: 'ninben.aiのメリットを教えてください' }
    ];

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">LIFE合同会社 コーポレートサイト</h1>
                </div>
                <div className="card-content">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}>
                            {msg.content}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message assistant-message">
                            <LoadingDots />
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="card-footer">
                    <div className="quick-replies">
                        {quickReplies.map((reply, index) => (
                            <button
                                key={index}
                                className="quick-reply-button"
                                onClick={() => setInput(reply.content)}
                            >
                                {reply.label}
                            </button>
                        ))}
                    </div>
                    <div className="input-group">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="メッセージを入力..."
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend} disabled={isLoading}>
                            送信
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));

