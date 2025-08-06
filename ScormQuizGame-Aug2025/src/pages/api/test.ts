import { ref, set } from 'firebase/database'
import type { NextApiRequest, NextApiResponse } from 'next'

import { db } from 'config/firebase'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'POST') {
      const data = JSON.parse(req.body)
      const refData = ref(db, `/data`)
      set(refData, data)
      res.status(201).send({ data: 'ok' })
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
