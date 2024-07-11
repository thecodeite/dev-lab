import { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv'

interface Calc {
  id: string
  value: number
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const id = ('calc_' + req.query.id) as string
  console.log('id:', id)
  console.log('method:', req.method)
  if (req.method === 'GET') {
    // Retrieve the calc object from the KV store
    const calcObject = await kv.get<Calc>(id)

    if (calcObject) {
      res.status(200).json(calcObject)
    } else {
      res.status(404).json({ error: 'Calc object not found' })
    }
  } else if (req.method === 'PUT') {
    // Upsert a new calc object
    const value = req.body

    if (!value) {
      res.status(400).json({ error: 'Invalid request body' })
      return
    }

    // Store the calc object in the KV store
    await kv.set(id, value)

    res.status(200).json(value)
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
