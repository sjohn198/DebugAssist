import * as vscode from 'vscode';
import { getUri } from "../utilities/getUri"
import { getNonce } from "../utilities/getNonce"
import * as fs from "fs";
import * as path from "path";
import axios, { AxiosResponse } from "axios";
import ExtensionConnectResponse from "../extensionConnectResponse";

interface WebviewMessage {
    command: string;
    message: string;
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
        const csp = `default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';`;
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
                                title: "Sedning to FastAPI...",
                                cancellable: false
                            }, async (progress) => {
                                const response: AxiosResponse<ExtensionConnectResponse> = await axios.post(
                                    'http://localhost:8000/api/test-extension-connection',
                                    { 
                                        selected_text: prompt,
                                        code: code 
                                    },
                                );

                                const content: ExtensionConnectResponse = response.data;
                                console.log(`We got the content: ${content.message}`);
                                vscode.window.showInformationMessage(`Backend says: ${content.message}`);

                            })
                        } catch (error) {
                            vscode.window.showInformationMessage(`Failed with error: ${error}`);
                            console.log(`Error occurred while sending to backend: ${error}`);
                        }

                        vscode.window.showInformationMessage(`Done`);
                        return;
                }
            }
        )
    }
}