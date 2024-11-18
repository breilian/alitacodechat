import React from 'react';
import {render} from '@testing-library/react';
import {createTheme, CssBaseline, ThemeProvider} from '@mui/material';
import getDesignTokens from '@/MainTheme.js';
import {ThemeProvider as EmotionThemeProvider} from '@emotion/react';

const providers = ({ children }) => {
  const theme = createTheme(getDesignTokens('dark'));
  
  // The properties below are available in theme (mui / emotion) before render but absent after rendering in jest-dom.
  // console.log(theme.palette.icon.fill.default)
  // console.log(theme.palette.border.lines)
  // console.log(theme.palette.background.secondary)
  // Solution: EmotionThemeProvider is used due to https://mui.com/material-ui/migration/troubleshooting/#storybook-and-emotion
  return (
    <EmotionThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        {children}
      </ThemeProvider>
    </EmotionThemeProvider>
  );
}

const testingLibraryWrapper = (ui, options) => render(ui, { wrapper: providers, ...options });

export * from '@testing-library/react'
export { testingLibraryWrapper as render }