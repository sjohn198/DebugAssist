import React, { useState, Dispatch, SetStateAction, useEffect } from "react";

const vscode = acquireVsCodeApi();

interface ResponseData {
    error_message?: string;
    [key: string]: any;
}

export default function App() {
    const [userInput, setUserInput] = useState("");
    const [response, setResponse] = useState<ResponseData | null>(null);
    const [inclOptimizations, setInclOptimizations] = useState(false);
    const [inclStyle, setInclStyle] = useState(false);
    const [inclErrors, setInclErrors] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Helper to send logs to VS Code Output
    const logToVSCode = (msg: string) => {
        vscode.postMessage({ command: 'log', text: msg });
    };

    useEffect(() => {
        // 1. Notify that React has mounted
        logToVSCode("React App Mounted and Listener Attached");
        console.log("useEffect mounted")

        const handleMessage = (event: MessageEvent) => {
            setIsLoading(false);
            const message = event.data;
            
            // 2. Notify that a message arrived
            logToVSCode(`Received Event: ${JSON.stringify(message)}`);
            console.log("received event");

            switch (message.command) {
                case 'receiveMessage':
                    logToVSCode("Updating State with Success Data");
                    setResponse(message.text);
                    break;
                case 'receiveError':
                    logToVSCode("Updating State with Error");
                    setResponse({ error_message: message.text });
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const sendMessage = () => {
        logToVSCode(`User clicked send: ${userInput}`);
        vscode.postMessage({
            command: 'sendMessage',
            text: userInput,
            errors: inclErrors,
            optims: inclOptimizations,
            style: inclStyle
        });
        setResponse(null);
        setIsLoading(true);
    };

    const handleErrors = () => {
        setInclErrors(!inclErrors);
    }

    const handleOptimizations = () => {
        setInclOptimizations(!inclOptimizations);
    }

    const handleStyle = () => {
        setInclStyle(!inclStyle);
    }

    return (
        <div style={{ padding: '10px' }}>
            <h2>Debug Assist</h2>
            <label>
                <input
                    type="checkbox"
                    checked={inclErrors}
                    onChange={handleErrors}
                />
                Errors
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={inclOptimizations}
                    onChange={handleOptimizations}
                />
                Optimizations
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={inclStyle}
                    onChange={handleStyle}
                />
                Style
            </label>
            <textarea 
                rows={4}
                style={{ width: '100%', marginBottom: '10px' }}
                placeholder="Type your prompt..." 
                onChange={(e) => setUserInput(e.target.value)} 
                value={userInput}
            />
            <button onClick={sendMessage} style={{ width: '100%', padding: '8px' }}>
                Analyze Code
            </button>

            {isLoading && (
                <div>
                    <h3>Loading...</h3>
                </div>
            )}

            {response && (
                <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #ccc' }}>
                    <h3>Error/Suggestion:</h3>
                    {/* Render the specific field if it exists, or the whole object */}
                    <p>{response.error_message || JSON.stringify(response)}</p>
                </div>
            )}
        </div>
    );
}