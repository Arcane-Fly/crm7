import { ChangeEvent, FC } from 'react'
import { Button } from './button'

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  accept?: string
  multiple?: boolean
  maxSize?: number
}

export const FileUploader: FC<FileUploaderProps> = ({
  onFileSelect,
  accept = '*',
  multiple = false,
  maxSize,
}) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const validFiles = Array.from(files).filter(file => {
        if (maxSize && file.size > maxSize) {
          console.warn(`File ${file.name} exceeds maximum size of ${maxSize} bytes`)
          return false
        }
        return true
      })

      if (multiple) {
        validFiles.forEach(file => onFileSelect(file))
      } else if (validFiles.length > 0) {
        onFileSelect(validFiles[0])
      }
    }
  }

  return (
    <Button
      variant="outline"
      onClick={() => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = accept
        input.multiple = multiple
        input.onchange = (e) => handleFileChange(e as ChangeEvent<HTMLInputElement>)
        input.click()
      }}
    >
      Upload File
    </Button>
  )
}
