import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import getDesignTokens from "./MainTheme.js";

const RootComponent = () => {
  const getTheme = React.useCallback(() => {
    return createTheme(getDesignTokens('dark'));
  }, []);


  return (
    <ThemeProvider theme={getTheme()}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);
