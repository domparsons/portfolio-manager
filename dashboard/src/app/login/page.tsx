import { LoginForm } from '@/components/login-form'
import { Button } from '@/components/ui/button'
import { useAuth0 } from '@auth0/auth0-react'

export default function LoginPage() {
  const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0()

  const handleLogin = () => {
    loginWithRedirect().then((r) => console.log(r))
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        {/*<LoginForm />*/}
        <Button onClick={handleLogin}>Login</Button>
      </div>
    </div>
  )
}
