import { SessionProvider } from "next-auth/react"
import type { Metadata } from "next"
import './globals.css'

export const metadata: Metadata = {
  title: "HarshAI - Your AI Command Center",
  description: "The all-in-one AI automation platform for creators. Connect 50+ AI tools into automated workflows. No code required.",
  keywords: ["AI automation", "AI workflows", "no code", "AI tools", "productivity"],
  authors: [{ name: "Harshal Lahare" }],
  icons: {
    icon: '/harshai-logo.png',
    apple: '/harshai-logo.png',
  },
  openGraph: {
    title: "HarshAI - Your AI Command Center",
    description: "The all-in-one AI automation platform for creators",
    url: "https://ai-workflow-automator.vercel.app",
    siteName: "HarshAI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://ai-workflow-automator.vercel.app/harshai-logo.png",
        width: 240,
        height: 240,
        alt: "HarshAI Logo",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SessionProvider>
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="format-detection" content="telephone=no" />
        </head>
        <body className="antialiased" style={{ overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
          {children}
        </body>
      </html>
    </SessionProvider>
  )
}
