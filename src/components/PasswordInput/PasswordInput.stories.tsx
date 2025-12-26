import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { PasswordInput } from './index';

const meta: Meta<typeof PasswordInput> = {
  title: 'Components/PasswordInput',
  component: PasswordInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
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
    placeholder: 'Enter password',
    error: false,
    disabled: false,
  },
};

export const WithValue: Story = {
  args: {
    value: 'password123',
    error: false,
    disabled: false,
  },
};

export const WithHelperText: Story = {
  args: {
    placeholder: 'Enter password',
    helperText: 'Must be at least 8 characters',
    error: false,
    disabled: false,
  },
};

export const WithError: Story = {
  args: {
    placeholder: 'Enter password',
    helperText: 'Password is too short',
    error: true,
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Enter password',
    value: 'password123',
    error: false,
    disabled: true,
  },
};

