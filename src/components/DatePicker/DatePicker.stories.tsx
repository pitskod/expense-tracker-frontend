import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { DatePicker } from './index';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
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
    placeholder: 'Choose a date',
    error: false,
    disabled: false,
  },
};

export const WithValue: Story = {
  args: {
    value: '2024-12-26',
    error: false,
    disabled: false,
  },
};

export const WithError: Story = {
  args: {
    placeholder: 'Choose a date',
    helperText: 'Please select a valid date',
    error: true,
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    value: '2024-12-26',
    error: false,
    disabled: true,
  },
};

