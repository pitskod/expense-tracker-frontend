import { useState } from 'react'
import { Logo } from './components/Logo';
import { Loader } from './components/Loader';
import { Button } from './components/Button';
import { Input } from './components/Input';

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
      
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input 
          label="Name" 
          placeholder="Enter your name" 
          value={name}
          onChange={setName}
        />
        
        <Input 
          label="Email" 
          type="email"
          placeholder="Enter your email" 
          value={email}
          onChange={setEmail}
        />
        
        <Input 
          label="Disabled Input" 
          placeholder="This is disabled" 
          disabled
        />
        
        <Button onClick={handleClick}>Submit</Button>
      </div>
    </div>
  )
}

export default App
