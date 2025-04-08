import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

export const useAuthInit = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()

  useEffect(() => {
    const initUser = async () => {
      const token = await getAccessTokenSilently({
        audience: 'https://dev-aej4rxcs3274i7ss.us.auth0.com/api/v2/',
        scope: 'read:users',
      })
      const decoded = jwtDecode(token)
      const auth0UserId = decoded.sub

      await fetch(`http://localhost:8000/user/create_or_get/${auth0UserId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    }

    if (isAuthenticated) {
      initUser()
    }
  }, [isAuthenticated])
}
