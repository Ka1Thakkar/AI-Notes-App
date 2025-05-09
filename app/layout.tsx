// app/layout.tsx
import LenisProvider from "@/components/LenisProvider";
import "./globals.css";
import {Lexend} from 'next/font/google';
import { cn } from "@/lib/utils";

const lexend = Lexend({
  weight: ['400', '500', '600', '700', '100', '200', '300', '800', '900'],
  subsets: ['latin'],
})

export const metadata = {
  title: "SageQuill",
  description: "AI-powered Note Taking App"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={lexend.className}>
        {/* <LenisProvider /> */}
        {/* No AppLayout here—public pages render full width */}
        {children}
      </body>
    </html>
  );
}