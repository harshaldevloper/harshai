import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { type, feedback, url, email } = await request.json()
    if (!feedback || feedback.trim().length < 10) {
      return NextResponse.json({ error: 'Feedback must be at least 10 characters' }, { status: 400 })
    }
    console.log('[FEEDBACK]', { type, feedback, url, email, timestamp: new Date().toISOString() })
    // Optional: Send to Discord webhook
    if (process.env.DISCORD_FEEDBACK_WEBHOOK) {
      await fetch(process.env.DISCORD_FEEDBACK_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [{ title: `New ${type} report`, description: feedback, color: type === 'bug' ? 0xFF0000 : 0x00FF00 }] }),
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}
