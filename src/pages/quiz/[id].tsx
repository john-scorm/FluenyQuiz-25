import InvisibleInput from 'components/InvisibleInput'
import Layout from 'components/Layout'
import { APP_NAME } from 'config'
import useLocalStorage from 'hooks/useLocalStorage'
import {
  Quiz,
  Submission,
  SubmissionAnswers,
  SubmissionResult
} from 'interfaces'
import { Duration } from 'luxon'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useQuiz, useQuizSubmission } from 'services/quiz'
import { useTimer } from 'use-timer'
import classNames from 'utils/classnames'

import { VolumeUpIcon } from '@heroicons/react/solid'

const randFn = () => 0.5 - Math.random()

const TakeQuiz = () => {
  const router = useRouter()
  const id = typeof router.query.id === 'string' ? router.query.id : 'test'

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const { isLoading, isError } = useQuiz(id, setQuiz)

  const [resourcesLoaded, setResourcesLoaded] = useState(false)
  const [resourcesCache, setResourcesCache] = useState<Record<string, string>>(
    {}
  )

  useEffect(() => {
    if (!quiz) return
    const loadResources = async () => {
      const setResource = (key: string, value: string) => {
        setResourcesCache((val) => ({ ...val, [key]: value }))
      }
      const fetchBlobUrl = async (url?: string) => {
        if (!url) return null
        const blob = await fetch(url).then((res) => res.blob())
        const blobUrl = URL.createObjectURL(blob)
        setResource(url, blobUrl)
        return blobUrl
      }

      await Promise.all(
        quiz.questions.map(async (que) => {
          return {
            audio: await fetchBlobUrl(que.audioUrl),
            answers: await Promise.all(
              que.answers.map(async (ans) => {
                return fetchBlobUrl(ans.imageUrl)
              })
            )
          }
        })
      )

      setResourcesLoaded(true)
    }
    loadResources()
  }, [quiz])

  /**
   * Randomize questions and answers
   */
  const shuffledQuestions = useMemo(() => {
    return quiz?.questions.sort(randFn).map((que) => {
      const answers = que.answers
        .map((ans, idx) => ({ ...ans, idx }))
        .sort(randFn)

      return { ...que, answers }
    })
  }, [quiz])

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [userData, setUserData] = useLocalStorage(`${APP_NAME}-userData`, {
    name: '',
    rollNo: ''
  })
  const [answers, setAnswers] = useLocalStorage<Record<string, number>>(
    `${APP_NAME}-answers-${id}`,
    {}
  )
  const [submissionData, setSubmissionData] = useLocalStorage<{
    submission: SubmissionResult | null
  }>(`${APP_NAME}-submission-${id}`, { submission: null })

  const [quizStarted, setQuizStarted] = useState(false)
  const [questionIdx, setQuestionIdx] = useState(0)

  const [isAudioPlaying, setIsAudioPlaying] = useState(false)

  const { mutateAsync: submitQuiz, data: submissionResult } =
    useQuizSubmission()

  useEffect(() => {
    if (submissionResult && !submissionResult.error) {
      setSubmissionData({ submission: submissionResult.submission })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionResult])

  const timer = useTimer({
    autostart: false,
    initialTime: 0
  })

  const handleSubmit = () => {
    if (!quiz) return

    timer.pause()
    const timeTaken = timer.time

    const finalAnswers: SubmissionAnswers = quiz.questions.map((que) => ({
      queId: que.id,
      selectedIdx: answers[que.id]
    }))

    const data: Submission = {
      id: nanoid(),
      submittedAt: Date.now(),
      quizId: quiz.id,
      answers: finalAnswers,
      timeTaken,
      ...userData
    }

    toast.promise(submitQuiz(data), {
      loading: 'Submitting...',
      success: 'Successfully Submitted',
      error: 'Some error occurred'
    })
  }

  const timeInSec = quiz?.maxTime
    ? quiz.maxTime.seconds + quiz.maxTime.minutes * 60
    : 0
  const isTimeUp = timer.time > timeInSec
  useEffect(() => {
    if (!quiz?.maxTime) return
    handleSubmit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimeUp])

  useEffect(() => {
    if (quiz && questionIdx === quiz.questions.length) {
      handleSubmit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, questionIdx])

  if (isLoading) {
    return (
      <Layout showNavbar={false}>
        <h3 className="m-auto text-center text-xl text-gray-500">
          Loading your quiz...
        </h3>
      </Layout>
    )
  }

  if (isError || !quiz) {
    return (
      <Layout showNavbar={false}>
        <h3 className="m-auto text-center text-xl text-red-600">
          Quiz with id {`"${id}"`} not found
        </h3>
      </Layout>
    )
  }

  if (submissionData.submission && quiz) {
    const { answered, correct, percentage, passed } = submissionData.submission

    return (
      <div className="max-w-7xl w-full min-h-screen mx-auto flex flex-col px-3">
        <div className="w-full bg-blue-700 text-white text-xl py-2 text-center rounded-b">
          Quiz Finished!
        </div>

        <div className="m-auto w-full max-w-2xl rounded-lg shadow-md py-4 px-3 space-y-3 text-center">
          <div
            className={classNames(
              'px-3 py-2 rounded mx-auto text-white',
              passed ? 'bg-green-600' : 'bg-red-500'
            )}
          >
            {passed ? 'You passed!' : 'You failed'}
          </div>

          <p>Total Questions: {quiz.questions.length}</p>
          <p>Questions Answered: {answered}</p>
          <p>Correct Answers: {correct}</p>
          <p>Final Percentage: {percentage}%</p>

          <div className="flex">
            <button
              className="w-full text-center mx-auto mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => {
                setAnswers({})
                setQuizStarted(false)
                setQuestionIdx(0)
                setSubmissionData({ submission: null })
                timer.reset()
              }}
            >
              Retake quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!quizStarted) {
    return (
      <div className="max-w-7xl w-full min-h-screen mx-auto flex flex-col px-3">
        <div className="w-full bg-blue-700 text-white text-xl py-2 text-center rounded-b">
          {quiz.title}
        </div>

        <form
          className="m-auto w-full max-w-2xl rounded-lg shadow-md py-4 px-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!resourcesLoaded) return
            setAnswers({})
            setSubmissionData({ submission: null })
            setQuizStarted(true)
            timer.reset()
            if (quiz.maxTime) timer.start()
          }}
        >
          <InvisibleInput
            value={userData.name}
            onChange={(e) => {
              setUserData((data) => ({ ...data, name: e.target.value }))
            }}
            className="border-gray-300 border-opacity-50"
            labelClassName="w-[30%] text-center"
            label="Name:"
            id="name"
            name="name"
            type="text"
            placeholder="Enter your name"
            required
          />

          <InvisibleInput
            value={userData.rollNo}
            onChange={(e) => {
              setUserData((data) => ({ ...data, rollNo: e.target.value }))
            }}
            className="border-gray-300 border-opacity-50"
            labelClassName="w-[30%] text-center"
            label="RollNo:"
            id="rollNo"
            name="rollNo"
            type="text"
            placeholder="Enter your roll no."
            required
          />

          {!resourcesLoaded && (
            <p className="mt-3 mb-2 text-center">Loading quiz resources...</p>
          )}

          <div className="flex">
            <button
              disabled={!resourcesLoaded}
              className="w-full text-center mx-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Start quiz
            </button>
          </div>
        </form>
      </div>
    )
  }

  const question = shuffledQuestions && shuffledQuestions[questionIdx]

  const onSelectAnswer = (selectedIdx: number, queId: string) => {
    setAnswers((val) => {
      const newAnswers = { ...val }
      newAnswers[queId] = selectedIdx
      return newAnswers
    })
    setQuestionIdx((val) => val + 1)
  }

  const timeLeftInSec = timeInSec - timer.time
  const timeLeftRedable = Duration.fromObject({
    seconds: timeLeftInSec
  }).toFormat('mm:ss')

  return (
    <div
      className="min-h-screen max-h-screen w-full flex flex-col"
      style={{
        backgroundColor: quiz.backgroundColor,
        userSelect: isTimeUp ? 'none' : undefined,
        cursor: isTimeUp ? 'wait' : undefined
      }}
    >
      <div className="flex-1 max-w-7xl w-full max-h-screen mx-auto flex flex-col">
        {quiz.maxTime && (
          <div className="flex items-center space-x-4 mb-6 mt-4">
            <div className="h-px flex-1 bg-gray-300" />
            <div>{timeLeftRedable} minutes left</div>
            <div className="h-px flex-1 bg-gray-300" />
          </div>
        )}

        {question && (
          <>
            <div className="flex items-center py-3 px-4 rounded border-2 border-gray-400 bg-gray-200 my-4">
              <div className="flex-1">{question.title}</div>
              {question.audioUrl && (
                <>
                  <audio
                    ref={audioRef}
                    className="hidden"
                    src={resourcesCache[question.audioUrl]}
                    autoPlay
                    onPlay={() => setIsAudioPlaying(true)}
                    onPause={() => setIsAudioPlaying(false)}
                    onEnded={() => setIsAudioPlaying(false)}
                  />

                  <button
                    className="rounded p-2 hover:bg-gray-300 transition"
                    onClick={() => {
                      if (!audioRef.current) return
                      audioRef.current.currentTime = 0
                      audioRef.current.play()
                    }}
                  >
                    <VolumeUpIcon
                      className={classNames(
                        'h-5 w-5',
                        isAudioPlaying ? 'text-gray-800' : 'text-blue-800'
                      )}
                    />
                  </button>
                </>
              )}
            </div>

            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 py-4 overflow-auto">
              {question.answers.map((answer, idx) => {
                return (
                  <div key={idx} className="group">
                    <div
                      className={classNames(
                        'max-h-full max-w-full min-w-full min-h-full flex-1 cursor-pointer flex relative'
                      )}
                      onClick={() => onSelectAnswer(answer.idx, question.id)}
                    >
                      {answer.imageUrl && (
                        <img
                          src={resourcesCache[answer.imageUrl]}
                          alt={answer.title}
                          className="max-w-full max-h-full mx-auto object-center object-contain rounded"
                        />
                      )}

                      {answer.title && (
                        <div
                          className={classNames(
                            'px-3 py-2 w-full text-center rounded border-2 border-gray-400 group-hover:border-blue-400 transition',
                            answer.imageUrl
                              ? 'absolute top-0 -translate-y-3 rounded bg-white'
                              : 'my-auto'
                          )}
                        >
                          {answer.title}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default TakeQuiz
