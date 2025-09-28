import { useState } from 'react'
import { Logo } from './components/Logo';
import { Loader } from './components/Loader';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { InputLabel } from './components/InputLabel';

function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  let loading = false;

  function handleClick() {
    console.log('Button clicked');
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <Logo />
      {loading ? <Loader /> : <p>Данные загружены!</p>}

      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <InputLabel>Label</InputLabel>
        <InputLabel htmlFor="name1">Name</InputLabel>
        <Input />
        <Input helperText="Error message" />
        <Input
          type="text"
          placeholder="Enter name"
          defaultValue={name}
          error
          helperText="Error message"
          onChange={handleClick} />

        <Button onClick={handleClick}>Submit</Button>
      </div>
    </div>
  )
}

export default App
