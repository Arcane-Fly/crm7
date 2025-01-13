'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { OnDocumentLoadSuccess } from 'react-pdf'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import styles from './document-preview.module.css'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

interface DocumentPreviewProps {
  fileUrl: string
  fileType: string
  isOpen: boolean
  onClose: () => void
}

export function DocumentPreview({
  fileUrl,
  fileType,
  isOpen,
  onClose,
}: DocumentPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)

  const isPdf = fileType === 'application/pdf'
  const isImage = fileType.startsWith('image/')

  const nextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages))
  }

  const previousPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1))
  }

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.0))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5))
  }

  const onDocumentLoadSuccess: OnDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            {isPdf && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={previousPage}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span>
                  Page {pageNumber} of {numPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextPage}
                  disabled={pageNumber >= numPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="outline" size="icon" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>

          <div className="overflow-auto max-h-[80vh]">
            {isPdf ? (
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            ) : isImage ? (
              <Image
                src={fileUrl}
                alt="Document preview"
                className={`${styles.previewImage}`}
                width={800}
                height={600}
                style={{ '--scale': scale } as React.CSSProperties}
              />
            ) : (
              <div className="p-4 text-center">
                Preview not available for this file type
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
