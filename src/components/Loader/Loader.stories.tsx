import type { Meta, StoryObj } from '@storybook/react';
import { Loader } from './index';

const meta: Meta<typeof Loader> = {
  title: 'Components/Loader',
  component: Loader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithBackground: Story = {
  render: () => (
    <div style={{ padding: '40px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <Loader />
    </div>
  ),
};

