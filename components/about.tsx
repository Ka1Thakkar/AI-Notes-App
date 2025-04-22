"use client"
import Image from "next/image"
import {Check, CheckCircle} from '@phosphor-icons/react'

export function About() {
  return (
    <section id="about" className="py-24 bg-primary/75 dark:bg-gray-900 w-full flex items-center justify-center min-h-screen">
      <div className="container px-4 md:px-6 w-full">
        <div className="flex flex-col justify-center lg:flex-row gap-10  lg:gap-16 items-center">
          <div className="max-w-5xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Simplify your note-taking with AI assistance
            </h2>
            <p className="mt-4 sm:text-lg text-neutral-800 font-light">
              AI Notes is designed to help you capture ideas, organize information, and retrieve knowledge effortlessly.
              Our AI-powered platform transforms the way you take and manage notes.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex gap-3">
                <CheckCircle size={24} weight="bold" className="text-accent/50" />
                <div>
                  <h3 className="font-semibold">Intelligent Summarization</h3>
                  <p className="text-neutral-800 font-light">
                    Our AI automatically generates concise summaries of your notes, helping you grasp key points
                    quickly.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle size={24} weight="bold" className="text-accent/50" />
                <div>
                  <h3 className="font-semibold">Secure Cloud Storage</h3>
                  <p className="text-neutral-800 font-light">
                    Your notes are securely stored in the cloud, accessible from any device, anytime.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle size={24} weight="bold" className="text-accent/50" />
                <div>
                  <h3 className="font-semibold">Intuitive Interface</h3>
                  <p className="text-neutral-800 font-light">
                    Our clean, user-friendly interface makes note-taking a pleasure rather than a chore.
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="relative mx-auto aspect-video rounded-xl shadow-xl lg:ml-auto w-full">
            <Image
              src="/ai-notes.png"
              alt="AI Notes App Interface"
              width={1200}
              height={400}
              quality={100}
              className="rounded-lg object-cover lg:min-w-max object-top-left aspect-9/10 w-full lg:aspect-video"
            />
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10 dark:ring-white/10"></div>
          </div> */}
        </div>
      </div>
    </section>
  )
}