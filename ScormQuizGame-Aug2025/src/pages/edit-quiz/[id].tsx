import AuthChecker from 'components/AuthChecker'
import InvisibleInput from 'components/InvisibleInput'
import Layout from 'components/Layout'
import UploadModalWrapper from 'components/UploadModal'
import { Answer, Question, Quiz } from 'interfaces'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import { BlockPicker } from 'react-color'
import toast from 'react-hot-toast'
import { getDefaultQuestion, useQuiz, useSaveQuiz } from 'services/quiz'
import classNames from 'utils/classnames'

import { DuplicateIcon, PlusIcon, XIcon } from '@heroicons/react/outline'

const parseUploadTo = (uploadTo: string) => {
  const [type, ansOrQue, quesIdxStr, ansIdxStr] = uploadTo.split('-')
  const quesIdx = parseInt(quesIdxStr)
  const ansIdx = parseInt(ansIdxStr)
  return { type, ansOrQue, quesIdx, ansIdx }
}

const getNameFromUrl = (url?: string) => {
  if (!url) return null
  const urlObj = new URL(url || '')
  const arr1 = urlObj.pathname.split('/')
  const encodedName = arr1.length > 0 ? arr1[arr1.length - 1] : null
  if (!encodedName) return null
  const decoded = decodeURIComponent(encodedName)
  const arr = decoded.split('/')
  return arr.length > 0 ? arr[arr.length - 1] : null
}

