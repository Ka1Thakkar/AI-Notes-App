"use client";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Feather, XLogo, InstagramLogo, LinkedinLogo, FilePdf, GithubLogo } from "@phosphor-icons/react"

export function Footer() {
  return (
    <footer className="border-t bg-background w-full flex items-center justify-center">
      <div className="container px-4 py-12 md:px-6 md:py-16 lg:py-20">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative p-1 overflow-hidden rounded-full bg-primary">
                <Feather size={24} weight="duotone" className="text-black" />
              </div>
              <span className="text-xl font-bold">SageQuill</span>
            </div>
            <p className="text-sm text-secondary">
              Capture ideas and organize your thoughts with the power of AI.
            </p>
            <div className="flex space-x-4">
              {/* <Link href="#" className="text-muted-foreground hover:text-foreground">
                <XLogo weight="duotone" size={20} />
                <span className="sr-only">Twitter</span>
              </Link> */}
              <Link href="https://www.linkedin.com/in/kavan-thakkar/" 
              target="_blank"
              className="text-muted-foreground hover:text-foreground">
                <LinkedinLogo weight="duotone" size={20} />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="https://github.com/Ka1Thakkar" 
              target="_blank"
              className="text-muted-foreground hover:text-foreground">
                <GithubLogo weight="duotone" size={20} />
                <span className="sr-only">Gtihub</span>
              </Link>
              <Link href="https://drive.google.com/file/d/1Q8flKhFNCFTnSwIDljE_ehYqTnovX2uf/view?usp=sharing"
              target="_blank"
              className="text-muted-foreground hover:text-foreground">
                <FilePdf weight="duotone" size={20} />
                <span className="sr-only">PDF</span>
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Changelog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} AI Notes. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <button >
                <Link href="#">Privacy</Link>
              </button>
              <button >
                <Link href="#">Terms</Link>
              </button>
              <button >
                <Link href="#">Contact</Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}