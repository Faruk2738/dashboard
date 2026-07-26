import './globals.css'
import PwaRegistration from './PwaRegistration'
import PageTransitionBell from './PageTransitionBell'

export const metadata = {
  title: 'AdventureWorks Analytics',
  description: 'Customer & Sales Intelligence Dashboard',
  applicationName: 'AdventureWorks Analytics Hub',
  appleWebApp: { capable: true, title: 'AdventureWorks' },
  icons: { apple: '/icon' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="antialiased bg-white text-slate-800">
        <PwaRegistration />
        <PageTransitionBell />
        {children}
      </body>
    </html>
  )
}
