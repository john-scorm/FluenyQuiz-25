import React, { useState } from 'react'
import {
  useForgotPasswordMutation,
  useLoginMutation,
  useSignUpMutation
} from 'services/auth'

import { LockClosedIcon } from '@heroicons/react/solid'

import Layout from './Layout'

type AuthTabs = 'login' | 'register' | 'forgot-password'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [tab, setTab] = useState<AuthTabs>('login')
  const isLoginTab = tab === 'login'

  const {
    mutateAsync: login,
    isLoading: isLoginLoading,
    error: loginError
  } = useLoginMutation()
  const {
    mutateAsync: signUp,
    isLoading: isSignUpLoading,
    error: signUpError
  } = useSignUpMutation()
  const {
    mutateAsync: forgotPass,
    isLoading: isForgotPassLoading,
    error: forgotPassError
  } = useForgotPasswordMutation()

  const isLoading = isLoginLoading || isSignUpLoading || isForgotPassLoading
  const error = (loginError || signUpError || forgotPassError) as Error | null

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    switch (tab) {
      case 'login':
        login({ email, password })
        break
      case 'register':
        signUp({ email, password })
        break
      case 'forgot-password':
        forgotPass({ email })
        break
    }
  }

  return (
    <Layout showNavbar={true}>
      <div className="flex-1 min-h-full flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {isLoginTab
                ? 'Sign in to your account'
                : tab === 'register'
                ? 'Create a new account'
                : 'Reset password'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <button
                className="font-medium text-indigo-600 hover:text-indigo-500"
                onClick={() => setTab(isLoginTab ? 'register' : 'login')}
              >
                {isLoginTab
                  ? 'create a new account'
                  : 'sign in to your account'}
              </button>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              {tab !== 'forgot-password' && (
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                  />
                </div>
              )}
            </div>

            {!!error && (
              <p className="text-red-600">
                {error.message || 'An error occurred'}
              </p>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LockClosedIcon
                    className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                    aria-hidden="true"
                  />
                </span>

                {isLoading
                  ? 'Loading...'
                  : tab === 'login'
                  ? 'Sign in'
                  : tab === 'register'
                  ? 'Create account'
                  : 'Reset password'}
              </button>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                  onClick={() => setTab('forgot-password')}
                >
                  Forgot your password?
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default LoginPage
