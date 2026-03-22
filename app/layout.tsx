import type { Metadata } from 'next'
import { Noto_Sans_Thai } from 'next/font/google'
import './globals.css'
import Header from './components/Header'
import TermsModal from './components/TermsModal'


const thaiFont = Noto_Sans_Thai({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['thai', 'latin'],
  variable: '--font-thai',
  display: 'optional',
})

export const metadata: Metadata = {
  title: 'C-Advisor - ผู้ช่วยภาษีอัจฉริยะ',
  description: 'คำนวณภาษีง่าย รวดเร็ว และไม่ซับซ้อน ด้วย AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className={thaiFont.variable} data-scroll-behavior="smooth">
      <body className={`${thaiFont.className} antialiased`}>
        <TermsModal />
        <Header />
        <main className="page-enter">
          {children}
        </main>
      </body>
    </html>
  )
}