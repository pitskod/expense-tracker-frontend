# Test Fixtures Directory

This directory contains image files used for invoice analysis tests.

## Required Files

- `receipt.jpeg` - Stradivarius receipt image for Polish invoice format testing

## Usage

Place the actual invoice image files in this directory. The tests will load these images and use real OCR (pytesseract) to extract text from them.

## Note

If the image files are not present, the corresponding tests will be skipped automatically.

