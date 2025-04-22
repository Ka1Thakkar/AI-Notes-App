"use client";
import { Sparkle, MagnifyingGlass, Moon, DeviceMobileCamera, Shield,} from "@phosphor-icons/react"

export function Features() {
  const features = [
    {
      icon: <Sparkle weight="duotone" className="h-10 w-10 text-yellow-500" />,
      title: "AI Summarization",
      description: "Generate concise summaries of your notes with a single click using advanced AI technology.",
    },
    {
      icon: <MagnifyingGlass weight="duotone" className="h-10 w-10 text-yellow-500" />,
      title: "Powerful Search",
      description:
        "Find any note instantly with our powerful search functionality that looks through titles and content.",
    },
    // {
    //   icon: <Moon className="h-10 w-10 text-primary" />,
    //   title: "Dark Mode",
    //   description:
    //     "Easy on the eyes with automatic dark mode that adjusts to your system preferences or manual control.",
    // },
    {
      icon: <DeviceMobileCamera weight="duotone" className="h-10 w-10 text-yellow-500" />,
      title: "Responsive Design",
      description:
        "Access your notes from any device with our fully responsive design that works on desktop, tablet, and mobile.",
    },
    {
      icon: <Shield weight="duotone" className="h-10 w-10 text-yellow-500" />,
      title: "Secure Authentication",
      description:
        "Your notes are protected with secure authentication options including Google and email/password login.",
    },
    // {
    //   icon: <Share2 className="h-10 w-10 text-primary" />,
    //   title: "Easy Sharing",
    //   description: "Share your notes with colleagues or friends with customizable permission settings.",
    // },
  ]

  return (
    <section id="features" className="py-24 w-full flex items-center justify-center bg-linear-to-b from-primary/75 to-primary/50 via-primary/75 min-h-screen">
      <div className="container px-4 md:px-6 w-full">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2 flex flex-col items-center justify-center">
            <div className="inline-block rounded-lg bg-accent/50 px-3 py-1 text-sm text-black font-medium">Features</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Everything you need to manage your notes
            </h2>
            <p className="max-w-[700px] text-lg text-neutral-800 font-light md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              AI Notes combines powerful features with simplicity to provide the best note-taking experience.
            </p>
          </div>
        </div>
        <div className="mx-auto grid grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div key={index} className="relative overflow-hidden rounded-lg bg-secondary/25 p-2">
              <div className="flex h-full flex-col justify-between rounded-md p-6">
                <div className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-neutral-800 font-light">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}