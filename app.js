const { useState, useEffect, useRef } = React;

// React 18用のcreateRootを使用
const root = ReactDOM.createRoot(document.getElementById('root'));

function LoadingDots() {
    return (
        <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
        </div>
    );
}

function LogoGenerator({ isUpdating, setIsUpdating }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentLogo, setCurrentLogo] = useState(() => {
        const storedLogo = localStorage.getItem('companyLogo');
        return storedLogo ? storedLogo : '/placeholder.svg';
    });
    const [error, setError] = useState(null);

    const logoStyles = [
        { label: 'モダンでシンプル', prompt: 'モダンでシンプルな企業ロゴ。ミニマルデザインで信頼感のある印象' },
        { label: 'テクノロジー', prompt: 'テクノロジー企業らしい革新的なロゴ。AI・デジタルをイメージ' },
        { label: 'クリエイティブ', prompt: '創造的でアーティスティックなロゴ。独創性のある魅力的なデザイン' },
        { label: 'プロフェッショナル', prompt: 'プロフェッショナルで堅実な印象のロゴ。信頼性と実績を表現' }
    ];

    const generateLogo = async (prompt) => {
        setIsGenerating(true);
        setError(null);
        
        try {
            console.log('Sending request to Dify API with prompt:', prompt);

            const requestBody = {
                inputs: {
                    text: prompt
                },
                response_mode: "blocking",
                user: "logo-generator-" + Date.now()
            };

            console.log('Request body:', requestBody);

            const response = await fetch('https://api.dify.ai/v1/workflows/run', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer app-2aIprvHz5fjizvDipim6eEod',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            const responseData = await response.json();
            console.log('Response data:', responseData);

            if (!response.ok) {
                throw new Error(responseData.error || 'ロゴ生成に失敗しました');
            }

            // ワークフローAPIのレスポンス形式に従って処理
            if (responseData.data?.outputs?.files && responseData.data.outputs.files.length > 0) {
                const imageFile = responseData.data.outputs.files[0];
                console.log('Generated logo file:', imageFile);

                if (imageFile.url) {
                    console.log('Generated logo URL:', imageFile.url);
                    setCurrentLogo(imageFile.url);
                    localStorage.setItem('companyLogo', imageFile.url);
                } else {
                    throw new Error('画像URLが見つかりません');
                }
            } else {
                console.error('Unexpected response format:', responseData);
                throw new Error('ロゴの生成結果が見つかりません');
            }
        } catch (error) {
            console.error('Logo generation error:', error);
            setError(error.message);
        } finally {
            setIsGenerating(false);
            setIsUpdating(false);
        }
    };

    // useEffect hook removed here

    return (
        <div className={`logo-generator ${isUpdating ? 'updating' : ''}`}>
            <div className="logo-container">
                <img 
                    src={currentLogo} 
                    alt="Company Logo" 
                    className="company-logo"
                />
                {!isUpdating && (
                    <button 
                        className="update-logo-btn"
                        onClick={() => setIsUpdating(true)}
                    >
                        ロゴを更新
                    </button>
                )}
            </div>
            {isUpdating && (
                <div className="logo-styles">
                    <p className="text-sm text-gray-500 mb-2">ロゴのスタイルを選択してください：</p>
                    <div className="grid grid-cols-2 gap-2">
                        {logoStyles.map((style, index) => (
                            <button
                                key={index}
                                className="quick-reply-button"
                                onClick={() => generateLogo(style.prompt)}
                                disabled={isGenerating}
                            >
                                {style.label}
                            </button>
                        ))}
                    </div>
                    <button 
                        className="cancel-btn"
                        onClick={() => {
                            setIsUpdating(false);
                            setError(null);
                        }}
                    >
                        キャンセル
                    </button>
                </div>
            )}
            {isGenerating && <LoadingDots />}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
        </div>
    );
}

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);
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
            
            // レスポンスの解析と処理
            try {
                const parsedData = typeof data.answer === 'string' ? JSON.parse(data.answer) : data.answer;
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: parsedData.answer || parsedData
                }]);
                
                if (parsedData.suggested_questions) {
                    setSuggestedQuestions(parsedData.suggested_questions.slice(0, 4));
                }
            } catch (e) {
                // JSONとして解析できない場合は、通常のテキストとして扱う
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: data.answer
                }]);
            }
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
        { label: '会社情報は？', content: '会社情報を教えてください' },
        { label: 'アクセスは？', content: 'オフィスへのアクセス方法を教えてください' },
        { label: '展開しているサービスは？', content: '提供しているサービスについて教えてください' },
        { label: 'ninben.aiとは？', content: 'ninben.aiについて教えてください' }
    ];

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <LogoGenerator 
                        isUpdating={isUpdatingLogo}
                        setIsUpdating={setIsUpdatingLogo}
                    />
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
                    {suggestedQuestions.length > 0 && (
                        <div className="suggested-questions">
                            <p>関連する質問：</p>
                            <div className="grid grid-cols-2 gap-2">
                                {suggestedQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        className="quick-reply-button suggested"
                                        onClick={() => {
                                            setInput(question);
                                            setSuggestedQuestions([]);
                                        }}
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
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

// React 18のレンダリング方法を使用
root.render(<App />);

