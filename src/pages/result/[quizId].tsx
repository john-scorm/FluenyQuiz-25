import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { tw } from 'twind'

const Result = () => {
  const router = useRouter()
  const { quizId } = router.query
  const [data, setData] = useState<{ [key: string]: any }>({ loading: true })

  useEffect(() => {
    fetch(`/api/quiz/${quizId}/result`, { method: 'GET', mode: 'no-cors' })
      .then((res) => res.json())
      .then(setData)
      .catch(console.log)
  }, [])

  if (!data)
    return (
      <div className="text-4xl w-screen h-screen flex justify-center items-center">
        <div className="bg-blue-500 p-10 rounded">No Results Yet!</div>
      </div>
    )

  if (data.loading)
    return (
      <div className="text-4xl w-screen h-screen flex justify-center items-center">
        <div className="bg-blue-500 p-10 rounded">Loading!</div>
      </div>
    )

  return (
    <div>
      {data &&
        Object.keys(data).map((key) => {
          return (
            <div
              key={key}
              className="rounded flex flex-wrap gap-3 border border-gray-200 px-3 py-3 m-2"
            >
              <div className="bg-gray-200 py-2 px-4 rounded flex flex-col items-start justify-center">
                {data[key].title}
                <div className="text-xs">
                  {new Date(data[key].submittedAt).toLocaleString()}
                </div>
              </div>
              <div
                className={tw(
                  data[key].passed ? 'bg-green-400' : 'bg-red-400',
                  'py-2 px-4 rounded flex items-center'
                )}
              >
                Percentage: {data[key].percentage}
              </div>
              <div className="bg-blue-200 py-2 px-4 rounded flex items-center">
                Answered: {data[key].answered} / {data[key].totalQues}
              </div>
              <div className="bg-blue-200 py-2 px-4 rounded flex items-center">
                Time Taken - {Math.floor(data[key].timeTaken.minutes)}:
                {Math.floor(data[key].timeTaken.seconds)} mins
              </div>
              {data[key].maxTime && (
                <div className="bg-blue-200 py-2 px-4 rounded flex items-center">
                  Max Time - {Math.floor(data[key].maxTime.minutes)}:
                  {Math.floor(data[key].maxTime.seconds)} mins
                </div>
              )}
            </div>
          )
        })}
    </div>
  )
}

export default Result
