import * as vscode from 'vscode';
import { getUri } from "../utilities/getUri"
import { getNonce } from "../utilities/getNonce"
import * as fs from "fs";
import * as path from "path";
import axios, { AxiosResponse } from "axios";
import ExtensionConnectResponse from "../extensionConnectResponse";

interface WebviewMessage {
    command: string;
    text: any;
}

export default class SideBarProvider implements vscode.WebviewViewProvider {
    //underscore in the name indicates that a variable is private
    private _view?: vscode.WebviewView;
    private _extensionUri: vscode.Uri;

    constructor(extensionUri: vscode.Uri) {
        this._extensionUri = extensionUri;
    }

    public resolveWebviewView (
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'webview-ui', 'build')]
        };

        webviewView.webview.html = this._getWebviewContent(webviewView.webview, this._extensionUri);

        this._setWebviewMessageListener(webviewView.webview);
    }

    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
        const buildPath: vscode.Uri = vscode.Uri.joinPath(extensionUri, 'webview-ui', 'build');
        const indexPath: vscode.Uri = vscode.Uri.joinPath(buildPath, 'index.html');

        let html: string = fs.readFileSync(indexPath.fsPath, 'utf-8');
        html = html.replace(
            /<(link|script).+?(href|src)="\/assets\/(.+?)"/g,
            (match, tag, attribute, assetFile) => {
                const assetPath = vscode.Uri.joinPath(buildPath, 'assets', assetFile);
                const assetUri = webview.asWebviewUri(assetPath);
                return match.replace(`="/assets/${assetFile}"`, `="${assetUri}"`);
            }
        )

        const nonce = getNonce();
        const csp = `default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-eval';`;
        html = html.replace(
            /<meta http-equiv="Content-Security-Policy" content=".+?">/,
            `<meta http-equiv="Content-Security-Policy" content="${csp}">`
        );
        
        html = html.replace(
            /<script type="module"/,
            `<script type="module" nonce="${nonce}"`
        );

        return html;
    }

    private _setWebviewMessageListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage(
            async (info: WebviewMessage) => {
                const command: string = info.command;
                const prompt: string = info.text;
                const errors: bool = info.errors;
                const optims: bool = info.optims;
                const style: bool = info.style;

                switch (command) {
                    case 'sendMessage':
                        vscode.window.showInformationMessage(`You sent ${prompt}`);
                        let code: string = await vscode.commands.executeCommand<string>('debugAssist.getText');

                        console.log(`String in send message: ${code}`);
                        try {
                            console.log("attempting to send");
                            vscode.window.showInformationMessage(`Attempting to send`);
                            await vscode.window.withProgress({
                                location: vscode.ProgressLocation.Notification,
                                title: "Sending to FastAPI...",
                                cancellable: false
                            }, async () => {
                                console.log(`Errors: ${errors}`);
                                console.log(`Optims: ${optims}`);
                                console.log(`Style: ${style}`);
                                const response: AxiosResponse<ExtensionConnectResponse> = await axios.post(
                                    'http://localhost:8000/api/test-openai',
                                    { 
                                        prompt: prompt,
                                        code: code,
                                        errors: errors,
                                        optims: optims,
                                        style: style
                                    },
                                );

                                const content: ExtensionConnectResponse = response.data;
                                vscode.window.showInformationMessage(`Backend says: ${content}`); // You said this works

                                if (this._view) {
                                    console.log("Provider: Found valid view, sending message..."); // Look for this in Debug Console
                                    this._view.webview.postMessage({
                                        command: "receiveMessage",
                                        text: content
                                    });
                                } else {
                                    // If you see this, your reference to the webview was lost!
                                    console.error("Provider Error: this._view is undefined!");
                                    vscode.window.showErrorMessage("Error: Cannot update UI because the Webview is not connected.");
                                }

                            })
                        } catch (error) {
                            if (this._view) {
                                this._view.webview.postMessage({
                                    command: 'receiveError',
                                    text: `Error: ${error}`
                                });
                            }
                            if (error instanceof AggregateError) {
                                vscode.window.showInformationMessage(error.errors);
                                console.log(`Aggregate errors occurred while sending to backend: ${error}`);
                            } else {
                                vscode.window.showInformationMessage(`Failed with error: ${error}`);
                                console.log(`Error occurred while sending to backend: ${error}`);
                            }
                        }

                        vscode.window.showInformationMessage(`Done`);
                        return;
                }
            }
        )
    }  
}