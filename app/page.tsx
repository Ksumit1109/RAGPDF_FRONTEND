'use client'

import { useState } from 'react'
import { PdfUpload } from '@/components/pdf-upload'
import { ChatInterface } from '@/components/chat-interface'

export default function Home() {
  const [isPdfUploaded, setIsPdfUploaded] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-1/2 h-full border-r border-slate-200 bg-white">
        <PdfUpload onUploadSuccess={() => setIsPdfUploaded(true)} />
      </div>

      <div className="w-1/2 h-full bg-white">
        <ChatInterface isPdfUploaded={isPdfUploaded} />
      </div>
    </div>
  )
}
