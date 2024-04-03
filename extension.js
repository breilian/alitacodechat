const vscode = require('vscode');
const ChatViewProvider = require('./chat.view.prodiver.js');

function sayHello () {
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from AlitaCodeChat!');
}

function activate(context) {
	const provider = new ChatViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ChatViewProvider.viewType, provider, {
			webviewOptions: { retainContextWhenHidden: true },
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('calicoColors.addColor', () => {
			provider.addColor();
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('calicoColors.clearColors', () => {
			provider.clearColors();
		}));

	context.subscriptions.push(vscode.commands.registerCommand('alitacodechat.helloWorld', sayHello));
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
