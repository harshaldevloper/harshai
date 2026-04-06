'use client'

import { useState } from 'react'

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [type, setType] = useState<'bug' | 'feature' | 'other'>('feature')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, feedback, url: window.location.href }),
    })
    setSubmitted(true)
    setTimeout(() => { setIsOpen(false); setSubmitted(false); setFeedback('') }, 3000)
  }

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 z-50">
        {isOpen ? '✕' : '💬 Feedback'}
      </button>
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white rounded-lg shadow-xl p-6 z-50 border border-gray-200">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-green-600 font-medium">Thanks for your feedback!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 className="text-lg font-semibold mb-4">Help us improve HarshAI</h3>
              <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4">
                <option value="feature">Feature Request</option>
                <option value="bug">Bug Report</option>
                <option value="other">Other</option>
              </select>
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="I wish HarshAI could..." rows={4} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4" required />
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700">Submit</button>
              <p className="text-xs text-gray-500 mt-3 text-center">Or create a <a href="https://github.com/harshaldevloper/harshai/issues" target="_blank" className="text-blue-600 hover:underline">GitHub issue</a></p>
            </form>
          )}
        </div>
      )}
    </>
  )
}
