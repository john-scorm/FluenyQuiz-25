import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { onAuthStateChanged } from "firebase/auth"
import { ref, onValue, push, set } from "firebase/database"
import { auth, db } from "@/config/firebase"

type QuizMeta = {
  title: string
  questionCount: number
  updatedAt: number
}

export default function MyQuizzes() {
  const r = useRouter()
  const [uid, setUid] = useState<string | null>(null)
  const [quizzes, setQuizzes] = useState<Record<string, QuizMeta>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // client-only safety
    if (typeof window === "undefined" || !auth) return

    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setUid(null)
        setQuizzes({})
        setLoading(false)
        return
      }
      setUid(user.uid)
      // Listen to this user's quizzes: /quizzes/{uid}
      const qRef = ref(db, `quizzes/${user.uid}`)
      onValue(qRef, (snap) => {
        const val = (snap.val() || {}) as Record<string, any>
        const mapped: Record<string, QuizMeta> = {}
        Object.keys(val).forEach((id) => {
          const q = val[id] || {}
          mapped[id] = {
            title: q.title || "Untitled quiz",
            questionCount: Array.isArray(q.questions) ? q.questions.length : (q.questionCount || 0),
            updatedAt: q.updatedAt || q.createdAt || Date.now(),
          }
        })
        setQuizzes(mapped)
        setLoading(false)
      })
    })

    return () => unsub()
  }, [])

  async function createNewQuiz() {
    if (!uid) return
    const colRef = ref(db, `quizzes/${uid}`)
    const newRef = push(colRef)
    const now = Date.now()
    await set(newRef, {
      title: "New quiz",
      passPercentage: 80,
      minSampleRate: 3,
      questions: [],           // Player/editor can fill this out later
      createdAt: now,
      updatedAt: now,
    })
    r.push(`/edit-quiz/${newRef.key}`)
  }

  // UI
  if (loading) return <main style={{ padding: 24 }}>Loading…</main>

  if (!uid) {
    return (
      <main style={{ padding: 24 }}>
        <h1>My Quizzes</h1>
        <p>You’re not logged in.</p>
        <p>
          Use the <b>Login</b> button in the header, or go to{" "}
          <Link href="/login">/login</Link> if you have a login page.
        </p>
      </main>
    )
  }

  const items = Object.entries(quizzes).sort((a, b) => b[1].updatedAt - a[1].updatedAt)

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>My Quizzes</h1>
        <button onClick={createNewQuiz} style={{ padding: "8px 12px", borderRadius: 8 }}>
          + Create new
        </button>
      </div>

      {items.length === 0 ? (
        <p style={{ marginTop: 16 }}>No quizzes yet. Click “Create new”.</p>
      ) : (
        <ul style={{ marginTop: 16, listStyle: "none", padding: 0 }}>
          {items.map(([id, q]) => (
            <li key={id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", border: "1px solid #ddd", borderRadius: 10, marginBottom: 12
            }}>
              <div>
                <div style={{ fontWeight: 600 }}>{q.title}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {q.questionCount} question(s) • Last updated {new Date(q.updatedAt).toLocaleString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link href={`/edit-quiz/${id}`}><button>Edit</button></Link>
                {/* Add more actions later: Share, Duplicate, Delete */}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
