export type LoginParams = { email: string; password: string }

export type Answer = {
  title: string
  imageUrl?: string
}

export type Question = {
  id: string
  title: string
  audioUrl?: string
  answers: Array<Answer>
  correctIdx: number
}

export type Quiz = {
  id: string
  title: string
  backgroundColor: string
  createdBy: string
  createdAt: number
  updatedAt: number
  maxTime: null | { minutes: number; seconds: number }
  questions: Array<Question>
  minSampleRate: number
  passPercentage: number
}

export type Quizzes = Record<string, Quiz>

export type UserData = { name: string; rollNo: string }

/**
 * What is sent to api
 */
export type SubmissionAnswer = {
  queId: string
  selectedIdx: number | null
}

export type SubmissionAnswers = Array<SubmissionAnswer>

/**
 * What is finally saved in db
 */
export type SubmissionResultAnswers = Array<
  SubmissionAnswer & {
    correct: boolean
    markGiven: number
  }
>

/**
 * Base submission data
 */
export type SubmissionData = UserData & {
  id: string
  quizId: string
  submittedAt: number | string
}

/**
 * This is sent from take quiz page to api
 */
export type Submission = SubmissionData & {
  answers: SubmissionAnswers
  /**
   * Time taken in seconds
   */
  timeTaken: number
}

/**
 * This is the final submission data saved in db
 */
export type SubmissionResult = SubmissionData & {
  answered: number
  sampleRate: number
  correct: number
  percentage: number
  answers: SubmissionResultAnswers
  passed: boolean
  timeTaken: number
}

export type SubmissionsResults = Record<string, SubmissionResult>

export type SubmitApiReturn =
  | {
      error: true
      message: string
    }
  | {
      error: false
      submission: SubmissionResult
    }

export type DownloadData = {
  quizId: string
}
