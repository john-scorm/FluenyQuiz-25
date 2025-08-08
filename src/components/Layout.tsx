import React from 'react'
import classNames from 'utils/classnames'

import Navbar from './Navbar'

const Layout = ({
  className = '',
  showNavbar = false,
  fullWidth = false,
  children
}: {
  className?: string
  showNavbar?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <Navbar />}

      <div
        className={classNames(
          'flex-1 flex flex-col w-full mx-auto px-2 sm:px-6 lg:px-8',
          !fullWidth && 'max-w-7xl',
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export default Layout
