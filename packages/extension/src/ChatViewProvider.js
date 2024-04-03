const vscode = require('vscode');

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

module.exports = ChatViewProvider;