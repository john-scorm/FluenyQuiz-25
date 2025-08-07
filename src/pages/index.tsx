/*
import AuthChecker from 'components/AuthChecker'
import Layout from 'components/Layout'
import LoginPage from 'components/LoginPage'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import toast from 'react-hot-toast'
import {
  useDeleteQuiz,
  useDuplicateQuiz,
  useQuizDownload,
  useQuizzesList
} from 'services/quiz'

// import { useCopyToClipboard } from 'usehooks-ts'
import {
  ClipboardCopyIcon,
  // ClipboardIcon,
  IdentificationIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/outline'
import { DownloadIcon } from '@heroicons/react/solid'

const HomePage = () => {
  const router = useRouter()
  // const [, copyToClipboard] = useCopyToClipboard()
  const { data: quizzes, isLoading } = useQuizzesList()
  const { mutateAsync: deleteQuiz } = useDeleteQuiz()
  const { mutateAsync: duplicateQuiz } = useDuplicateQuiz()
  const { mutateAsync: downloadQuiz } = useQuizDownload()

  const quizzesList = useMemo(() => {
    const list = Object.values(quizzes || {})
    list.sort((a, b) => b.updatedAt - a.updatedAt)
    return list.map((quiz) => {
      return {
        ...quiz,
        createdAt: DateTime.fromMillis(quiz.createdAt).toRelative(),
        updatedAt: DateTime.fromMillis(quiz.updatedAt).toRelative(),
        orig: quiz
      }
    })
  }, [quizzes])

  return (
    <Layout showNavbar={true}>
      <div className="flex items-center justify-between my-4">
        <h2 className="text-xl">My Quizzes</h2>

        <Link href="/edit-quiz">
          <a
            href="edit-quiz"
            className="text-sm text-white rounded shadow bg-indigo-500 px-2 py-1.5 flex items-center">
            <span className="mr-2">
              <PlusIcon className="h-4 w-4" />
            </span>
            Create new
          </a>
        </Link>
      </div>

      {isLoading ? (
        <h3 className="text-center text-gray-400 py-2">Loading...</h3>
      ) : quizzesList.length > 0 ? (
        <div className="space-y-2">
          {quizzesList.map((quiz) => {
            return (
              <div
                key={quiz.id}
                className="rounded border border-gray-200 px-3 py-2">
                <div className="flex flex-col md:flex-row items-center mb-1">
                  <h3 className="flex-1 truncate mb-1 md:mb-0">{quiz.title}</h3>

                  <div className="flex flex-wrap items-center justify-center space-x-2">
                    <button
                      className="flex items-center rounded text-white bg-teal-600 hover:bg-teal-700 shadow px-2 py-1"
                      onClick={() => {
                        router.push(`/result/${quiz.id}`)
                      }}>
                      <IdentificationIcon className="w-4 h-4" />
                      <span className="ml-1">Result</span>
                    </button>
                    {/* <button
                      className="flex items-center rounded text-white bg-green-600 hover:bg-green-700 shadow px-2 py-1"
                      onClick={() => {
                        const url = `${window.location.origin}/quiz/${quiz.id}`
                        toast.promise(copyToClipboard(url), {
                          loading: 'Copying...',
                          success: 'Link copied, paste anywhere',
                          error: 'An error occurred'
                        })
                      }}>
                      <ClipboardIcon className="w-4 h-4" />
                      <span className="ml-1">Share</span>
                    </button> }
                    <button
                      className="flex items-center rounded text-white bg-indigo-600 hover:bg-indigo-700 shadow px-2 py-1"
                      onClick={() => router.push(`edit-quiz/${quiz.id}`)}>
                      <PencilIcon className="w-4 h-4" />
                      <span className="ml-1">Edit</span>
                    </button>
                    <button
                      className="flex items-center rounded text-white bg-gray-600 hover:bg-gray-700 shadow px-2 py-1"
                      onClick={() => {
                        toast.promise(downloadQuiz(quiz.orig), {
                          loading: 'Downloading quiz...',
                          success: 'Downloaded quiz',
                          error: 'An error occurred'
                        })
                      }}>
                      <DownloadIcon className="w-4 h-4" />
                      <span className="ml-1">Download</span>
                    </button>
                    <button
                      className="flex items-center rounded text-white bg-gray-600 hover:bg-gray-700 shadow px-2 py-1"
                      onClick={() => {
                        toast.promise(duplicateQuiz(quiz.orig), {
                          loading: 'Duplicating quiz...',
                          success: 'Duplicated quiz',
                          error: 'An error occurred'
                        })
                      }}>
                      <ClipboardCopyIcon className="w-4 h-4" />
                      <span className="ml-1">Duplicate</span>
                    </button>
                    <button
                      className="flex items-center rounded text-white bg-red-600 hover:bg-red-700 shadow px-2 py-1"
                      onClick={() => {
                        toast.promise(deleteQuiz(quiz.id), {
                          loading: 'Deleting quiz...',
                          success: () => {
                            return 'Deleted quiz'
                          },
                          error: 'An error occurred'
                        })
                      }}>
                      <TrashIcon className="w-4 h-4" />
                      <span className="ml-1">Delete</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between text-gray-600">
                  <div>{quiz.questions.length} Question(s)</div>
                  <div>Last updated {quiz.updatedAt}</div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <h3 className="my-5 text-gray-500 text-center text-xl">
          No quizzes, click create new to get started
        </h3>
      )}
    </Layout>
  )
}

const Wrapper = () => (
  <AuthChecker LoggedInPage={HomePage} LoggedOutPage={LoginPage} />
)

export default Wrapper
*/

const HomePage = () => {
  return (
    <main>
      <h1>SCORM App Deployed ✅</h1>
      <p>If you’re seeing this, routing and Firebase setup are good.</p>
    </main>
  );
};

export default HomePage;
