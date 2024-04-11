/* eslint-disable no-unused-vars */
const vscode = require('vscode');
const { getAlitaService, VsCodeMessageTypes, UiMessageTypes } = require('./consts');

const chatViewBuildPath = 'dist';
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

    webviewView.webview.onDidReceiveMessage((message) => {
      try {
        const alitaService = getAlitaService()
        switch (message.type) {
          case VsCodeMessageTypes.getPrompts: {
            this.getResponse(alitaService, 'getPrompts')
            break;
          }
          case VsCodeMessageTypes.getDatasources: {
            this.getResponse(alitaService, 'getDatasources')
            break;
          }
          case VsCodeMessageTypes.getChatResponse: {
            this.getResponse(alitaService, 'chat', message.data, 'getChatResponse')
            break;
          }
        }
      } catch (err) {
        console.error(err)
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


  startLoading() {
    this.sendMessageToWebView({
      type: UiMessageTypes.startLoading,
    })
  }

  stopLoading() {
    this.sendMessageToWebView({
      type: UiMessageTypes.stopLoading,
    })
  }

  sendMessageToWebView(message) {
    this._view.webview.postMessage(message)
  }

  getResponse (alitaService, operation, params, messageType) {
    if (alitaService) {
      this.startLoading()
      alitaService[operation](params).then(data => {
        this.sendMessageToWebView({
          type: UiMessageTypes[messageType || operation],
          data,
        })
        this.stopLoading()
      }).catch(err => {
        this.sendMessageToWebView({
          type: UiMessageTypes.error,
          message: err
        })
        this.stopLoading()
      })
    } else {
      this.sendMessageToWebView({
        type: UiMessageTypes.error,
        message: 'Alita service not found'
      })
    }
  }

  _getHtmlForWebview(webview) {
    const mainPanelJsUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, chatViewBuildPath, 'main.js'));
    const publicPath = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, chatViewBuildPath, 'dist'));


    // Do the same for the stylesheet.
    const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, chatViewBuildPath, 'assets', 'index.css'));
    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, chatViewBuildPath, 'assets', 'react.svg'));
    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'static', 'main.css'));

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
        <meta charset="UTF-8">
        <link rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" />
        <base target="_top" href="/">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Alita Code Chat</title>
        <script> window.__webview_public_path__ = "${publicPath}"</script>
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
ChatViewProvider.toWebView = 'alitacodechat.toWebView';

module.exports = ChatViewProvider;