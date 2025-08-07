import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword
} from 'firebase/auth'
import { LoginParams } from 'interfaces'
import toast from 'react-hot-toast'
import { useMutation } from 'react-query'

import { auth } from 'config/firebase'

export const useSignUpMutation = () => {
  return useMutation(
    async ({ email, password }: LoginParams) => {
      return await createUserWithEmailAndPassword(auth, email, password)
    },
    {
      onSuccess: () => {
        toast.success('Account Created')
      }
    }
  )
}

export const useLoginMutation = () => {
  return useMutation(
    async ({ email, password }: LoginParams) => {
      return await signInWithEmailAndPassword(auth, email, password)
    },
    {
      onSuccess: () => {
        toast.success('Logged In')
      }
    }
  )
}

export const useForgotPasswordMutation = () => {
  return useMutation(
    async ({ email }: Pick<LoginParams, 'email'>) => {
      return await sendPasswordResetEmail(auth, email)
    },
    {
      onSuccess: () => {
        toast.success(
          'Password reset email sent.\nCheck your inbox or spam folder'
        )
      }
    }
  )
}
