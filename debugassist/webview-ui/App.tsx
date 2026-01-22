import React, { useState, Dispatch, SetStateAction, useEffect } from "react";

const vscode = acquireVsCodeApi();

export default function App() {
    const [userInput, setUserInput]: [string, Dispatch<SetStateAction<string>>] = useState("");
    const [response, setResponse] = useState<any>(null);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;

            console.log("Full Message Received:", message);
            switch (message.command) {
                case 'receiveMessage':
                    setResponse(message.text);
                    break;
                case 'receiveError':
                    setResponse({ error: message.text });
                    break;
            }
        }

        window.addEventListener('message', handleMessage);

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleTyping = (e) => {
        setUserInput(e.target.value);
    };

    const sendMessage = () => {
        vscode.postMessage({
            command: 'sendMessage',
            text: userInput
        });
        setUserInput("");
    };

    return (
        <div>
            <h1>Send a Message</h1>
            <input type="text" id="message-input" placeholder="Type something..." onChange={(e) => handleTyping(e)} value={userInput}/>
            <button id="send-button" onClick={sendMessage}>Send</button>

            {response && (
                <div className="response-box" style={{ marginTop: '20px', borderTop: '1px solid #ccc' }}>
                    <h3>Analysis Result:</h3>
                    <pre>{JSON.stringify(response, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}