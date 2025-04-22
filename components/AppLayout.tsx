// components/AppLayout.tsx
"use client"

import { ReactNode, useState } from "react"
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet"
import {SidebarSimple} from "@phosphor-icons/react"
import Sidebar from "./Sidebar"
import useIsMobile from "@/hooks/useIsMobile"
import { cn } from "@/lib/utils"

export default function AppLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

  return (
    <div className={cn("h-screen overflow-hidden", isMobile ? "flex-col" : "flex")}>
      {/* Desktop: always show sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile: sheet toggled by burger icon */}
      {isMobile && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="m-2 p-2 rounded hover:bg-gray-100">
              <SidebarSimple size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full">
            <SheetTitle className="hidden" />
            <Sidebar />
          </SheetContent>
        </Sheet>
      )}

      {/* Main content: fills remaining space and scrolls */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}