'use client'

import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { X, Loader2 } from 'lucide-react'
import { usePassportStore } from '@/store/passport-store'

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_aoewzsq'
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_hbw13lt'
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'XJqjmVHK4ISEX0Zam'

export function FeedbackForm() {
  const { ui, setUIState } = usePassportStore()
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleClose = () => {
    setUIState({ showFeedback: false })
    setTimeout(() => {
      setContact('')
      setMessage('')
      setIsSuccess(false)
    }, 300)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contact.trim() || !message.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (EMAILJS_SERVICE_ID === 'your_service_id') {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsSuccess(true)
        return
      }

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          contact: contact,
          message: message,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
          time: new Date().toLocaleString()
        },
        EMAILJS_PUBLIC_KEY
      )

      setIsSuccess(true)
    } catch (err) {
      console.error('EmailJS error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={ui.showFeedback} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-white border border-[#d6cfc2] rounded-[14px] p-7 max-w-[440px] shadow-[0_12px_48px_rgba(28,26,23,0.12)]">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 bg-[#f0ebe1] rounded-full flex items-center justify-center text-[#4a4540] hover:bg-[#e8e2d6] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <DialogHeader className="pb-2">
          <DialogTitle className="font-playfair text-xl font-bold text-[#1c1a17]">
            Feedback / Bug Report
          </DialogTitle>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-[#e8f5ee] rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-[#3a8c5c] text-xl">✓</span>
            </div>
            <p className="text-[#4a4540]">Feedback submitted. Thank you!</p>
            <Button 
              onClick={handleClose} 
              className="mt-4 h-11 px-6 bg-[#c8773a] hover:bg-[#b36832] text-white font-semibold rounded-lg"
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="pt-2">
            <Input
              placeholder="Your email or phone number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              className="w-full h-11 py-3 px-3.5 border-2 border-[#d6cfc2] rounded-lg bg-[#faf7f2] text-sm text-[#1c1a17] placeholder:text-[#8a8178] focus:border-[#c8773a] focus:ring-2 focus:ring-[rgba(200,119,58,0.1)] mb-3"
            />
            <Textarea
              placeholder="Describe your issue or suggestion…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="w-full py-3 px-3.5 border-2 border-[#d6cfc2] rounded-lg bg-[#faf7f2] text-sm text-[#1c1a17] placeholder:text-[#8a8178] focus:border-[#c8773a] focus:ring-2 focus:ring-[rgba(200,119,58,0.1)] resize-none mb-3"
            />
            <Button
              type="submit"
              disabled={isSubmitting || !contact.trim() || !message.trim()}
              className="w-full h-11 bg-[#c8773a] hover:bg-[#b36832] text-white font-semibold rounded-lg shadow-[0_4px_14px_rgba(200,119,58,0.3)] hover:shadow-[0_6px_20px_rgba(200,119,58,0.4)] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
