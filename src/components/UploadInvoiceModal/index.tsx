import React, { useCallback, useState, memo } from 'react';
import styles from './index.module.css';
import { Loader } from '../Loader';
import { apiClient } from '@/utils/api';
import axios from 'axios';

export interface InvoiceUploadData {
  name: string;
  amount: number;
  currency?: 'USD' | 'EUR' | 'PLN';
  date: string;
}

interface UploadInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (data: InvoiceUploadData) => void;
  onError?: (error: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const validateFile = (fileToValidate: File): string | null => {
  const validTypes = ['image/jpeg', 'image/jpg'];
  if (!validTypes.includes(fileToValidate.type)) {
    return 'Only JPG files are allowed';
  }

  const fileName = fileToValidate.name.toLowerCase();
  if (!fileName.endsWith('.jpg') && !fileName.endsWith('.jpeg')) {
    return 'Only .jpg or .jpeg files are allowed';
  }

  if (fileToValidate.size > MAX_FILE_SIZE) {
    const sizeMB = (fileToValidate.size / (1024 * 1024)).toFixed(2);
    return `File size exceeds 5 MB. Current size: ${sizeMB} MB`;
  }

  return null;
};

export const UploadInvoiceModal = memo<UploadInvoiceModalProps>(({
  isOpen,
  onClose,
  onUploadSuccess,
  onError,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      onError?.(validationError);
      return;
    }

    setError(null);
    setFile(selectedFile);
  }, [onError]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  const handleBrowseClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<InvoiceUploadData>('/api/invoices/analyze', formData);
      
      onUploadSuccess(response.data);
      handleClose();
    } catch (err: unknown) {
      let errorMessage = 'Failed to upload and analyze invoice';
      
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as any;
        if (typeof data?.detail === 'string') {
          errorMessage = data.detail;
        } else if (typeof data?.message === 'string') {
          errorMessage = data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [file, onUploadSuccess, onError]);

  const handleClose = useCallback(() => {
    if (!isUploading) {
      setFile(null);
      setError(null);
      setIsDragging(false);
      onClose();
    }
  }, [isUploading, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={handleClose} />
      <div className={styles.modal} role="dialog" aria-labelledby="upload-modal-title">
        <div className={styles.modalHeader}>
          <h2 id="upload-modal-title" className={styles.modalTitle}>Upload Invoice</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isUploading}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className={styles.modalContent}>
          <div
            className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''} ${file ? styles.dropZoneHasFile : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-input"
              accept=".jpg,.jpeg,image/jpeg"
              onChange={handleFileInputChange}
              className={styles.fileInput}
              disabled={isUploading}
            />
            <label htmlFor="file-input" className={styles.fileInputLabel}>
              {isUploading ? (
                <div className={styles.uploadingContent}>
                  <Loader />
                  <p className={styles.uploadingText}>Analyzing invoice...</p>
                </div>
              ) : file ? (
                <div className={styles.fileSelectedContent}>
                  <svg className={styles.fileIcon} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <p className={styles.fileName}>{file.name}</p>
                  <p className={styles.fileSize}>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  <button
                    type="button"
                    className={styles.changeFileButton}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFile(null);
                      setError(null);
                    }}
                  >
                    Change file
                  </button>
                </div>
              ) : (
                <div className={styles.emptyContent}>
                  <svg className={styles.uploadIcon} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className={styles.dropZoneText}>Drag & drop your invoice image here</p>
                  <p className={styles.dropZoneSubtext}>or</p>
                  <button type="button" className={styles.browseButton} onClick={handleBrowseClick}>
                    Browse Files
                  </button>
                  <p className={styles.dropZoneHint}>JPG files up to 5 MB</p>
                </div>
              )}
            </label>
          </div>

          {error && (
            <div className={styles.errorMessage} role="alert">
              {error}
            </div>
          )}

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.uploadButton}
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              {isUploading ? 'Analyzing...' : 'Upload & Analyze'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

UploadInvoiceModal.displayName = 'UploadInvoiceModal';

