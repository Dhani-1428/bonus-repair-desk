"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

export function StickyFooter() {
  const [isAtBottom, setIsAtBottom] = useState(false)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY
          const windowHeight = window.innerHeight
          const documentHeight = document.documentElement.scrollHeight
          const isNearBottom = scrollTop + windowHeight >= documentHeight - 100

          setIsAtBottom(isNearBottom)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Check initial state
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {isAtBottom && (
        <motion.div
          className="fixed z-[10000] bottom-0 left-0 w-full h-80 flex justify-center items-center bg-black"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div
            className="relative overflow-hidden w-full h-full flex flex-col justify-between items-center px-8 sm:px-12 md:px-16 py-8"
          >
            <div className="w-full flex justify-between items-start">
              <motion.h2
                className="text-[60px] sm:text-[100px] md:text-[140px] lg:text-[180px] font-bold select-none leading-none z-10 text-white"
                style={{ opacity: 0.1 }}
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 0.1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Bonus Repair Desk
              </motion.h2>
              <motion.div
                className="flex flex-col items-end space-y-2 text-sm sm:text-base md:text-lg relative z-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h3 className="text-white font-bold text-xl sm:text-2xl mb-1">Bonus Repair Desk</h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-2">Professional Repair Shop Management</p>
                <p className="text-xs sm:text-sm text-gray-500">
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
                <div className="flex flex-row space-x-6 sm:space-x-8 mt-4">
                  <ul className="space-y-2 text-white">
                    <li className="hover:text-blue-300 cursor-pointer transition-colors font-medium">
                      <a
                        href="#features"
                        onClick={(e) => {
                          e.preventDefault()
                          const element = document.getElementById("features")
                          if (element) {
                            const headerOffset = 120
                            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
                            const offsetPosition = elementPosition - headerOffset
                            window.scrollTo({ top: offsetPosition, behavior: "smooth" })
                          }
                        }}
                      >
                        Features
                      </a>
                    </li>
                    <li className="hover:text-blue-300 cursor-pointer transition-colors font-medium">
                      <a
                        href="#pricing"
                        onClick={(e) => {
                          e.preventDefault()
                          const element = document.getElementById("pricing")
                          if (element) {
                            const headerOffset = 120
                            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
                            const offsetPosition = elementPosition - headerOffset
                            window.scrollTo({ top: offsetPosition, behavior: "smooth" })
                          }
                        }}
                      >
                        Pricing
                      </a>
                    </li>
                    <li className="hover:text-blue-300 cursor-pointer transition-colors font-medium">
                      <a
                        href="#contact"
                        onClick={(e) => {
                          e.preventDefault()
                          const element = document.getElementById("contact")
                          if (element) {
                            const headerOffset = 120
                            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
                            const offsetPosition = elementPosition - headerOffset
                            window.scrollTo({ top: offsetPosition, behavior: "smooth" })
                          }
                        }}
                      >
                        Contact
                      </a>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-white">
                    <li className="hover:text-blue-300 cursor-pointer transition-colors font-medium">
                      <a href="/login">Login</a>
                    </li>
                    <li>
                      <a
                        href="https://wa.me/351920306889"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-green-400 transition-colors font-medium"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        WhatsApp
                      </a>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
            <div className="w-full pt-4 border-t border-gray-800 text-center">
              <p className="text-xs sm:text-sm text-gray-400">
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}
