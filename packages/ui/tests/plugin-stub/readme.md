## Overview: JetBrains plugin and react chat UI.

**_vscodeRef.current_** object is substituted by our new one **_with custom postMessage method_**.  
Custom postMessage **_intercepts all messages_** from chat to VS Code plugin.  
It does **_not call original window.postMessage_** to sent message to the plugin.  
Instead of this **_it does http GET_** call to http://calltoide.com in order **_to get some ideResponse_**.  
And now retrieved ideResponse is used as **_input for native window.postMessage_** to the chat - window.postMessage(ideResponse).  

The aim of current plugin server is substitution of real JetBrains (or VS Code) plugin for testing or debugging purposes.
This approach is suitable only for **webpack** managed version of chat.

## Plugin Server

Plugin server receives some requests from chat UI, calls to Alita and responses with some data.

Base command to start server:
npm start -- -sh https://eye.projectalita.ai -st TOKEN_VALUE -spid PROJECT_ID_VALUE -muid UID_VALUE

Required parameters:  
-sh: LLM Server host  
-st: LLM Server token  
-spid LLM Server project id  
-muid Model integration UID  

Optional parameters:  
-p: Port to start plugin server. Default value is _3333_.  
-ms: Path to json file with model settings. Default value is _model-settings.json_ which is in the root of project.  

## React chat UI with webpack

To start UI execute the command below from folder packages/ui:  
npx webpack serve --mode development --env plugin=http://localhost:3333**

Parameter --env serves to pass host of plugin server. Default value is http://calltoide.com

By default, react chat UI is available to interact by http://localhost:8080/
Use option --port to specify another port (_npx webpack serve --mode development --port 1234 ..._)

#### Debug
You need run javascript debug configuration from your IDE on webpack port (default is 8080).  
VS Code: https://code.visualstudio.com/docs/nodejs/reactjs-tutorial#_debugging-react  
WebStorm: https://www.jetbrains.com/help/webstorm/react.html#react_debug_via_js_debug_rc