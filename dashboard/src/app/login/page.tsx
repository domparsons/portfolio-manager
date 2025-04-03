import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeProvider } from '@/components/theme-provider'
import { Analytics } from '@vercel/analytics/react'
import { useAuth0 } from '@auth0/auth0-react'

export default function LandingPage() {
  const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0()

  const handleLogin = () => {
    loginWithRedirect().then((r) => console.log(r))
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl"
        >
          <h1 className="text-5xl font-extrabold text-white">Porta</h1>
          <p className="mt-2 text-xl text-gray-300">
            Smarter Portfolio Analytics.
          </p>

          <Card className="mt-6 p-6 bg-gray-700/80 shadow-2xl border border-gray-600">
            <CardContent className="space-y-4 pb-0">
              <h2 className="text-xl font-semibold text-white">
                Track, analyze, and optimize your investments with ease.
              </h2>
              {/*<Button onClick={handleLogin}>Explore Porta</Button>*/}
              <Button>Coming soon</Button>
            </CardContent>
          </Card>

          <p className="mt-4 text-sm text-gray-400">
            Securely powered by Auth0 & hosted on Vercel.
          </p>

          <a
            className="mt-4 text-sm text-gray-400 underline"
            href={'https://www.domparsons.com'}
          >
            ← Back to www.domparsons.com
          </a>
        </motion.div>
      </div>
      <Analytics />
    </ThemeProvider>
  )
}
