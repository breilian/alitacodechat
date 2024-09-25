import {render, screen} from '@testing-library/react'
import App from "@/App.jsx";
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import React from "react";
import getDesignTokens from "@/MainTheme.js";
import userEvent from '@testing-library/user-event'
import {setupServer} from 'msw/node'
import {http, HttpResponse} from 'msw'
import {UiMessageTypes, VsCodeMessageTypes} from "shared";

// const spyWindowAcquireVSCApi = vitest.spyOn(window, 'acquireVsCodeApi');
// spyWindowAcquireVSCApi.mockImplementation(() => ({
//   postMessage: ({ id, type, data }, targetOrigin) => {
//     console.log(`FIRE - ${type}`)
//   }
// }));

vitest.stubGlobal('acquireVsCodeApi', () => ({
  postMessage: ({id, type, data}, targetOrigin) => {
    const messageFromExtension = {id}
    switch (type) {
      case VsCodeMessageTypes.getSocketConfig: {
        messageFromExtension.type = UiMessageTypes.getSocketConfig;
        messageFromExtension.data = {
          projectId: 888,
          host: 'wss://eye.projectalita.aiA',
          token: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiM2MwNzZiNzQtYjNjMi00MDA3LWE0YTItZDc2N2JiNTcyNmM2IiwiZXhwaXJlcyI6IjIwMjUtMDctMjRUMTI6NTQifQ.OO-eCS_7WWvYr6oj7SmoBBprLQa1WI-ZEaUmRKJulV6KV75PPW3COSS7CYmU95ijwS_L_zqIR4I37wlaQ1V4FA',
          path: '/socket.io'
        };
        break;
      }
      case VsCodeMessageTypes.getModelSettings: {
        messageFromExtension.type = UiMessageTypes.getModelSettings;
        messageFromExtension.data = {
          "model": {
            "model_name": "gpt-4-0125-preview"
          },
          "temperature": 0.8,
          "max_tokens": 4096,
          "top_p": 0.8,
          "top_k": 40,
          "stream": true
        };
        break;
      }
      case VsCodeMessageTypes.getPrompts: {
        messageFromExtension.type = UiMessageTypes.getPrompts;
        messageFromExtension.data = [];
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
        messageFromExtension.data = [];
        break;
      }
      case VsCodeMessageTypes.getSelectedText: {
        messageFromExtension.type = UiMessageTypes.getSelectedText;
        messageFromExtension.data='Mocked selected text for tests';
        break;
      }
    }
    
    window.postMessage(messageFromExtension, '*');
    console.log("FIRED INNNN MOCK ", type)
  }
}));

describe('App', () => {
  it('renders the App component', async () => {
    const theme = createTheme(getDesignTokens('dark'));
    const user = userEvent.setup()
    
    // console.log(">>>>>>>>>>>>>>>>>>>>" + theme.palette.icon.fill.default)
    // console.log(">>>>>>>>>>>>>>>>>>>>" + theme.palette.border.lines)
    // console.log(">>>>>>>>>>>>>>>>>>>>" + theme.palette.background.secondary)
    const {queryByRole} = render(<ThemeProvider theme={theme}>
      <CssBaseline/>
      <App/>
    </ThemeProvider>)
    
    expect(await screen.findByTestId('RefreshOutlinedIcon')).toBeVisible()
    expect(await screen.findByRole('alert')).toBeVisible()
    const chatInput = screen.getByPlaceholderText('Type your message')
    expect(chatInput).toHaveValue('')
    await user.type(chatInput, 'Hello AI')
    expect(chatInput).toHaveValue('Hello AI')
    
    await user.click(screen.getByLabelText('send your question'))
    expect(chatInput).toHaveValue('')
    
    
    // screen.debug();
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