import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Input } from './index';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'date'],
    },
    error: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
    value: {
      control: 'text',
    },
    defaultValue: {
      control: 'text',
    },
    helperText: {
      control: 'text',
    },
  },
  args: {
    onChange: fn(),
    onBlur: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    type: 'text',
    error: false,
    disabled: false,
  },
};

export const WithValue: Story = {
  args: {
    value: 'Pre-filled value',
    type: 'text',
    error: false,
    disabled: false,
  },
};

export const WithDefaultValue: Story = {
  args: {
    defaultValue: 'Default value',
    type: 'text',
    error: false,
    disabled: false,
  },
};

export const WithHelperText: Story = {
  args: {
    placeholder: 'Enter your email',
    helperText: 'We will never share your email',
    type: 'email',
    error: false,
    disabled: false,
  },
};

export const WithError: Story = {
  args: {
    placeholder: 'Enter your email',
    helperText: 'Please enter a valid email address',
    type: 'email',
    error: true,
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    value: 'Cannot edit this',
    type: 'text',
    error: false,
    disabled: true,
  },
};

export const Email: Story = {
  args: {
    placeholder: 'Email address',
    type: 'email',
    error: false,
    disabled: false,
  },
};

export const Number: Story = {
  args: {
    placeholder: 'Enter a number',
    type: 'number',
    error: false,
    disabled: false,
  },
};

export const Date: Story = {
  args: {
    type: 'date',
    error: false,
    disabled: false,
  },
};

