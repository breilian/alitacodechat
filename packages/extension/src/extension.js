const vscode = require('vscode');
const ChatViewProvider = require('./ChatViewProvider.js');
const { getAlitaCodeExtension } = require('./consts');

function registerWebView(context) {

  const provider = new ChatViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ChatViewProvider.viewType, provider, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
    vscode.workspace.onDidChangeConfiguration((event) => {
      const changed = event.affectsConfiguration('alitacode.serviceProviderForLLM') ||
        event.affectsConfiguration('alitacode.providerServerURL') ||
        event.affectsConfiguration('alitacode.projectId') ||
        event.affectsConfiguration('alitacode.integrationUid') ||
        event.affectsConfiguration('alitacode.authToken')
      if (changed) {
        provider.sendSettingChanged()
      }
    }),
  );
}

function activate(context) {
  const sourceExtension = getAlitaCodeExtension();
  if (!sourceExtension.isActive) {
    sourceExtension.activate().then(() => {
      registerWebView(context)
    })
  } else {
    registerWebView(context)
  }
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
  activate,
  deactivate
}
