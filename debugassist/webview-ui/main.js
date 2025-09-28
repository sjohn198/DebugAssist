const vscode = acquireVsCodeApi();

document.getElementById('send-button').addEventListener('click', () => {
  const messageInput = document.getElementById('message-input');
  const text = messageInput.value;

  // Send a message back to the extension
  vscode.postMessage({
    command: 'sendMessage',
    text: text
  });
});