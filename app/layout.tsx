import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Azure Speech - Speech Translation | Live Interpreter prototype",
  description: "UX concept prototype of the Live Interpreter experience in the Azure Speech Translation Playground.",
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
