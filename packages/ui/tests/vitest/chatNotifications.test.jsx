import {render, screen} from './utils/testingLibraryWrapper'
import App from '@/App.jsx';
import React from 'react';
import userEvent from '@testing-library/user-event'
import {UiMessageTypes, VsCodeMessageTypes} from 'shared';
import {act, waitFor} from '@testing-library/react';
import mockIo from 'socket.io-client';

vitest.stubGlobal('acquireVsCodeApi', () => ({
  postMessage: ({id, type}) => {
    const messageFromExtension = {id}
    switch (type) {
      case VsCodeMessageTypes.getSocketConfig: {
        messageFromExtension.type = UiMessageTypes.getSocketConfig;
        messageFromExtension.data = {
          projectId: 555,
          host: 'wss://eye.projectalita.ai_test',
          token: 'test_token',
          path: '/socket.io'
        };
        break;
      }
      case VsCodeMessageTypes.getModelSettings: {
        messageFromExtension.type = UiMessageTypes.getModelSettings;
        messageFromExtension.data = {
          model: {
            model_name: 'gpt-4o'
          },
          temperature: 0.8,
          max_tokens: 4096,
          top_p: 0.8,
          top_k: 40,
          stream: true
        };
        break;
      }
      case VsCodeMessageTypes.getPrompts: {
        messageFromExtension.type = UiMessageTypes.getPrompts;
        messageFromExtension.data = [
          {
            "id": 6,
            "name": "Test Cases",
            "description": "",
            "owner_id": 57,
            "created_at": "2024-08-29T12:17:45.744434",
            "authors": [
              {
                "id": 91,
                "email": "liana_gevorgyan@epam.com",
                "name": "Liana Gevorgyan",
                "avatar": "https://static.cdn.epam.com/avatar/9caa794aaf38c4cfecaa8ae4f549f22f.jpg"
              }
            ],
            "tags": [
              {
                "name": "code",
                "data": {
                  "color": "red"
                },
                "id": 1
              }
            ],
            "status": "draft"
          },
          {
            "id": 1,
            "name": "SQL Task",
            "description": "This prompt will provide step by step DB creation",
            "owner_id": 57,
            "created_at": "2024-08-29T11:17:27.448751",
            "authors": [
              {
                "id": 91,
                "email": "liana_gevorgyan@epam.com",
                "name": "Liana Gevorgyan",
                "avatar": "https://static.cdn.epam.com/avatar/9caa794aaf38c4cfecaa8ae4f549f22f.jpg"
              }
            ],
            "tags": [
              {
                "name": "code",
                "data": {
                  "color": "red"
                },
                "id": 1
              }
            ],
            "status": "draft"
          }
        ];
        break;
      }
      case VsCodeMessageTypes.getDatasources: {
        messageFromExtension.type = UiMessageTypes.getDatasources;
        messageFromExtension.data = [];
        break;
      }
      case VsCodeMessageTypes.getApplications: {
        messageFromExtension.type = UiMessageTypes.getApplications;
        messageFromExtension.data = [];
        break;
      }
      case VsCodeMessageTypes.getDeployments: {
        messageFromExtension.type = UiMessageTypes.getDeployments;
        messageFromExtension.data = [
          {
            "id": 14,
            "project_id": null,
            "name": "open_ai_azure",
            "section": {
              "name": "ai",
              "integration_description": "Manage ai integrations",
              "test_planner_description": ""
            },
            "settings": {
              "api_token": "{{secret.f232638af6e44beab9415b3b25055745}}",
              "model_name": "gpt-35-turbo",
              "models": [
                {
                  "id": "gpt-4o-mini",
                  "name": "gpt-4o-mini",
                  "capabilities": {
                    "completion": false,
                    "chat_completion": true,
                    "embeddings": false
                  },
                  "token_limit": 16384
                }
              ],
              "api_version": "2023-03-15-preview",
              "api_base": "https://alita-useast-openai.openai.azure.com/",
              "api_type": "azure",
              "temperature": 0,
              "max_tokens": 512,
              "top_p": 0.8,
              "stream": false
            },
            "is_default": false,
            "config": {
              "name": "gpt-4o-mini",
              "is_shared": true
            },
            "task_id": null,
            "status": "success",
            "uid": "c241d875-9917-4bc1-8be6-508e03701860"
          },
        ];
        break;
      }
      case VsCodeMessageTypes.getSelectedText: {
        messageFromExtension.type = UiMessageTypes.getSelectedText;
        messageFromExtension.data='Mocked selected text for tests';
        break;
      }
    }
    
    window.postMessage(messageFromExtension, '*');
  }
}));

