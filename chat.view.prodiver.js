const vscode = require('vscode');
const path = require('path')
const fs = require('fs')
const html_modifier = require('html-modifier');

const chatViewBuildPath = 'ui';
const WEBVIEW_INJECT_IN_MARK = '__webview_public_path__';
class ChatViewProvider {
  constructor(
    _extensionUri,
  ) {
    this._extensionUri = _extensionUri;
    this._view = undefined;
  }

  resolveWebviewView(
    webviewView,
    context,
    _token,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [
        this._extensionUri
      ]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(data => {
      switch (data.type) {
        case 'colorSelected': {
          vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString(`#${data.value}`));
          break;
        }
      }
    });
  }

  addColor() {
    if (this._view) {
      this._view.webview.postMessage({ type: 'addColor' });
    }
  }

  clearColors() {
    if (this._view) {
      this._view.webview.postMessage({ type: 'clearColors' });
    }
  }

  _getHtmlForWebview(webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    // const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, chatViewBuildPath, 'main.js'));
    const mainPanelJsUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, chatViewBuildPath, 'dist', 'main.js'));
    const publicPath = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, chatViewBuildPath, 'dist'));


    // Do the same for the stylesheet.
    const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, chatViewBuildPath, 'dist', 'assets', 'index.css'));
    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, chatViewBuildPath, 'dist', 'assets', 'react.svg'));
    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, chatViewBuildPath, 'dist', 'assets', 'main.css'));

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
        <meta charset="UTF-8">
        <base target="_top" href="/">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vite App</title>
        <script> window.__webview_public_path__ = "${publicPath}"</script>
        <script type="module" crossorigin src="${mainPanelJsUri}"></script>
        <link rel="stylesheet" href="${styleResetUri}">
        <link rel="stylesheet" href="${styleVSCodeUri}">
        <link rel="stylesheet" href="${styleMainUri}">
        <script type="module" crossorigin src="${mainPanelJsUri}"></script>
			</head>
      <body>
        <div id="root"></div>
      </body>
    </html>`;
  }
}

ChatViewProvider.viewType = 'alitacodechat.view';
function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

module.exports = ChatViewProvider;