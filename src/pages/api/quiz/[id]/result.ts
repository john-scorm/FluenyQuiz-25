import { get, ref, set } from 'firebase/database'
import type { NextApiRequest, NextApiResponse } from 'next'

import { db } from 'config/firebase'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'POST') {
      const results = JSON.parse(req.body)
      const { id: quizId } = req.query
      const quizResultRef = ref(db, `/results/${quizId}/${results.id}`)
      set(quizResultRef, results)
      res.status(201).json({ error: false, message: 'Results Uploaded!' })
    } else if (req.method === 'GET') {
      const { id: quizId } = req.query
      const quizResultRef = ref(db, `/results/${quizId}`)
      const data = await get(quizResultRef)
      res.status(200).json(data)
    }
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: true, message: err.message })
      return
    }

    res.status(500).json({ error: true, message: 'Internal server error' })
  }
}

export default handler
