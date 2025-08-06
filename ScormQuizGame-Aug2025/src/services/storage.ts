import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { useMutation } from 'react-query'

import { storage } from 'config/firebase'

type ProgressCallback = (_progress: number) => void

const getFileRef = (filePath: string) => {
  return ref(storage, `quizzes/${filePath}`)
}

export const useUploadMutation = () => {
  return useMutation(
    async ({
      filePath,
      file,
      onProgress
    }: {
      filePath: string
      file: File
      onProgress: ProgressCallback
    }) => {
      const fileRef = getFileRef(filePath)
      const uploadTask = uploadBytesResumable(fileRef, file)

      return new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = snapshot.bytesTransferred / snapshot.totalBytes
            onProgress(progress)
          },
          (err) => reject(err),
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(url)
          }
        )
      })
    }
  )
}
