import { useAuth } from 'contexts/AuthContext'
import { saveAs } from 'file-saver'
import {
  DataSnapshot,
  equalTo,
  onValue,
  orderByChild,
  query,
  ref,
  remove,
  set
} from 'firebase/database'
import {
  getBytes,
  getDownloadURL,
  getMetadata,
  listAll,
  ref as storageRef,
  StorageReference,
  uploadBytes,
  uploadString
} from 'firebase/storage'
import {
  Question,
  Quiz,
  Quizzes,
  Submission,
  SubmissionsResults,
  SubmitApiReturn
} from 'interfaces'
import JSZip from 'jszip'
import { nanoid } from 'nanoid'
import { useRef } from 'react'
import { useMutation, useQuery } from 'react-query'

import { db, storage } from 'config/firebase'
import queryClient from 'config/react-query'

export const quizzesRef = ref(db, `/quizzes`)
export const quizzesQuery = (createdBy: string) => {
  return query(quizzesRef, orderByChild('createdBy'), equalTo(createdBy))
}

export const submissionsRef = ref(db, `/submissions`)
export const submissionsQuery = (quizId: string) => {
  return query(submissionsRef, orderByChild('quizId'), equalTo(quizId))
}

export const getDefaultQuestion = (): Question => ({
  id: nanoid(),
  title: 'Type the question...',
  correctIdx: 1,
  answers: [
    { title: 'Answer 1' },
    { title: 'Answer 2' },
    { title: 'Answer 3' },
    { title: 'Answer 4' }
  ]
})

export const getDefaultQuiz = (createdBy: string): Quiz => ({
  id: nanoid(),
  title: 'New quiz',
  backgroundColor: '#fff',
  maxTime: null,
  createdBy,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  questions: [getDefaultQuestion()],
  minSampleRate: 3,
  passPercentage: 80
})

type OnQuizLoad = (_quiz: Quiz | null) => void

export const fetchQuiz = (id: string) => {
  return new Promise<Quiz>((resolve, reject) => {
    onValue(
      query(ref(db, `quizzes/${id}`)),
      (snapshot: DataSnapshot) => {
        if (!snapshot.exists) reject(new Error('Quiz not found'))
        resolve(snapshot.val() as Quiz)
      },
      (err) => reject(err)
    )
  })
}

export const useQuiz = (id: string, onQuizLoad: OnQuizLoad) => {
  const { user } = useAuth()
  const onQuizLoadRef = useRef<OnQuizLoad>(() => {})
  onQuizLoadRef.current = onQuizLoad

  const result = useQuery(
    ['quiz', id],
    async () => {
      if (!id) {
        if (!user) return null
        return getDefaultQuiz(user.uid || '')
      }

      return fetchQuiz(id)
    },
    {
      onSuccess: (quiz) => onQuizLoadRef.current(quiz)
    }
  )

  return result
}

export const useQuizzesList = () => {
  const { user } = useAuth()

  return useQuery('quizzes', async () => {
    const query = quizzesQuery(user!.uid)
    return new Promise<Quizzes>((resolve, reject) => {
      onValue(
        query,
        (snapshot) => {
          resolve((snapshot.val() || {}) as Quizzes)
        },
        (err) => reject(err)
      )
    })
  })
}

