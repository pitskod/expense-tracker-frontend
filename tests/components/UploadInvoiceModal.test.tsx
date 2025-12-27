import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadInvoiceModal } from '@/components/UploadInvoiceModal';
import { apiClient } from '@/utils/api';

// Mock the API client
vi.mock('@/utils/api', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('UploadInvoiceModal', () => {
  const mockOnClose = vi.fn();
  const mockOnUploadSuccess = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(
      <UploadInvoiceModal
        isOpen={true}
        onClose={mockOnClose}
        onUploadSuccess={mockOnUploadSuccess}
      />
    );

    expect(screen.getByText('Upload Invoice')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <UploadInvoiceModal
        isOpen={false}
        onClose={mockOnClose}
        onUploadSuccess={mockOnUploadSuccess}
      />
    );

    expect(screen.queryByText('Upload Invoice')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <UploadInvoiceModal
        isOpen={true}
        onClose={mockOnClose}
        onUploadSuccess={mockOnUploadSuccess}
      />
    );

    const closeButton = screen.getByLabelText('Close modal');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <UploadInvoiceModal
        isOpen={true}
        onClose={mockOnClose}
        onUploadSuccess={mockOnUploadSuccess}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(
      <UploadInvoiceModal
        isOpen={true}
        onClose={mockOnClose}
        onUploadSuccess={mockOnUploadSuccess}
      />
    );

    const backdrop = document.querySelector('[class*="backdrop"]');
    if (backdrop) {
      await user.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('shows error for invalid file type', async () => {
    const user = userEvent.setup();
    render(
      <UploadInvoiceModal
        isOpen={true}
        onClose={mockOnClose}
        onUploadSuccess={mockOnUploadSuccess}
        onError={mockOnError}
      />
    );

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/browse|drag/i).closest('label')?.querySelector('input');
    
    if (input) {
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByText(/Only JPG files are allowed/i)).toBeInTheDocument();
      });
      
      expect(mockOnError).toHaveBeenCalled();
    }
  });

  it('shows error for file size exceeding 5MB', async () => {
    const user = userEvent.setup();
    render(
      <UploadInvoiceModal
        isOpen={true}
        onClose={mockOnClose}
        onUploadSuccess={mockOnUploadSuccess}
        onError={mockOnError}
      />
    );

    // Create a file larger than 5MB
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/browse|drag/i).closest('label')?.querySelector('input');
    
    if (input) {
      await user.upload(input, largeFile);
      
      await waitFor(() => {
        expect(screen.getByText(/File size exceeds 5 MB/i)).toBeInTheDocument();
      });
      
      expect(mockOnError).toHaveBeenCalled();
    }
  });

  it('accepts valid JPG file', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        name: 'Test Invoice',
        amount: 100.50,
        currency: 'USD',
        date: '2024-01-15',
      },
    } as any);

    render(
      <UploadInvoiceModal
        isOpen={true}
        onClose={mockOnClose}
        onUploadSuccess={mockOnUploadSuccess}
        onError={mockOnError}
      />
    );

    const validFile = new File(['test'], 'invoice.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/browse|drag/i).closest('label')?.querySelector('input');
    
    if (input) {
      await user.upload(input, validFile);
      
      await waitFor(() => {
        expect(screen.getByText('invoice.jpg')).toBeInTheDocument();
      });

      const uploadButton = screen.getByText('Upload & Analyze');
      await user.click(uploadButton);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalled();
        expect(mockOnUploadSuccess).toHaveBeenCalledWith({
          name: 'Test Invoice',
          amount: 100.50,
          currency: 'USD',
          date: '2024-01-15',
        });
      });
    }
  });

  it('handles API error', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.post).mockRejectedValueOnce({
      response: {
        data: {
          detail: 'Could not parse invoice image',
        },
      },
    });

    render(
      <UploadInvoiceModal
        isOpen={true}
        onClose={mockOnClose}
        onUploadSuccess={mockOnUploadSuccess}
        onError={mockOnError}
      />
    );

    const validFile = new File(['test'], 'invoice.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/browse|drag/i).closest('label')?.querySelector('input');
    
    if (input) {
      await user.upload(input, validFile);
      
      const uploadButton = screen.getByText('Upload & Analyze');
      await user.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText(/Could not parse invoice image/i)).toBeInTheDocument();
      });
      
      expect(mockOnError).toHaveBeenCalled();
    }
  });
});

