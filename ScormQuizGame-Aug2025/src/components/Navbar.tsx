import { APP_NAME } from 'config'
import { useAuth } from 'contexts/AuthContext'
import { signOut } from 'firebase/auth'
import Link from 'next/link'
import React from 'react'

import { Disclosure } from '@headlessui/react'
import { MenuIcon, XIcon } from '@heroicons/react/outline'
import { auth } from 'config/firebase'

const Navbar = () => {
  const { user } = useAuth()

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="relative flex justify-between h-16">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>

              <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex-shrink-0 flex items-center">
                  <div className="text-xl">{APP_NAME}</div>
                </div>

                {user && (
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link href="/">
                      <a
                        href="/"
                        className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 text-sm font-medium">
                        My quizzes
                      </a>
                    </Link>
                  </div>
                )}
              </div>

              <div className="items-center hidden sm:flex">
                {user ? (
                  <button
                    className="ml-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => signOut(auth)}>
                    Logout
                  </button>
                ) : (
                  <Link href="/">
                    <a
                      href="/"
                      className="ml-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      Login
                    </a>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="pt-2 pb-4 space-y-1">
              {user ? (
                <Disclosure.Button
                  as="button"
                  className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                  onClick={() => signOut(auth)}>
                  Logout
                </Disclosure.Button>
              ) : (
                <Disclosure.Button as={Link} href="/">
                  <a
                    href="/"
                    className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                    Login
                  </a>
                </Disclosure.Button>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

export default Navbar
