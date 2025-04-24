import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Features } from "@/components/features";
import { About } from "@/components/about";
import { Testimonials } from "@/components/testimonials";
import { Footer } from "@/components/footer";

export default function LandingPage() {
  return (
    <div className="flex lg:min-h-screen flex-col items-center justify-center bg-background scroll-smooth">
      <Navbar />
      {/* Hero Section */}
      <section className="relative overflow-hidden lg:min-h-screen bg-linear-to-b from-primary/0 to-primary/75 via-primary/75 w-full">
        <div className="container relative z-10 mx-auto px-4 py-12 sm:px-6 lg:items-center flex flex-col items-center justify-center lg:gap-x-16 lg:px-8 w-full">
          <div className="mx-auto w-full lg:mx-0 lg:flex lg:flex-col items-center justify-center lg:pt-10">
            <h1 className="text-4xl lg:max-w-4xl text-center font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Capture ideas and organize your thoughts with SageQuill
            </h1>
            <p className="mt-6 lg:text-lg leading-8 text-neutral-800 font-light dark:text-gray-300 max-w-2xl text-center">
              SageQuill helps you create, organize, and summarize your notes
              with the power of artificial intelligence.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" className="rounded-full px-8">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button
                variant="default"
                size="lg"
                className="rounded-full px-8 bg-secondary/50 hover:bg-secondary/75"
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
          <div className="pt-16 pb-12 sm:pt-24 lg:pt-20 lg:flex lg:flex-col items-center justify-center lg:aspect-auto">
            <div className="relative">
              <Image
                src="/product.png"
                alt="AI Notes App Dashboard"
                width={1200}
                height={1200}
                className="rounded-lg  aspect-9/10 w-full lg:w-full lg:aspect-video object-cover object-top-left"
                priority
                quality={100}
              />
              {/* <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-blue-600 blur-3xl opacity-30 dark:opacity-20"></div>
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-purple-600 blur-3xl opacity-30 dark:opacity-20"></div> */}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <About />

      {/* Features Section */}
      <Features />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Footer */}
      <Footer />
    </div>
  );
}

