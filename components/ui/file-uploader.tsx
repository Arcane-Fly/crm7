import { ChangeEvent, FC } from 'react'
import { Button } from './button'

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  accept?: string
  multiple?: boolean
}

export const FileUploader: FC<FileUploaderProps> = ({
  onFileSelect,
  accept = '*',
  multiple = false,
}) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      if (multiple) {
        Array.from(files).forEach(file => onFileSelect(file))
      } else {
        onFileSelect(files[0])
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
