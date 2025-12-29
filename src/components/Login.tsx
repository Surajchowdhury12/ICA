import React, { useCallback } from 'react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '520657233730-70rkr8giqf5pno0ppcv5gv8mj604u261.apps.googleusercontent.com'

const Login: React.FC = () => {
  const { login } = useAuth()
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleGoogleSuccess = useCallback(async (credentialResponse: any) => {
    setIsLoading(true)
    setError(null)

    try {
      // Send token to backend for verification
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: credentialResponse.credential
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      // Store token and user info
      login(data.token, {
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        picture: data.user.picture
      })
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Failed to login')
    } finally {
      setIsLoading(false)
    }
  }, [login])

  const handleGoogleError = () => {
    setError('Failed to login with Google')
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <section className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-dark-bg dark:to-gray-900 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg mb-4">
              <span className="text-2xl font-bold text-white">IC</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Interview Cracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Master Your Interviews
            </p>
          </div>

          <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
              Sign in with your Google account to get started
            </p>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="signin_with"
                width="300"
              />
            </div>

            {isLoading && (
              <div className="text-center">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Signing you in...</p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-border">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">300+</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Questions</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">AI</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Powered</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">6</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Roles</p>
            </div>
          </div>
        </div>
      </section>
    </GoogleOAuthProvider>
  )
}

export default Login
