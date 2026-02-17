import type { Metadata } from 'next'
import { Oswald, Barlow } from 'next/font/google'
import './globals.css'

const oswald = Oswald({ 
  subsets: ['latin'],
  variable: '--font-oswald',
  weight: ['400', '500', '600', '700'],
})

const barlow = Barlow({
  subsets: ['latin'],
  variable: '--font-barlow',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Beanbags Book',
  description: 'The Official Sportsbook of the 2030 Dynasty',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${oswald.variable} ${barlow.variable} font-body bg-bg-primary text-text-primary min-h-screen`}>
        <div className="relative min-h-screen">
          {/* Noise overlay */}
          <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('/noise.svg')] z-50" />
          {children}
        </div>
      </body>
    </html>
  )
}
