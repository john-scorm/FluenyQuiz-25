import React, { Fragment, useState } from 'react'
import toast from 'react-hot-toast'
import { useUploadMutation } from 'services/storage'

import { Dialog, Transition } from '@headlessui/react'
import { UploadIcon, XIcon } from '@heroicons/react/outline'

type UploadModalProps = {
  type: string
  selectedFile?: string
  onUpload: (_url: string) => void
  onRemove: () => void
  setOpen: (_open: boolean) => void
}

const UploadModal = ({
  setOpen,
  type,
  selectedFile,
  onRemove,
  onUpload
}: UploadModalProps) => {
  const [file, setFile] = useState<File | null>(null)
  const { mutateAsync: uploadFile, isLoading, error } = useUploadMutation()
  const [progress, setProgress] = useState(0)

  const errorMsg = error ? (error as Error).message : ''

  const handleUpload = () => {
    if (!file) return
    // file.name = file.name.split(' ').join('')

    toast.promise(
      uploadFile({
        file,
        filePath: file.name.split(' ').join(''),
        onProgress: setProgress
      }).then(onUpload),
      {
        loading: 'Uploading file',
        success: 'File Uploaded',
        error: 'An error occurred uploading the file'
      }
    )
  }

  return (
    <>
      <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
        <button
          type="button"
          className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => setOpen(false)}>
          <span className="sr-only">Close</span>
          <XIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
          <UploadIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
        </div>

        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <Dialog.Title
            as="h3"
            className="text-lg leading-6 font-medium text-gray-900">
            Upload {type}
          </Dialog.Title>

          <div className="mt-2">
            <p>Uploaded:</p>

            {selectedFile ? (
              <div className="mb-4">
                {type === 'image' ? (
                  <img
                    src={selectedFile}
                    alt="uploaded file"
                    className="w-full h-72 object-center object-contain mb-4"
                  />
                ) : type === 'audio' ? (
                  <audio src={selectedFile} />
                ) : (
                  selectedFile
                )}
              </div>
            ) : (
              <p className="mb-2">No file uploaded yet</p>
            )}

            <input
              type="file"
              accept={`${type}/*`}
              onChange={(e) => setFile(e.target?.files?.[0] || null)}
            />

            {isLoading && (
              <p>Uploading: {`${progress * 100}`.split('.')[0]} %</p>
            )}

            {errorMsg && (
              <p className="text-sm text-red-600 mt-2">{errorMsg}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 sm:mt-4 sm:flex sm:justify-between ml-12">
        <div className="space-x-3 flex items-center">
          <button
            onClick={handleUpload}
            disabled={isLoading || !file}
            type="button"
            className="disabled:opacity-75 disabled:cursor-not-allowed w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white not-disabled:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm">
            Upload File
          </button>

          <button
            disabled={!selectedFile || isLoading}
            type="button"
            className="disabled:opacity-75 disabled:cursor-not-allowed w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white not-disabled:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm"
            onClick={() => onRemove()}>
            Remove File
          </button>
        </div>

        <button
          type="button"
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          onClick={() => setOpen(false)}>
          Done
        </button>
      </div>
    </>
  )
}

const UploadModalWrapper = ({
  open,
  setOpen,
  ...props
}: {
  open: boolean
} & UploadModalProps) => {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={() => {}}>
        <div className="relative flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0">
            <Dialog.Overlay className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 sm:scale-95"
            enterTo="opacity-100 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 sm:scale-100"
            leaveTo="opacity-0 sm:scale-95">
            <div className="absolute top-1/2 left-1/2 -translate-1/2 inline-block bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <UploadModal setOpen={setOpen} {...props} />
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default UploadModalWrapper
