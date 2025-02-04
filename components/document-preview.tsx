import { useState } from 'react';
import { Document, Page } from 'react-pdf';

interface DocumentPreviewProps {
  url: string;
}

export function DocumentPreview({ url }: DocumentPreviewProps): JSX.Element {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages);
    setLoading(false);
  };

  const changePage = (offset: number): void => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const previousPage = (): void => {
    changePage(-1);
  };

  const nextPage = (): void => {
    changePage(1);
  };

  return (
    <div className="document-preview">
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<div>Loading document...</div>}
      >
        <Page pageNumber={pageNumber} />
      </Document>
      <div className="controls">
        <button
          disabled={pageNumber <= 1}
          onClick={previousPage}
        >
          Previous
        </button>
        <button
          disabled={pageNumber >= numPages}
          onClick={nextPage}
        >
          Next
        </button>
      </div>
      <p>
        Page {pageNumber} of {numPages}
      </p>
    </div>
  );
}
