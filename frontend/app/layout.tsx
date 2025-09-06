import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { ModalProvider } from "@/components/providers/modal-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "Wordbond",
  description: "Todo app",
  generator: "nextjs",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily}, "ヒラギノ角ゴシック";
  --font-sans: ${GeistSans.style.fontFamily};
  --font-mono: ${GeistMono.style.fontFamily};
}
        `}</style>
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <ModalProvider>
            {children}
            <Toaster />
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
