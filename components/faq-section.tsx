"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const faqs = [
    {
      question: "What is Bonus Repair Desk?",
      answer:
        "Bonus Repair Desk is a comprehensive repair shop management system that helps you track repair tickets, manage customers, process payments, and analyze your business performance all in one place.",
    },
    {
      question: "How does the free trial work?",
      answer:
        "You get full access to all features for 15 days completely free. After the trial period ends, you can continue with our affordable monthly subscription plan at €25 per month, or choose from our longer-term plans.",
    },
    {
      question: "What features are included?",
      answer:
        "All plans include repair ticket management, customer database, payment processing, analytics and reports, team management, and email support. You get full access to all features regardless of your plan.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. Your access will continue until the end of your current billing period.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use industry-standard security measures to protect your data. All information is encrypted, and we perform regular backups to ensure your data is safe and recoverable.",
    },
  ]

  return (
    <section id="faq" className="relative overflow-hidden pb-12 pt-24">
      {/* Background blur effects */}
      <div className="bg-primary/20 absolute top-1/2 -right-20 z-[-1] h-64 w-64 rounded-full opacity-80 blur-3xl"></div>
      <div className="bg-primary/20 absolute top-1/2 -left-20 z-[-1] h-64 w-64 rounded-full opacity-80 blur-3xl"></div>

      <div className="z-10 container mx-auto px-4">
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-black/50 text-blue-400 inline-flex items-center gap-2 rounded-full border px-3 py-1 uppercase backdrop-blur-sm shadow-lg">
            <span>✶</span>
            <span className="text-sm">Faqs</span>
          </div>
        </motion.div>

        <motion.h2
          className="mx-auto mt-6 max-w-xl text-center text-4xl font-medium md:text-[54px] md:leading-[60px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Questions? We've got{" "}
          <span className="bg-gradient-to-b from-foreground via-blue-300 to-purple-400 bg-clip-text text-transparent">
            answers
          </span>
        </motion.h2>

        <div className="mx-auto mt-12 flex max-w-xl flex-col gap-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/50 via-black/50 to-gray-900/50 p-6 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:border-blue-500/30 cursor-pointer backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleItem(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  toggleItem(index)
                }
              }}
              {...(index === faqs.length - 1 && { "data-faq": faq.question })}
            >
              <div className="flex items-start justify-between">
                <h3 className="m-0 font-medium pr-4">{faq.question}</h3>
                <motion.div
                  animate={{ rotate: openItems.includes(index) ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {openItems.includes(index) ? (
                    <Minus className="relative text-blue-400 flex-shrink-0 transition duration-300" size={24} />
                  ) : (
                    <Plus className="relative text-blue-400 flex-shrink-0 transition duration-300" size={24} />
                  )}
                </motion.div>
              </div>
              <AnimatePresence>
                {openItems.includes(index) && (
                  <motion.div
                    className="mt-4 text-muted-foreground leading-relaxed overflow-hidden"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: "easeInOut",
                      opacity: { duration: 0.2 },
                    }}
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
