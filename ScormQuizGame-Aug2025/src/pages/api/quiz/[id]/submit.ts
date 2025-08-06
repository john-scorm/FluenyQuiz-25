import { ref, set } from 'firebase/database'
import {
  Submission,
  SubmissionResult,
  SubmissionResultAnswers,
  SubmitApiReturn
} from 'interfaces'
import { nanoid } from 'nanoid'
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchQuiz } from 'services/quiz'

import { db } from 'config/firebase'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<SubmitApiReturn>
) => {
  try {
    const submission = JSON.parse(req.body) as Submission
    const { name, rollNo, quizId, timeTaken } = submission

    const submissionResult: SubmissionResult = {
      id: nanoid(),
      submittedAt: Date.now(),
      name,
      rollNo,
      quizId,
      timeTaken,
      answered: 0,
      sampleRate: 0,
      correct: 0,
      percentage: 0,
      answers: [],
      passed: false
    }

    const quiz = await fetchQuiz(quizId)

    console.log(
      'Ques',
      quiz.questions.length,
      'Ans',
      submission.answers.length,
      'Selected',
      submission.answers.filter((ans) => typeof ans.selectedIdx === 'number')
        .length
    )

    const answers: SubmissionResultAnswers = []
    let idx = 0
    for (const question of quiz.questions) {
      const answer = submission.answers[idx]

      if (!answer) {
        answers.push({
          selectedIdx: null,
          queId: question.id,
          correct: false,
          markGiven: 0
        })
        idx++
        continue
      }

      if (answer.selectedIdx === question.correctIdx) {
        submissionResult.correct++
        answers.push({ ...answer, correct: true, markGiven: 1 })
      } else {
        answers.push({ ...answer, correct: false, markGiven: 0 })
      }

      if (typeof answer.selectedIdx === 'number') {
        submissionResult.answered++
      }

      idx++
    }

    submissionResult.answers = answers

    const percentage =
      (submissionResult.correct * 100) / submissionResult.answered
    submissionResult.percentage = parseInt(percentage.toFixed(2))

    const timeTakenInMin = timeTaken / 60

    const sampRate = submissionResult.answered / timeTakenInMin
    submissionResult.sampleRate = parseFloat(sampRate.toFixed(4))

    if (
      submissionResult.sampleRate >= quiz.minSampleRate &&
      submissionResult.percentage >= quiz.passPercentage
    ) {
      submissionResult.passed = true
    }

    await set(ref(db, `submissions/${submissionResult.id}`), submissionResult)

    res.status(200).json({ error: false, submission: submissionResult })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: true, message: err.message })
      return
    }

    res.status(500).json({ error: true, message: 'Internal server error' })
  }
}

export default handler
