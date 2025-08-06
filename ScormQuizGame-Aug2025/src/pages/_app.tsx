import { APP_NAME } from 'config'
import { AuthProvider } from 'contexts/AuthContext'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import React from 'react'
import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from 'react-query'

import withTwindApp from '@twind/next/shim/app'
import queryClient from 'config/react-query'
import twindConfig from 'config/twind.config'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>{APP_NAME}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Component {...pageProps} />

          <Toaster position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </>
  )
}

export default withTwindApp(twindConfig, MyApp)
