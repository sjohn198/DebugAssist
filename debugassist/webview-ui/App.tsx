import React, { useState, Dispatch, SetStateAction, useEffect } from "react";

const vscode = acquireVsCodeApi();

interface ResponseData {
    error_message?: string;
    [key: string]: any;
}

export default function App() {
    const [userInput, setUserInput] = useState("");
    const [response, setResponse] = useState<ResponseData | null>(null);

    // Helper to send logs to VS Code Output
    const logToVSCode = (msg: string) => {
        vscode.postMessage({ command: 'log', text: msg });
    };

    useEffect(() => {
        // 1. Notify that React has mounted
        logToVSCode("React App Mounted and Listener Attached");
        console.log("useEffect mounted")

        const handleMessage = (event: MessageEvent) => {
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
            text: userInput
        });
        setResponse(null); // Clear previous results
    };

    return (
        <div style={{ padding: '10px' }}>
            <h2>Debug Assist</h2>
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

            {response && (
                <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
                    <h3>Result:</h3>
                    {/* Render the specific field if it exists, or the whole object */}
                    <p>{response.error_message || JSON.stringify(response)}</p>
                </div>
            )}
        </div>
    );
}