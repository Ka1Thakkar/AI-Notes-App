// app/layout.tsx
import LenisProvider from "@/components/LenisProvider"
import "../globals.css"
import {Providers} from "./providers"
import AppLayout from "@/components/AppLayout"
import {Lexend} from "next/font/google"

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "200", "300", "100", "800", "900"],
})

export const metadata = {
  title: "SageQuill",
  description: "AI-Powered Note Taking App",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <section className={`${lexend.className} bg-primary/20 text-foreground antialiased`}>
        <Providers>
          <AppLayout>
            {/* <LenisProvider /> */}
            {children}
          </AppLayout>
        </Providers>
      </section>
  )
}