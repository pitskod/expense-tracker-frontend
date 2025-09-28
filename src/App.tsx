import { useState } from 'react'
import { Logo } from './components/Logo';
import { Loader } from './components/Loader';

function App() {
  const [count, setCount] = useState(0)
  let loading = true;

  return (
    <>
      <Logo />
      {loading ? <Loader /> : <p>Данные загружены!</p>}
    </>
  )
}

export default App
