import { useAuth } from 'contexts/AuthContext'
import Link from 'next/link'
import React from 'react'

import Navbar from './Navbar'

const AuthChecker = ({
  LoggedInPage,
  LoggedOutPage
}: {
  LoggedInPage: () => React.ReactElement
  LoggedOutPage?: () => React.ReactElement
}) => {
  const { isLoading, user } = useAuth()

  if (isLoading) {
    return null
  } else if (user) {
    return <LoggedInPage />
  }

  if (LoggedOutPage) {
    return <LoggedOutPage />
  } else {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <div className="flex-1 m-auto">
          <h2 className="text-xl mb-2">{"You're"} not logged in</h2>

          <Link href="/">
            <a href="/" className="text-blue-400 hover:text-blue-500">
              Login or register here
            </a>
          </Link>
        </div>
      </div>
    )
  }
}

export default AuthChecker
