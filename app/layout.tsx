// app/layout.tsx
import "./globals.css"
import Navbar from "@/components/Navbar"
import {Providers} from "./providers"
import AppLayout from "@/components/AppLayout"
import {Lexend} from "next/font/google"

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "200", "300", "100", "800", "900"],
})

export const metadata = {
  title: "Notes App",
  description: "AI-powered notes",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${lexend.className} bg-background text-foreground antialiased`}>
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  )
}