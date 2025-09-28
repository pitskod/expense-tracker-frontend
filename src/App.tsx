import { useState } from 'react'
import { Logo } from '@/components/Logo';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <Logo />
    </>
  )
}

export default App