const QuestionCard = ({
  idx: qIdx,
  question,
  duplicateQues,
  deleteQues,
  updateQues,
  onClickUpload
}: {
  idx: number
  question: Question
  duplicateQues: () => void
  deleteQues: () => void
  updateQues: (_ques: Partial<Question>) => void
  onClickUpload: (_uploadTo: string) => void
}) => {
  const updateAnswer = (idx: number, answer: Partial<Answer>) => {
    const answers = [...question.answers]
    answers[idx] = { ...answers[idx], ...answer }
    updateQues({ answers })
  }

  const audioName = question.audioUrl ? getNameFromUrl(question.audioUrl) : ''

  return (
    <div key={question.id} className="shadow-md rounded px-3 py-2">
      <div className="flex items-center space-x-4">
        <button
          className="p-2 rounded-md hover:bg-gray-100"
          title="Remove question"
          onClick={deleteQues}
        >
          <XIcon className="w-4 h-4" />
        </button>

        <InvisibleInput
          className="border-gray-100"
          label="Question"
          hideLabel
          id="question"
          name="question"
          type="text"
          placeholder="Enter Question..."
          value={question.title}
          onChange={(e) => {
            updateQues({ title: e.target.value })
          }}
        />

        <button
          onClick={duplicateQues}
          title="Duplicate question"
          className="inline-flex items-center p-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:shadow transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <DuplicateIcon className="w-4 h-4 text-gray-700" />
        </button>

        <button
          className="max-w-[30%] truncate px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => onClickUpload(`audio-question-${qIdx}`)}
        >
          {question.audioUrl ? audioName : 'Upload Audio'}
        </button>
      </div>

      <div className="space-y-2 my-2">
        {question.answers.map((answer, idx) => {
          const isChecked = question.correctIdx === idx
          const imageName = answer.imageUrl
            ? getNameFromUrl(answer.imageUrl)
            : ''

          return (
            <div key={idx} className="flex items-center rounded-md space-x-4">
              <div className="p-2">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => updateQues({ correctIdx: idx })}
                  className={classNames(
                    'appearance-none rounded outline-none focus:outline-none',
                    isChecked ? 'bg-indigo-600 border-none' : 'border-gray-300'
                  )}
                />
              </div>

              <InvisibleInput
                className="bg-gray-100"
                label={`Answer ${idx}`}
                hideLabel
                id={`answer-${idx}`}
                name={`answer-${idx}`}
                type="text"
                placeholder={`Enter Answer ${idx}...`}
                value={answer.title}
                onChange={(e) => updateAnswer(idx, { title: e.target.value })}
              />

              <button
                className="max-w-[30%] truncate px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => onClickUpload(`image-answer-${qIdx}-${idx}`)}
              >
                {answer.imageUrl ? imageName : 'Upload Image'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const TimePicker = ({
  maxTime,
  onChange
}: {
  maxTime: Quiz['maxTime']
  onChange: (_value: Quiz['maxTime']) => void
}) => {
  const { minutes, seconds } = maxTime || {}

  return (
    <div className="flex items-stretch space-x-2">
      <InvisibleInput
        className="w-16 bg-gray-100"
        label="Minutes"
        hideLabel
        value={minutes?.toString() || ''}
        onChange={(e) => {
          const value = e.target.valueAsNumber || 0
          onChange({ minutes: value, seconds: seconds || 0 })
        }}
        id="Minutes"
        name="Minutes"
        type="number"
        placeholder="mm"
      />

      <div className="my-auto">:</div>

      <InvisibleInput
        className="w-16 bg-gray-100"
        label="Seconds"
        hideLabel
        value={seconds?.toString() || ''}
        onChange={(e) => {
          const value = e.target.valueAsNumber || 0
          if (value > 59) return
          onChange({ seconds: value, minutes: minutes || 0 })
        }}
        id="seconds"
        name="seconds"
        type="number"
        placeholder="ss"
      />
    </div>
  )
}

const EditQuiz = () => {
  const router = useRouter()
  const id = typeof router.query.id === 'string' ? router.query.id : ''

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const { isLoading, isError } = useQuiz(id, (newQuiz) => {
    setQuiz((quiz) => quiz || newQuiz)
  })
  const { mutateAsync: saveQuiz } = useSaveQuiz()

  const [showTimer, setShowTimer] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [uploadModal, setUploadModal] = useState(false)
  const [uploadTo, setUploadTo] = useState('')

  useEffect(() => {
    if (!id && quiz) {
      router.replace(`/edit-quiz/${quiz.id}`)
      saveQuiz(quiz)
      toast.success('Created new quiz')
    }
  }, [id, quiz, router, saveQuiz])

  // For auto saving quiz
  // const debouncedQuiz = useDebounce(quiz, 1000)
  // useEffect(() => {
  //   if (debouncedQuiz) {
  //     console.log('auto save')
  //     saveQuiz(debouncedQuiz)
  //   }
  // }, [saveQuiz, debouncedQuiz])

  const selectedFile = useMemo(() => {
    if (!quiz) return undefined
    const { ansOrQue, quesIdx, ansIdx } = parseUploadTo(uploadTo)
    if (ansOrQue === 'question') {
      return quiz.questions?.[quesIdx]?.audioUrl
    } else if (ansOrQue === 'answer') {
      return quiz.questions?.[quesIdx]?.answers?.[ansIdx]?.imageUrl
    }
    return undefined
  }, [uploadTo, quiz])

  const closeUploadModal = () => {
    setUploadTo('')
    setUploadModal(false)
  }

  const updateQuiz = (
    newQuiz: Partial<Quiz> | ((_quiz: Quiz) => Partial<Quiz>)
  ) => {
    setQuiz((quiz) => {
      if (!quiz) return quiz // quiz is null so dont update it
      return {
        ...quiz,
        ...(typeof newQuiz === 'function' ? newQuiz(quiz) : newQuiz)
      }
    })
  }

  const handleSaveQuiz = () => {
    if (!quiz) return

    toast.promise(saveQuiz(quiz), {
      loading: 'Saving...',
      success: () => {
        if (!id) router.push(`/edit-quiz/${quiz.id}`)
        return 'Quiz Saved'
      },
      error: 'Some error occurred'
    })
  }

  const handleQuizInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    updateQuiz({ [name]: value })
  }

  const updateQues = (idx: number, ques: Partial<Question>) => {
    updateQuiz((quiz) => {
      const questions = [...quiz.questions]
      questions[idx] = { ...questions[idx], ...ques }
      return { questions }
    })
  }

  const deleteQues = (idx: number) => {
    updateQuiz((quiz) => {
      const questions = [...quiz.questions]
      questions.splice(idx, 1)
      return { questions }
    })
  }

  if (isLoading) {
    return (
      <Layout showNavbar={true}>
        <h3 className="my-4 text-center text-xl text-xl text-gray-500">
          Loading...
        </h3>
      </Layout>
    )
  }

  if (isError || !quiz) {
    return (
      <Layout showNavbar={true}>
        <h3 className="my-4 text-center text-xl text-xl text-red-600">
          Quiz not found
        </h3>
      </Layout>
    )
  }

  return (
    <Layout showNavbar={true}>
      <div className="flex my-4 space-x-4">
        <InvisibleInput
          label="Title:"
          value={quiz.title}
          onChange={handleQuizInput}
          id="title"
          name="title"
          type="text"
          placeholder="Enter quiz title..."
        />

        <div className="text-sm my-auto">
          {quiz.questions.length} Question(s)
        </div>

        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => setShowTimer((val) => !val)}
        >
          {quiz.maxTime
            ? `${quiz.maxTime.minutes}m ${quiz.maxTime.seconds}s max time`
            : 'Set timer'}
        </button>

        <div
          className="inline-flex relative items-center border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => setShowPicker(true)}
          onBlur={() => setShowPicker(false)}
        >
          <div
            className="h-full w-16 rounded-md"
            style={{ backgroundColor: quiz.backgroundColor }}
          />
          {showPicker && (
            <div className="absolute top-[100%] left-[50%] -translate-x-1/2 z-10">
              <BlockPicker
                color={quiz.backgroundColor}
                onChangeComplete={(color) => {
                  updateQuiz({ backgroundColor: color.hex })
                }}
              />
            </div>
          )}
        </div>

        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          onClick={handleSaveQuiz}
        >
          Save quiz
        </button>
      </div>

      {showTimer && (
        <div className="flex items-center rounded-md border border-gray-400 py-2 px-3">
          <div className="mr-2">Max time:</div>

          <TimePicker
            maxTime={quiz.maxTime}
            onChange={(maxTime) => updateQuiz({ maxTime })}
          />

          <button
            className="flex items-center ml-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={() => updateQuiz({ maxTime: null })}
          >
            Remove timer
          </button>
        </div>
      )}

      <div className="w-full flex items-center my-2 space-x-4">
        <InvisibleInput
          className="w-[70px] border-gray-200 border-opacity-100"
          fullWidth={false}
          label="Min Questions to Attempt:"
          value={quiz.minSampleRate}
          onChange={handleQuizInput}
          id="minSampleRate"
          name="minSampleRate"
          type="number"
          min="0"
          placeholder="0"
        />

        <InvisibleInput
          className="w-[70px] border-gray-200 border-opacity-100"
          fullWidth={false}
          label="Pass Percentage:"
          value={quiz.passPercentage}
          onChange={handleQuizInput}
          id="passPercentage"
          name="passPercentage"
          type="number"
          min="0"
          max="100"
          placeholder=""
        />
      </div>

      <div className="space-y-4 my-4">
        {quiz.questions.map((question, idx) => {
          return (
            <QuestionCard
              key={question.id}
              idx={idx}
              question={question}
              duplicateQues={() => {
                updateQuiz((quiz) => {
                  const newQuestions = [
                    ...quiz.questions.slice(0, idx + 1),
                    { ...question, id: nanoid() },
                    ...quiz.questions.slice(idx + 1)
                  ]
                  return { questions: newQuestions }
                })
              }}
              deleteQues={() => deleteQues(idx)}
              updateQues={(ques) => updateQues(idx, ques)}
              onClickUpload={(newUploadTo) => {
                setUploadTo(newUploadTo)
                setUploadModal(true)
              }}
            />
          )
        })}
      </div>

      <button
        className="flex items-center justify-center rounded py-2 px-3 border border-gray-300 text-gray-700 hover:border-gray-500 hover:text-gray-800 transition mb-4"
        onClick={() => {
          updateQuiz((quiz) => ({
            questions: [...quiz.questions, getDefaultQuestion()]
          }))
        }}
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        <span>Add question</span>
      </button>

      <UploadModalWrapper
        open={uploadModal}
        setOpen={(open) => !open && closeUploadModal()}
        type={uploadTo.split('-')[0]}
        selectedFile={selectedFile}
        onUpload={(url) => {
          const { ansOrQue, quesIdx, ansIdx } = parseUploadTo(uploadTo)

          if (ansOrQue === 'question') {
            updateQues(quesIdx, { audioUrl: url })
          } else if (ansOrQue === 'answer') {
            updateQuiz((quiz) => {
              const newQuiz = { ...quiz }
              newQuiz.questions[quesIdx].answers[ansIdx].imageUrl = url
              return newQuiz
            })
          }
          saveQuiz(quiz)
        }}
        onRemove={() => {
          const { ansOrQue, quesIdx, ansIdx } = parseUploadTo(uploadTo)

          if (ansOrQue === 'question') {
            updateQuiz((quiz) => {
              const newQuiz = { ...quiz }
              delete newQuiz.questions[quesIdx].audioUrl
              return newQuiz
            })
          } else if (ansOrQue === 'answer') {
            updateQuiz((quiz) => {
              const newQuiz = { ...quiz }
              delete newQuiz.questions[quesIdx].answers[ansIdx].imageUrl
              return newQuiz
            })
          }
          saveQuiz(quiz)
        }}
      />
    </Layout>
  )
}

const Wrapper = () => <AuthChecker LoggedInPage={EditQuiz} />

export default Wrapper
