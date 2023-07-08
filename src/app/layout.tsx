import '@/app/globals.css'

export const metadata = {
  title: 'Card Game Hub',
  description: 'Simple and fun card games',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className='font-vt323'>{children}</body>
    </html>
  )
}
