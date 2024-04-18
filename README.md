# Alita Code Chat

Alita Code Chat for VSCode is an auxiliary GUI for Alita Code, you can utilize the functionality of Alita Code and you can also chat with Alita.

# Pre-requisite
Alita Code Chat depends on Alita Code for VSCode. It can be installed through vs code's extension market: https://marketplace.visualstudio.com/items?itemName=ProjectAlita.alitacode



# Features list:

- Chat with Alita directly. It will use the model settings set by Alita Code extension.
- Type trigger char to add participants to chat: "/" for prompt, "#" for datasources.


## Initialize

`npm install`

## Generate Extension Package
Run following to generate the `.vsix ` package. Then you can publish it or install it manually in vs code extension by clicking the 3 dots in "Extension" and then "Install from VSIX..."

`npm run vsce`

## Development
Run following and VS Code's "Run" >> "Start Debugging" to debug extension with auto rebuild.

`npm run build-watch`

Type `Command + P` in VS code and then `>Developer: Open Webview Developer Tools` to open the ui debug tool just like the Chrome browser debug tool.

