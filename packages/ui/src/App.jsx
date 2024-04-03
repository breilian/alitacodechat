import { Box } from '@mui/material'
import './App.css'
import ChatBox from './components/ChatBox/ChatBox.jsx'

function App() {
  return (
      <Box width='100vw' height='100vh' display='flex' flexDirection='column' justifyContent='flex-end'>
          <ChatBox 
          />
      </Box>
      
  )
}

export default App
