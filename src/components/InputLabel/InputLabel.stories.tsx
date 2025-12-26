import type { Meta, StoryObj } from '@storybook/react';
import { InputLabel } from './index';

const meta: Meta<typeof InputLabel> = {
  title: 'Components/InputLabel',
  component: InputLabel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    htmlFor: {
      control: 'text',
    },
    children: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Label',
  },
};

export const WithHtmlFor: Story = {
  args: {
    children: 'Email Address',
    htmlFor: 'email-input',
  },
};

export const LongText: Story = {
  args: {
    children: 'This is a label with very long text that should display properly',
  },
};

