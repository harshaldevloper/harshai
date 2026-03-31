import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "HarshAI - Your AI Command Center",
  description: "The all-in-one AI automation platform for creators. Connect 50+ AI tools into automated workflows. No code required.",
  keywords: ["AI automation", "AI workflows", "no code", "AI tools", "productivity"],
  authors: [{ name: "Harshal Lahare" }],
  openGraph: {
    title: "HarshAI - Your AI Command Center",
    description: "The all-in-one AI automation platform for creators",
    url: "https://getharshai.vercel.app",
    siteName: "HarshAI",
    locale: "en_US",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
