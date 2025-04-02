import { LoginForm } from '@/components/login-form'
import { Button } from '@/components/ui/button'
import { useAuth0 } from '@auth0/auth0-react'

export default function LoginPage() {
  const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0()

  const handleLogin = () => {
    loginWithRedirect().then((r) => console.log(r))
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl text-center space-y-6">
        <h1 className="text-3xl font-bold">Welcome to Portfolio Manager</h1>
        <p className="text-muted-foreground">
          Track, analyze, and optimize your investment portfolio with ease. Get
          real-time insights, interactive charts, and a seamless experience.
        </p>

        <Button onClick={handleLogin} size="lg" className="w-full">
          Sign in to Your Dashboard
        </Button>

        <p className="text-sm text-muted-foreground">
          Securely powered by Auth0.
        </p>
      </div>
    </div>
  )
}
