// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('debugAssist.getText', () => {
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;
			const text = document.getText();

			vscode.window.showInformationMessage("Successfully captured the text!");

			console.log(text);
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
