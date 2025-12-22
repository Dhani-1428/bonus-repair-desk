"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Navbar } from "@/components/navbar"
import { Mail, MessageSquare, Send } from "lucide-react"

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Send email to bonusrepairdesk@gmail.com (admin notification)
      // Use user's email as the sender so it appears to come from them
      const adminResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "bonusrepairdesk@gmail.com",
          from: formState.email, // User's email as sender
          senderName: formState.name, // User's name for the from field
          replyTo: formState.email, // Reply-to also set to user's email
          subject: `Contact Form: ${formState.subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${formState.name}</p>
            <p><strong>Email:</strong> ${formState.email}</p>
            <p><strong>Subject:</strong> ${formState.subject}</p>
            <p><strong>Message:</strong></p>
            <p>${formState.message.replace(/\n/g, "<br>")}</p>
          `,
          text: `
New Contact Form Submission

Name: ${formState.name}
Email: ${formState.email}
Subject: ${formState.subject}

Message:
${formState.message}
          `,
        }),
      })

      // Send confirmation email to the user
      const userResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: formState.email,
          from: "bonusrepairdesk@gmail.com",
          subject: "Thank You for Contacting Bonus Repair Desk",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                  .info-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>✅ Message Received!</h1>
                  </div>
                  <div class="content">
                    <p>Dear ${formState.name},</p>
                    
                    <p>Thank you for contacting Bonus Repair Desk!</p>
                    
                    <div class="info-box">
                      <p><strong>We have received your message regarding:</strong> ${formState.subject}</p>
                      <p>Our team will review your inquiry and get back to you as soon as possible, typically within 24 hours.</p>
                    </div>
                    
                    <p>If you have any urgent questions, please feel free to contact us directly:</p>
                    <ul>
                      <li>Email: <a href="mailto:bonusrepairdesk@gmail.com">bonusrepairdesk@gmail.com</a></li>
                      <li>WhatsApp: <a href="https://wa.me/351920306889">+351 920 306 889</a></li>
                    </ul>
                    
                    <p>We appreciate your interest in Bonus Repair Desk and look forward to assisting you!</p>
                    
                    <p>Best regards,<br><strong>Bonus Repair Desk Team</strong><br>bonusrepairdesk@gmail.com</p>
                  </div>
                </div>
              </body>
            </html>
          `,
          text: `
Message Received!

Dear ${formState.name},

Thank you for contacting Bonus Repair Desk!

We have received your message regarding: ${formState.subject}

Our team will review your inquiry and get back to you as soon as possible, typically within 24 hours.

If you have any urgent questions, please feel free to contact us directly:
- Email: bonusrepairdesk@gmail.com
- WhatsApp: +351 920 306 889

We appreciate your interest in Bonus Repair Desk and look forward to assisting you!

Best regards,
Bonus Repair Desk Team
bonusrepairdesk@gmail.com
          `,
        }),
      })

      if (adminResponse.ok && userResponse.ok) {
    setSubmitted(true)
    setFormState({ name: "", email: "", subject: "", message: "" })
    setTimeout(() => setSubmitted(false), 5000)
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending contact form:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-24 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-20 space-y-6 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance">Get in touch</h1>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
              Have questions? We're here to help. Send us a message and we'll respond within 24 hours.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">Send a message</CardTitle>
                  <CardDescription className="text-base">
                    Fill out the form and we'll get back to you soon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formState.name}
                          onChange={handleChange}
                          placeholder="Your name"
                          className="h-11"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formState.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className="h-11"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium">
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formState.subject}
                        onChange={handleChange}
                        placeholder="What is this regarding?"
                        className="h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-medium">
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formState.message}
                        onChange={handleChange}
                        placeholder="Tell us more..."
                        rows={6}
                        required
                      />
                    </div>

                    {submitted && (
                      <div className="p-4 rounded-xl bg-foreground/5 border border-foreground/10 text-sm">
                        ✓ Message sent! We'll get back to you soon.
                      </div>
                    )}

                    <Button type="submit" className="w-full h-11 rounded-full" disabled={loading}>
                      <Send className="h-4 w-4 mr-2" />
                      {loading ? "Sending..." : "Send message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-background mb-3">
                    <Mail className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">Email us</CardTitle>
                  <CardDescription>Response within 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="mailto:bonusrepairdesk@gmail.com" className="text-foreground hover:underline font-medium">
                    bonusrepairdesk@gmail.com
                  </a>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 text-white mb-3">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl">WhatsApp</CardTitle>
                  <CardDescription>Chat with us instantly</CardDescription>
                </CardHeader>
                <CardContent>
                  <a
                    href="https://wa.me/351920306889"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-foreground hover:underline font-medium group"
                  >
                    <span>+351 920 306 889</span>
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl">Common questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">How fast is setup?</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Instant! Your panel is ready immediately after registration.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Is data secure?</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Yes. Encrypted, backed up, and safe even after subscription expires.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Developer Credit */}
      <div className="py-8 border-t border-gray-800/50 bg-black/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <p className="text-center text-sm text-gray-400">
            Developed by{" "}
            <a
              href="https://bonusitsolutions.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors duration-300 font-medium hover:underline"
            >
              Bonus IT Solutions
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
