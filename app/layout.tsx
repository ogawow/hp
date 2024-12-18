import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'LIFE合同会社 - コーポレートサイト',
  description: 'LIFE合同会社のコーポレートサイトです。チャット形式で会社情報やお問い合わせにお答えします。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link
          rel="icon"
          href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/favicon.ico`}
          sizes="any"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

