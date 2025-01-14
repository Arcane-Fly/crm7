'use client'

import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface DocumentPreviewProps {
  file: File | string
  onClose?: () => void
  isOpen: boolean
}

export function DocumentPreview({ file, onClose, isOpen }: DocumentPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [loading, setLoading] = useState(true)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setLoading(false)
  }

  function changePage(offset: number) {
    setPageNumber((prev) => prev + offset)
  }

  function previousPage() {
    changePage(-1)
  }

  function nextPage() {
    changePage(1)
  }

  function zoomIn() {
    setScale((prev) => Math.min(prev + 0.2, 2.0))
  }

  function zoomOut() {
    setScale((prev) => Math.max(prev - 0.2, 0.5))
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose?.()}>
      <DialogContent className='max-w-4xl'>
        <div className='flex h-full w-full flex-col items-center justify-center'>
          {loading && (
            <div className='flex h-full w-full items-center justify-center'>
              <Loader2 className='h-8 w-8 animate-spin' />
            </div>
          )}

          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className='flex h-full w-full items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin' />
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              className='max-w-full'
            />
          </Document>

          {numPages > 0 && (
            <div className='mt-4 flex items-center justify-center gap-4'>
              <Button variant='outline' onClick={previousPage} disabled={pageNumber <= 1}>
                <ChevronLeft className='h-4 w-4' />
              </Button>

              <div>
                Page {pageNumber} of {numPages}
              </div>

              <Button variant='outline' onClick={nextPage} disabled={pageNumber >= numPages}>
                <ChevronRight className='h-4 w-4' />
              </Button>
              <Button variant='outline' onClick={zoomIn}>
                <ZoomIn className='h-4 w-4' />
              </Button>
              <Button variant='outline' onClick={zoomOut}>
                <ZoomOut className='h-4 w-4' />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
