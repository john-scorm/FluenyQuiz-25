import AuthChecker from 'components/AuthChecker'
import Layout from 'components/Layout'
import { Quiz, SubmissionResult } from 'interfaces'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useMemo, useState } from 'react'
import { useQuiz, useSubmissionsList } from 'services/quiz'

const QuizSubmissions = () => {
  const router = useRouter()
  const id = typeof router.query.id === 'string' ? router.query.id : ''

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const { isLoading: isQuizLoading, isError: isQuizError } = useQuiz(
    id,
    setQuiz
  )
  const { isLoading, isError, data } = useSubmissionsList(id)

  const [csvLoading, setCsvLoading] = useState(false)

  const submissions: SubmissionResult[] = useMemo(() => {
    if (!data) return []
    return Object.values(data)
  }, [data])

  const downloadCsv = () => {
    setCsvLoading(true)

    let csvContent = 'data:text/csv;charset=utf-8,'

    const headers = [
      'Timestamp',
      'Name',
      'Roll No',
      'Sample Rate',
      'Answered',
      'Correct',
      'Percentage'
    ]

    csvContent += `"${headers.join('","')}"\r\n`

    submissions.forEach((submission) => {
      const {
        submittedAt,
        name,
        rollNo,
        sampleRate,
        answered,
        correct,
        percentage
      } = submission
      const timeStamp = DateTime.fromMillis(submittedAt as number)
        .toFormat('f')
        .replace(',', '')
      const row: string[] = [
        timeStamp,
        name,
        rollNo,
        sampleRate.toString(),
        answered.toString(),
        correct.toString(),
        percentage.toString()
      ]
      csvContent += `"${row.join('","')}"\r\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${quiz?.title}_result.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setCsvLoading(false)
  }

  if (isError || isQuizError) {
    return (
      <Layout showNavbar={true}>
        <h3 className="my-4 text-center text-xl text-xl text-red-600">
          Quiz not found
        </h3>
      </Layout>
    )
  }

  if (isLoading || isQuizLoading || !quiz) {
    return (
      <Layout showNavbar={true}>
        <h3 className="my-4 text-center text-xl text-xl text-gray-500">
          Loading...
        </h3>
      </Layout>
    )
  }

  return (
    <Layout showNavbar={true}>
      <div className="my-4">
        <div className="flex items-center my-4">
          <div className="flex-1">
            <Link href="/">
              <a
                href="/"
                className="hover:underline text-blue-500 hover:text-blue-600"
              >
                &larr; Back to all quizzes
              </a>
            </Link>
          </div>

          <div className="mx-auto text-center">{quiz.title}</div>

          <div className="flex-1 flex">
            <button
              className="rounded px-3 py-2 ml-auto bg-indigo-500 text-white not-disabled:hover:bg-indigo-600 disabled:opacity-75 transition"
              disabled={csvLoading}
              onClick={downloadCsv}
            >
              Download as CSV
            </button>
          </div>
        </div>

        <table className="w-full border text-center">
          <thead>
            <tr>
              <th className="border p-2 text-gray-700 font-medium">
                Timestamp
              </th>
              <th className="border p-2 text-gray-700 font-medium">Name</th>
              <th className="border p-2 text-gray-700 font-medium">Roll No</th>
              <th className="border p-2 text-gray-700 font-medium">
                Sample Rate
              </th>
              <th className="border p-2 text-gray-700 font-medium">Answered</th>
              <th className="border p-2 text-gray-700 font-medium">Correct</th>
              <th className="border p-2 text-gray-700 font-medium">
                Percentage
              </th>
              <th className="border p-2 text-gray-700 font-medium">Passed</th>
            </tr>
          </thead>

          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td className="border p-2">
                  {DateTime.fromMillis(
                    submission.submittedAt as number
                  ).toFormat('f')}
                </td>
                <td className="border p-2">{submission.name}</td>
                <td className="border p-2">{submission.rollNo}</td>
                <td className="border p-2">{submission.sampleRate}</td>
                <td className="border p-2">{submission.answered}</td>
                <td className="border p-2">{submission.correct}</td>
                <td className="border p-2">{submission.percentage}</td>
                <td className="border p-2">
                  {submission.passed ? 'Passed' : 'Failed'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}

const Wrapper = () => <AuthChecker LoggedInPage={QuizSubmissions} />

export default Wrapper
