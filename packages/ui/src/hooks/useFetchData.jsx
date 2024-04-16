
export const useFetchData = async ({ vscode }) => {
  let messageID = 0;
  const messagePromises = {};

  function sendMessage(message) {
    const id = messageID++;
    return new Promise((resolve, reject) => {
      messagePromises[id] = { resolve, reject };
      vscode.postMessage({ id, ...message });
    });
  }
  
  window.addEventListener('message', event => {
    const message = event.data;
    if (messagePromises[message.id]) {
      messagePromises[message.id].resolve(message.result);
      delete messagePromises[message.id];
    }
  });

  return {
    sendMessage
  }
}