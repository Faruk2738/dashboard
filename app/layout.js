import './globals.css'

export const metadata = {
  title: 'AdventureWorks Analytics',
  description: 'Customer & Sales Intelligence Dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-slate-800">
        {children}
      </body>
    </html>
  )
}
