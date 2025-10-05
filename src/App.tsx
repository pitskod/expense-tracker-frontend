import { useState } from 'react';
import { Logo } from './components/Logo';
import { Loader } from './components/Loader';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { InputLabel } from './components/InputLabel';
import { Icon } from './components/Icon';
import { DatePicker } from './components/DatePicker';


function App() {
  let loading = false;
  const name = "John Doe";
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  function handleClick() {
    console.log('Button clicked');
  }

  function handleDateChange(value: string) {
    const date = new Date(value);
    console.log('Selected date:', date);
    setSelectedDate(date);
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

        <div style={{ marginTop: '20px' }}>
          <InputLabel>Select Date</InputLabel>
          <DatePicker
            placeholder="Choose a date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={handleDateChange}
          />
        </div>

        <Icon icon="credit" />
        <Icon icon="debt" color="white"/>
        <Icon icon="hobby" color="grey" size={50} />
        <Icon icon="mobile" color="grey"/>
        <Icon icon="restaurant" />
        <Icon icon="shopping" />
        <Icon icon="subscription" />
        <Icon icon="transport" />
        <Icon icon="utility" />
        <Icon icon="other_payment" />



      </div>
    </div>
  )
}

export default App
