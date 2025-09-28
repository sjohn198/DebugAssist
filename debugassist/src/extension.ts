import * as vscode from 'vscode';
import axios, { AxiosResponse } from 'axios';

interface ExtensionConnectResponse {
	message: string;
}

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('debugassist.getText', async () => {
		const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;

		if (editor) {
			const selection: vscode.Selection = editor.selection;
			const document: vscode.TextDocument = editor.document;
			const text: string = document.getText(selection);

			console.log(text.length)

			if (text.length == 0) {
				vscode.window.showWarningMessage("No text is selected");
				return;
			}

			vscode.window.showInformationMessage("Successfully captured the text!");

			console.log(text);

			try {
				await vscode.window.withProgress({
					location: vscode.ProgressLocation.Notification,
					title: "Sending to FastAPI...",
					cancellable: false
				}, async (progress) => {
					console.log("attempting to send text");
					const response: AxiosResponse<ExtensionConnectResponse> = await axios.post(
						'http://localhost:8000/api/test-extension-connection',
						{ selected_text: text }
					)

					const content: ExtensionConnectResponse = response.data;

					console.log("Backend response: ", content.message);

					vscode.window.showInformationMessage(`Backend says: ${content.message}`);
				});

			} catch (error) {
				console.error("Error calling backend:", error);
				vscode.window.showWarningMessage(`Error calling backend: ${error}`);
			}
		} else {
			vscode.window.showWarningMessage("No editor is open");
		}
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// const disposable = vscode.commands.registerCommand('debugassist.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed
	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World from debugassist!');
	// });

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