export const useSubmissionsList = (quizId: string) => {
  return useQuery(['submissions', quizId], async () => {
    const query = submissionsQuery(quizId)
    return new Promise<SubmissionsResults>((resolve, reject) => {
      onValue(
        query,
        (snapshot) => {
          resolve((snapshot.val() || {}) as SubmissionsResults)
        },
        (err) => reject(err)
      )
    })
  })
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

export const useSaveQuiz = () => {
  return useMutation(async (quiz: Quiz) => {
    const value = { ...quiz, updatedAt: Date.now() }
    return set(ref(db, `quizzes/${quiz.id}`), value)
  })
}

export const useDuplicateQuiz = () => {
  return useMutation(
    async (quiz: Quiz) => {
      const id = nanoid()
      const newQuiz: Quiz = {
        ...quiz,
        id,
        title: `Duplicate ${quiz.title}`,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      return set(ref(db, `quizzes/${id}`), newQuiz)
    },
    {
      onSettled: (_, __, quiz) => {
        queryClient.invalidateQueries('quizzes')
        queryClient.invalidateQueries(['quiz', quiz.id])
      }
    }
  )
}

export const useDeleteQuiz = () => {
  return useMutation(
    async (id: string) => {
      return remove(ref(db, `quizzes/${id}`))
    },
    {
      onSettled: (_, __, id) => {
        queryClient.invalidateQueries('quizzes')
        queryClient.invalidateQueries(['quiz', id])
      }
    }
  )
}

export const useQuizSubmission = () => {
  return useMutation(async (data: Submission) => {
    const res = await fetch(`/api/quiz/${data.quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    const submission: SubmitApiReturn = await res.json()
    return submission
  })
}

export const useQuizDownload = () => {
  return useMutation(async (quiz: Quiz) => {
    // const res = await fetch(`/api/quiz/${data.id}/download`, {
    //   method: 'POST',
    //   body: JSON.stringify(data)
    // })

    // const resData = await res.json()

    // const zipref = storageRef(storage, `/zips/${data.id}`)
    // const zip = new JSZip()
    // console.log(zipref.bucket, zipref.fullPath)

    const files: string[] = []
    quiz.questions.forEach((ques) => {
      if (ques.audioUrl) {
        const url = ques.audioUrl
        const start = url.indexOf('quizzes%2F') + 10
        const end = url.indexOf('?alt=media')
        const file = url.substring(start, end)
        files.push(file)
      }
      ques.answers.forEach((ans) => {
        if (ans.imageUrl) {
          const url = ans.imageUrl
          const start = url.indexOf('quizzes%2F') + 10
          const end = url.indexOf('?alt=media')
          const file = url.substring(start, end)
          files.push(file)
        }
      })
    })

    const xsdfiles = [
      'adlcp_rootv1p2.xsd',
      'ims_xml.xsd',
      'imscp_rootv1p1p2.xsd',
      'imsmd_rootv1p2p1.xsd'
    ]

    for (const file of xsdfiles) {
      const fileRef = storageRef(storage, `/template/${file}`)
      const fileBytes = await getBytes(fileRef)
      await uploadBytes(
        storageRef(storage, `/zips/${quiz.id}/${file}`),
        fileBytes
      )
    }

    // xsdfiles.forEach((file) => {
    //   const fileRef = storageRef(storage, `/template/${file}`)
    //   getBytes(fileRef).then((bytes) => {
    //     uploadBytes(storageRef(storage, `/zips/${quiz.id}/${file}`), bytes)
    //   })
    // })

    const path = `/zips/${quiz.id}/res`

    for (const file of files) {
      const fileRef = storageRef(storage, `/quizzes/${file}`)
      const fileBytes = await getBytes(fileRef)
      await uploadBytes(
        storageRef(storage, `${path}/public/${file}`),
        fileBytes
      )
    }

    // files.forEach((file) => {
    //   const fileRef = storageRef(storage, `/quizzes/${file}`)
    //   getBytes(fileRef).then((bytes) => {
    //     uploadBytes(storageRef(storage, `${path}/public/${file}`), bytes)
    //   })
    // })

    for (const file of ['index.html', 'index.js']) {
      const fileRef = storageRef(storage, `/template/${file}`)
      const fileBytes = await getBytes(fileRef)
      await uploadBytes(storageRef(storage, `${path}/${file}`), fileBytes)
    }

    // ;['index.html', 'index.js'].forEach((file) => {
    //   const fileRef = storageRef(storage, `/template/${file}`)
    //   getBytes(fileRef).then((bytes) => {
    //     uploadBytes(storageRef(storage, `${path}/${file}`), bytes)
    //   })
    // })

    const fileRef = storageRef(storage, '/template/audioicon.svg')
    const fileBytes = await getBytes(fileRef)
    await uploadBytes(
      storageRef(storage, `${path}/public/audioicon.svg`),
      fileBytes
    )

    const ques = quiz.questions.map((q) => {
      const audio = `./public/${getNameFromUrl(q.audioUrl)}`
      const ans = q.answers.map((a) => {
        if (!a.imageUrl) return a
        return {
          title: a.title,
          imageUrl: `./public/${getNameFromUrl(a.imageUrl)}`
        }
      })
      if (!q.audioUrl) return { ...q, answers: ans }
      return { ...q, answers: ans, audioUrl: audio }
    })

    await uploadString(
      storageRef(storage, `${path}/public/quiz.json`),
      JSON.stringify({ ...quiz, questions: ques })
    )

    const addFilesToZip = async (
      folderRef: StorageReference,
      zipObj: JSZip
    ) => {
      const folder = await listAll(folderRef)
      const promises = folder.items
        .map(async (item) => {
          const file = await getMetadata(item)
          const fileRef = storageRef(storage, item.fullPath)
          const fileBlob = await getDownloadURL(fileRef).then((url) => {
            return fetch(url).then((response) => response.blob())
          })
          zipObj.file(file.name, fileBlob)
        })
        .reduce((acc, curr) => acc.then(() => curr), Promise.resolve())
      await promises
    }

    const jszip = new JSZip()

    const zipFolderRef = storageRef(storage, `/zips/${quiz.id}/`)

    await addFilesToZip(zipFolderRef, jszip)

    const resFolderRef = storageRef(storage, `/zips/${quiz.id}/res/`)
    const resZip = jszip.folder('res')!

    await addFilesToZip(resFolderRef, resZip)

    const publicFolderRef = storageRef(storage, `/zips/${quiz.id}/res/public/`)
    const publicZip = resZip.folder('public')

    await addFilesToZip(publicFolderRef, publicZip!)

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<manifest identifier="AdfoVu4Fd1MHs" xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:lom="http://www.imsglobal.org/xsd/imsmd_rootv1p2p1" xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
    <metadata>
        <schema>ADL SCORM</schema>
        <schemaversion>1.2</schemaversion>
        <lom:lom>
            <lom:general>
                <lom:title>
                    <lom:langstring>${quiz.id}</lom:langstring>
                </lom:title>
            </lom:general>
            <lom:educational>
                <lom:typicallearningtime>
                <lom:datetime>01:00:00</lom:datetime>
                </lom:typicallearningtime>
            </lom:educational>
        </lom:lom>
    </metadata>
    <organizations default="quiz1_organization">
        <organization identifier="quiz1_organization">

            <title>${quiz.id}</title>
            <item identifier="BECCB4D6-F89B-4A2E-A655-6D8A5802827B" identifierref="resource">
                <title>${quiz.id}</title>
            </item>
        </organization>
    </organizations>
    <resources>
        <resource identifier="resource" type="webcontent" adlcp:scormtype="sco" href="res/index.html">
            <file href="res/index.js"/>
            <file href="res/index.html"/>
            ${(await listAll(publicFolderRef)).items
              .map((item) => `<file href="res/public/${item.name}"/>`)
              .join('\n')}
        </resource>
    </resources>
</manifest>
    `

    jszip.file('imsmanifest.xml', xml)

    const blob = await jszip.generateAsync({ type: 'blob' })
    saveAs(blob, 'download.zip')

    return 'Zip Successful!'
  })
}
