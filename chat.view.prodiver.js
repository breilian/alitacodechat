const vscode = require('vscode');

const chatViewBuildPath = 'media';
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
    const mainPanelJsUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'ui', 'alitaUI.js'));


    // Do the same for the stylesheet.
    const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, chatViewBuildPath, 'reset.css'));
    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, chatViewBuildPath, 'vscode.css'));
    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, chatViewBuildPath, 'main.css'));

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
        <meta charset="UTF-8" />
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; script-src vscode-resource:; style-src vscode-resource: 'unsafe-inline';">
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap"
        />
        <link rel="icon" type="image/svg+xml" href="https://avatars.githubusercontent.com/u/147170315?s=100" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ProjectAlita</title>
        <!-- alita_ui_config -->
        <script type="module" crossorigin src="${mainPanelJsUri}"></script>
			</head>
      <body>
        <div id="root"></div>
      </body>
			</html>`;

    //       <head>
    //         <meta charset="UTF-8">

    // <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

    // <meta name="viewport" content="width=device-width, initial-scale=1.0">

    // <link href="${styleResetUri}" rel="stylesheet">
    // <link href="${styleVSCodeUri}" rel="stylesheet">
    // <link href="${styleMainUri}" rel="stylesheet">

    // <title>Cat Colors</title>
    //       </head>
    // <body>
    // 	<ul class="color-list">
    // 	</ul>

    // 	<button class="add-color-button">Add Color</button>

    // 	<script nonce="${nonce}" src="${scriptUri}"></script>

    // </body>
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