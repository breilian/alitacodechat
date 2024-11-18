import {render, screen} from './utils/testingLibraryWrapper'
import App from '@/App.jsx';
import React from 'react';
import userEvent from '@testing-library/user-event'
import {act, cleanup, waitFor} from '@testing-library/react';
import mockIo from 'socket.io-client';
import mockCodeExtension from "./utils/mockCodeExtension";
import mockSocketIOClient from "./utils/mockSocketIOClient.js";

window.HTMLElement.prototype.scrollIntoView = function() {};

beforeEach(() => {
  // mockSocketIOClient();
  // mockCodeExtension();
})

afterEach(() => {
  cleanup();
  vitest.clearAllMocks();
})

describe('Chat Notifications Test', () => {
  test('"connect_error" message received from socket', async () => {
    mockCodeExtension({
      selectedText: () => {
        return 'REPLACED 22 TEXT'
      }
    });
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
  
  
  // test('Actor Dataset has required settings missed', async () => {
  //   mockCodeExtension({
  //     datasourceDetail: (data) => {
  //       data.version_details.datasource_settings.chat.chat_settings_embedding = null;
  //       data.version_details.datasource_settings.chat.chat_settings_ai = null;
  //       return data;
  //     }
  //   })
  //   // 1 when socket host is incorrect
  //   const user = userEvent.setup();
  //  
  //   render(<App/>);
  //  
  //   // expect io() to be called when create socket connection
  //   await waitFor(() => {
  //     expect(mockIo).toBeCalledTimes(1)
  //   });
  //   const socket = mockIo.mock.results[0].value;
  //  
  //   expect(socket.on).toBeCalledTimes(4);
  //  
  //   expect(await screen.findByTestId('RefreshOutlinedIcon')).toBeVisible();
  // })
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