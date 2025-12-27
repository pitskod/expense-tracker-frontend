import type { Meta, StoryObj } from '@storybook/react';
import { UploadInvoiceModal } from './index';
import { useState } from 'react';

const meta = {
  title: 'Components/UploadInvoiceModal',
  component: UploadInvoiceModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UploadInvoiceModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component to handle modal state
const ModalWrapper = (args: any) => {
  const [isOpen, setIsOpen] = useState(args.isOpen || false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} style={{ padding: '10px 20px' }}>
        Open Upload Modal
      </button>
      <UploadInvoiceModal
        {...args}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onUploadSuccess={(data) => {
          console.log('Upload success:', data);
          setIsOpen(false);
        }}
        onError={(error) => {
          console.error('Upload error:', error);
        }}
      />
    </>
  );
};

export const Default: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    isOpen: false,
    onClose: () => {},
    onUploadSuccess: () => {},
  },
};

export const Open: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    isOpen: true,
    onClose: () => {},
    onUploadSuccess: () => {},
  },
};

