import { useState } from 'react'
import './App.css'
import ChatBox from './components/ChatBox.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div id='code-container'>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          <ChatBox/>
        </p>
      </div>
      
    </>
  )
}

export default App
