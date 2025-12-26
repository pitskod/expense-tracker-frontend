import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './index';
import type { Icon as IconType } from '../../types';

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: 'select',
      options: [
        'mobile',
        'credit',
        'other_payment',
        'hobby',
        'subscription',
        'transport',
        'restaurant',
        'utility',
        'shopping',
        'debt',
      ] as IconType[],
    },
    size: {
      control: { type: 'number', min: 16, max: 128, step: 4 },
    },
    color: {
      control: 'select',
      options: ['grey', 'white'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: 'credit',
    size: 24,
    color: 'grey',
  },
};

export const White: Story = {
  args: {
    icon: 'credit',
    size: 24,
    color: 'white',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const Large: Story = {
  args: {
    icon: 'credit',
    size: 64,
    color: 'grey',
  },
};

export const Small: Story = {
  args: {
    icon: 'credit',
    size: 16,
    color: 'grey',
  },
};

export const AllIcons: Story = {
  render: () => {
    const icons: IconType[] = [
      'mobile',
      'credit',
      'other_payment',
      'hobby',
      'subscription',
      'transport',
      'restaurant',
      'utility',
      'shopping',
      'debt',
    ];

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', padding: '20px' }}>
        {icons.map((icon) => (
          <div key={icon} style={{ textAlign: 'center' }}>
            <Icon icon={icon} size={32} color="grey" />
            <div style={{ marginTop: '8px', fontSize: '12px' }}>{icon}</div>
          </div>
        ))}
      </div>
    );
  },
};

