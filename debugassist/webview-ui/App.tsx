import React, { useState, Dispatch, SetStateAction } from "react";

const vscode = acquireVsCodeApi();

export default function App() {
    const [userInput, setUserInput]: [string, Dispatch<SetStateAction<string>>] = useState("");

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
            <script src="main.js"></script>
        </div>
    );
}