'use client'

import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Send, Loader2, CheckCircle } from 'lucide-react'
import { usePassportStore } from '@/store/passport-store'

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'your_service_id'
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'your_template_id'
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'your_public_key'

export function FeedbackForm() {
  const { ui, setUIState } = usePassportStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    setUIState({ showFeedback: false })
    setTimeout(() => {
      setName('')
      setEmail('')
      setMessage('')
      setIsSuccess(false)
      setError(null)
    }, 300)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (EMAILJS_SERVICE_ID === 'your_service_id') {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsSuccess(true)
        return
      }

      const templateParams = {
        from_name: name || 'Anonymous',
        from_email: email || 'Not provided',
        message: message,
        to_name: 'Passport Photo Pro Team',
      }

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      )

      setIsSuccess(true)
    } catch (err) {
      console.error('EmailJS error:', err)
      setError('Failed to send. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={ui.showFeedback} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md border-slate-200 bg-white rounded-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-medium text-slate-900">Send Feedback</DialogTitle>
          <DialogDescription className="text-slate-500">
            Share your thoughts or report issues
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="font-medium text-slate-900">Thank you!</p>
              <p className="text-sm text-slate-500 mt-1">Your feedback has been submitted</p>
            </div>
            <Button onClick={handleClose} className="mt-4 h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="feedback-name" className="text-xs text-slate-500 uppercase tracking-wide">Name (optional)</Label>
              <Input
                id="feedback-name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-email" className="text-xs text-slate-500 uppercase tracking-wide">Email (optional)</Label>
              <Input
                id="feedback-email"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-message" className="text-xs text-slate-500 uppercase tracking-wide">Message</Label>
              <Textarea
                id="feedback-message"
                placeholder="Your feedback..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                className="bg-slate-50 border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl resize-none"
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={handleClose} className="text-slate-500">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !message.trim()}
                className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
