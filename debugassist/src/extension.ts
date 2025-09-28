import * as vscode from 'vscode';
import axios, { AxiosResponse } from 'axios';
import { WebviewPanel } from './panels/WebviewPanel';

interface ExtensionConnectResponse {
	message: string;
}

export function activate(context: vscode.ExtensionContext) {

	const showPanelCommand = vscode.commands.registerCommand('debugassist.showWebview', () => {
		WebviewPanel.render(context.extensionUri);
	});

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

	context.subscriptions.push(disposable);
	context.subscriptions.push(showPanelCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
