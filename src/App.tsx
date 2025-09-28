import { useState } from 'react'
import { Logo } from './components/Logo';
import { Loader } from './components/Loader';
import { Button } from './components/Button';

function App() {
  const [count, setCount] = useState(0)
  let loading = true;

  function handleClick() {
    console.log('Button clicked');
  }
  return (
    <>
      <Logo />
      {loading ? <Loader /> : <p>Данные загружены!</p>}
      <Button disabled onClick={handleClick}>Click me</Button>
      <Button onClick={handleClick}>Click me</Button>

    </>
  )
}

export default App
