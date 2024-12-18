const { useState, useEffect } = React;

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

    useEffect(() => {
        const userAgent = window.navigator.userAgent;
        const deviceType = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(userAgent) ? 'モバイル' : 'デスクトップ';
        const browserName = getBrowserName(userAgent);

        const initialMessage = `${deviceType}の${browserName}ブラウザでお越しいただき、ありがとうございます！
LIFE合同会社へようこそ。弊社はチャットボットが主軸の会社ですので、会社HPもチャット形式にしています。
下記のクイックリプライボタンか、自由にメッセージを入力してください。どのようなことでもお答えいたします！`;

        setMessages([{ role: 'assistant', content: initialMessage }]);
    }, []);

    const getBrowserName = (userAgent) => {
        if (userAgent.indexOf("Chrome") > -1) return "Chrome";
        if (userAgent.indexOf("Safari") > -1) return "Safari";
        if (userAgent.indexOf("Firefox") > -1) return "Firefox";
        if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident/") > -1) return "Internet Explorer";
        if (userAgent.indexOf("Edge") > -1) return "Edge";
        return "不明なブラウザ";
    };

    const handleSend = async () => {
        if (input.trim() === '') return;

        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'user', content: input }]);
        setInput('');

        try {
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
        { label: '会社概要', content: '会社概要を教えてください' },
        { label: 'アクセス', content: 'オフィスへのアクセス方法を教えてください' },
        { label: '事業内容', content: 'LIFE合同会社の事業内容を教えてください' },
        { label: 'お問い合わせ', content: 'お問い合わせ方法を教えてください' }
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

