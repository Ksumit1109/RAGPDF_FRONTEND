'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { NEXT_PUBLIC_BACKEND_URL } from '@/constants/app.constant'

interface PdfUploadProps {
  onUploadSuccess: () => void
}

export function PdfUpload({ onUploadSuccess }: PdfUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file)
        setUploadComplete(false)
      } else {
        toast.error('Please select a PDF file')
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('pdf', selectedFile)

    try {
      const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/upload/pdf`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setUploadComplete(true)
        onUploadSuccess()
        toast.success('PDF uploaded successfully! You can now start chatting.')
      } else {
        toast.error('Failed to upload PDF')
      }
    } catch (error) {
      toast.error('Error uploading PDF')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
      setUploadComplete(false)
    } else {
      toast.error('Please drop a PDF file')
    }
  }

  return (
    <div className="flex flex-col h-full p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">PDF Chat Assistant</h1>
        <p className="text-slate-600">Upload a PDF document to start asking questions</p>
      </div>

      <Card className="flex-1 border-2 border-dashed border-slate-300 hover:border-slate-400 transition-colors">
        <CardContent className="flex flex-col items-center justify-center h-full p-8">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="w-full h-full flex flex-col items-center justify-center space-y-6"
          >
            {!uploadComplete ? (
              <>
                <div className="rounded-full bg-blue-50 p-6">
                  <Upload className="h-16 w-16 text-blue-600" />
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {selectedFile ? 'File Selected' : 'Upload PDF Document'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {selectedFile
                      ? selectedFile.name
                      : 'Drag and drop your PDF here, or click to browse'}
                  </p>
                </div>

                {selectedFile && (
                  <div className="flex items-center space-x-2 bg-slate-100 px-4 py-3 rounded-lg">
                    <FileText className="h-5 w-5 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">
                      {selectedFile.name}
                    </span>
                  </div>
                )}

                <div className="flex flex-col space-y-3 w-full max-w-xs">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                    disabled={isUploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>

                  {selectedFile && (
                    <Button
                      onClick={handleUpload}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload PDF
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </>
            ) : (
              <>
                <div className="rounded-full bg-green-50 p-6">
                  <CheckCircle2 className="h-16 w-16 text-green-600" />
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-slate-900">Upload Complete!</h3>
                  <p className="text-sm text-slate-500">
                    Your PDF has been processed. Start chatting on the right.
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setSelectedFile(null)
                    setUploadComplete(false)
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Upload Another PDF
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