describe('Chat Notifications Test', () => {
  test('"connect_error" message received from socket', async () => {
    // 1 when socket host is incorrect
    const user = userEvent.setup();
    
    render(<App/>);
    
    // expect io() to be called when create socket connection
    await waitFor(() => {
      expect(mockIo).toBeCalledTimes(1)
    });
    const socket = mockIo.mock.results[0].value;
    
    expect(socket.on).toBeCalledTimes(4);
    
    expect(await screen.findByTestId('RefreshOutlinedIcon')).toBeVisible();
    
    const chatInput = screen.getByPlaceholderText('Type your message');
    expect(chatInput).toHaveValue('');
    await user.type(chatInput, 'Hello AI');
    expect(chatInput).toHaveValue('Hello AI');

    await user.click(screen.getByLabelText('send your question'));
    expect(chatInput).toHaveValue('');
    
    await waitFor(async () => {
      expect(socket.emit).toBeCalledTimes(1);
      // expect(socket.emit).toHaveBeenCalledWith({a:1});
    })
    
    // promptlib_predict
    // start_task
    act(() => {
      // find 'promptlib_predict' listener in 'on' calls
      const promptlibPredictListener = socket.on.mock.calls.find(([event]) => event === 'promptlib_predict')[1];
      // fire 'promptlib_predict' message received
      promptlibPredictListener({
        stream_id: '123456789',
        // message_id: '',
        type: 'start_task',
        message_type: '',
        response_metadata: {},
      });
    });
    
    await waitFor(async () => {
      const messages = await screen.findAllByTestId('message-block');
      expect(messages).toHaveLength(2);
      expect(messages[0]).toHaveTextContent('Uless than a minute agoHello AI');
      //THINKING
      expect(messages[1]).toHaveTextContent('less than a minute ago');
    });
    
    expect(chatInput).toBeDisabled();
    
    act(() => {
      // find 'promptlib_predict' listener in 'on' calls
      const promptlibPredictListener = socket.on.mock.calls.find(([event]) => event === 'promptlib_predict')[1];
      // fire 'promptlib_predict' message received
      promptlibPredictListener({
        stream_id: '123456789',
        // message_id: '',
        type: 'AIMessageChunk',
        content: 'MOCKED_1_CHUNK',
        response_metadata: {finish_reason: 1},
      });
    });
    
    await waitFor(async () => {
      const messages = await screen.findAllByTestId('message-block');
      expect(messages).toHaveLength(2);
      expect(messages[0]).toHaveTextContent('Uless than a minute agoHello AI');
      //THINKING
      expect(messages[1]).toHaveTextContent('less than a minute agoMOCKED_1_CHUNK');
      
      // fixme
      // const chatInput2 = screen.getByPlaceholderText('Type your message');
      expect(chatInput).toBeEnabled();
    }, {timeout: 5000});
    
    
    await user.type(chatInput, '/');
    expect(chatInput).toHaveValue('/');
    const prompts = await screen.findAllByRole('menuitem');
    expect(prompts).toHaveLength(2);
    expect(prompts[0]).toHaveTextContent('Test Cases');
    expect(prompts[1]).toHaveTextContent('SQL Task')
    await user.keyboard('[Escape]');
    
    act(() => {
      // find 'connect_error' listener in 'on' calls
      const connectErrorListener = socket.on.mock.calls.find(([event]) => event === 'connect_error')[1];
      // fire 'connect_error' message received
      connectErrorListener(new Error('Test for socket connection error'));
    });

    expect(await screen.findByRole('alert')).toBeVisible();
    expect(await screen.findByRole('alert')).toHaveTextContent('Socket connection error: Test for socket connection error');
  })
})

// const server = setupServer(
//   http.get('/work', ({request}) => {
//     console.log(`>>>>>>>>>>>>>>>>>>>>>>> WORK`)
//     console.log(request.url)
//     console.log(new URL(request.url).searchParams)
//     console.log(request.method)
//    
//     // console.log(Object.getOwnPropertyNames(req.params))
//     // console.log(Object.getOwnPropertyNames(req.params))
//     // console.log(Object.getOwnPropertyNames(req.params))
//     return HttpResponse.json({data: 'hello there'})
//   }),
// )
//
// // establish API mocking before all tests
// beforeAll(() => server.listen())
// // reset any request handlers that are declared as a part of our tests
// // (i.e. for testing one-time error scenarios)
// afterEach(() => server.resetHandlers())
// // clean up once the tests are done
// afterAll(() => server.close())

// const mockInternetConnection = (status) => {
//   const events = {};
//   jest.spyOn(window, 'addEventListener').mockImplementation((event, handle, options?) => {
//     // @ts-ignore
//     events[event] = handle;
//   });
//   const goOffline = new window.Event(status);
//   act(() => {
//     window.dispatchEvent(goOffline);
//   });
// };