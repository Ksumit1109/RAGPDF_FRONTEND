'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { toast } from 'sonner'
import { NEXT_PUBLIC_BACKEND_URL } from '@/constants/app.constant'

interface Message {
  role: 'user' | 'assistant'
  content: string
  docs?: any[]
}

interface ChatInterfaceProps {
  isPdfUploaded: boolean
}

export function ChatInterface({ isPdfUploaded }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    // if (!isPdfUploaded) {
    //   toast.error('Please upload a PDF first')
    //   return
    // }

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch(
        `${NEXT_PUBLIC_BACKEND_URL}/chat?message=${encodeURIComponent(inputValue)}`
      )

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.resultData.message.kwargs.content,
          docs: data.resultData.docs,
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        toast.error('Failed to get response')
      }
    } catch (error) {
      toast.error('Error sending message')
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center">
          <Bot className="mr-2 h-6 w-6 text-blue-600" />
          Chat with your PDF
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {isPdfUploaded
            ? 'Ask questions about your document'
            : 'Upload a PDF to start chatting'}
        </p>
      </div>

      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="rounded-full bg-slate-100 p-6">
              <Bot className="h-12 w-12 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-700">No messages yet</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                {isPdfUploaded
                  ? 'Start a conversation by typing a question below'
                  : 'Upload a PDF document to begin chatting'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <Card
                  className={`max-w-[80%] p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`rounded-full p-2 ${
                        message.role === 'user' ? 'bg-blue-700' : 'bg-slate-200'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-sm font-medium">
                        {message.role === 'user' ? 'You' : 'AI Assistant'}
                      </div>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </div>
                      {message.docs && message.docs.length > 0 && (
                        <div className="mt-3">
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="sources" className="border-none">
                              <AccordionTrigger className="text-xs font-semibold text-slate-600 hover:no-underline py-2">
                                <div className="flex items-center gap-2">
                                  <span>Source References ({message.docs.length})</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2 pt-2">
                                  {message.docs.map((doc, docIndex) => (
                                    <div
                                      key={docIndex}
                                      className="text-xs bg-white p-3 rounded border border-slate-200"
                                    >
                                      <div className="font-medium text-slate-700 mb-1">
                                        Reference {docIndex + 1}
                                        {doc.metadata?.loc?.pageNumber && (
                                          <span className="text-slate-500 font-normal">
                                            {' '}
                                            (Page {doc.metadata.loc.pageNumber})
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-slate-600 leading-relaxed">
                                        {doc.pageContent}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <Card className="bg-slate-100 p-4">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full p-2 bg-slate-200">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                      <span className="text-sm text-slate-600">AI is thinking...</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-slate-200 p-6">
        <div className="flex space-x-3">
          <Input
            placeholder={
              isPdfUploaded
                ? 'Ask a question about your PDF...'
                : 'Upload a PDF to start chatting'
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            // disabled={!isPdfUploaded || isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            // disabled={!isPdfUploaded || isLoading || !inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}