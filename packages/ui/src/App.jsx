import { Box } from '@mui/material';
import './App.css';
import ChatBox from './components/ChatBox/ChatBox.jsx';
import { DataProvider } from './context/DataContext';
import { SocketProvider } from './context/SocketProvider';


function App() {

  return (
    <DataProvider>
      <SocketProvider>
        <Box width='100vw' height='100vh' display='flex' flexDirection='column' justifyContent='flex-end'>
          <ChatBox />
        </Box>
      </SocketProvider>
    </DataProvider>

  )
}

export default App
