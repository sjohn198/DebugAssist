import * as vscode from 'vscode';
import axios, { AxiosResponse } from 'axios';
import SidebarProvider from "./providers/SidebarProvider";
import ExtensionConnectResponse from "./extensionConnectResponse";

export function activate(context: vscode.ExtensionContext) {

	const sidebarProvider: SidebarProvider = new SidebarProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("queryFormView", sidebarProvider)
	);

	let getText = vscode.commands.registerCommand('debugAssist.getText', async () => {
		vscode.window.showInformationMessage("In get text");
		const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;

		if (editor) {
			const selection: vscode.Selection = editor.selection;
			const document: vscode.TextDocument = editor.document;
			let text: string = document.getText(selection);

			if (text.length == 0) {
				text = document.getText();
				if (text.length == 0) {
					return undefined;
				}
			}

			console.log(text.length)

			if (text.length == 0) {
				vscode.window.showWarningMessage("No text is selected");
				return;
			}

			vscode.window.showInformationMessage("Successfully captured the text!");

			console.log(text);

			return text;

		} else {
			vscode.window.showWarningMessage("No editor is open");
		}
	});

	context.subscriptions.push(getText);
}
