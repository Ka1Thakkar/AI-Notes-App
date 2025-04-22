import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export function Testimonials() {
  const testimonials = [
    {
      quote:
        "SageQuill, has completely transformed how I organize my thoughts. The AI summarization feature saves me hours of review time.",
      author: "Vishwam Bagrodia",
      role: "Friend, Undergraduate Student",
      avatar: "/vishwam.png",
    },
    {
      quote:
        "As a student, I need to take a lot of notes. This app helps me focus on learning instead of worrying about organizing everything.",
      author: "Kavan Thakkar",
      role: "Me, Undergraduate Student",
      avatar: "/kavan.png",
    },
    {
      quote:
        "The clean interface and powerful features make this my go-to app for all my note-taking needs. The AI summaries are surprisingly accurate!",
      author: "Akshay Malu",
      role: "Friend, Undergraduate Student",
      avatar: "/akshay.png",
    },
  ]

  return (
    <section id="testimonials" className="py-24 bg-gradient-to-b from-primary/50 to-primary/0 via-primary/25 min-h-screen w-full flex items-center justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-accent/50 px-3 py-1 text-sm text-black font-medium">Testimonials</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Loved by note-takers everywhere
            </h2>
            <p className="text-lg text-center text-neutral-800 font-light md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Don't just take our word for it. Here's what our users have to say about SageQuill.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 bg-background shadow-md h-full">
              <CardContent className="p-6 h-full">
                <div className="flex flex-col justify-between h-full gap-4">
                  <div className="relative">
                    <svg
                      className="absolute -left-3 -top-3 h-8 w-8 text-primary/20"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"></path>
                    </svg>
                    <p className="relative text-lg italic text-neutral-800 font-light">"{testimonial.quote}"</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.author}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}