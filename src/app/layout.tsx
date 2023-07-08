import './globals.css'

export const metadata = {
  title: 'Card Game Studio',
  description: 'Simple and fun card games',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className='font-vt323'>{children}</body>
    </html>
  )
}
