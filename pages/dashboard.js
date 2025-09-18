import { getSession, useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Dashboard() {
  const { data: session } = useSession()
  const [uploads, setUploads] = useState([])
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) {
      fetch('/api/upload')
        .then((res) => res.json())
        .then((data) => setUploads(data.uploads || []))
    }
  }, [session])

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    if (res.ok) {
      setUploads([data.upload, ...uploads])
      setFile(null)
    } else {
      setError(data.error || 'Failed to upload')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex space-x-4">
          <Link href="/gemini" className="px-4 py-2 bg-purple-600 text-white rounded">Gemini Chat</Link>
          <button onClick={() => signOut()} className="px-4 py-2 bg-gray-600 text-white rounded">Logout</button>
        </div>
      </div>
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Upload CSV</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-2">{error}</div>}
        <input type="file" onChange={handleFileChange} className="mb-2" />
        <button onClick={handleUpload} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading || !file}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-4">Your Uploads</h2>
        {uploads.length === 0 ? (
          <p>No uploads yet.</p>
        ) : (
          <div className="space-y-4">
            {uploads.map((u) => (
              <div key={u.id} className="border rounded p-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{u.filename}</h3>
                  <a
                    href={`/api/upload?file=${encodeURIComponent(u.filename)}`}
                    className="text-blue-600 underline"
                  >
                    Download
                  </a>
                </div>
                <p className="text-sm text-gray-500">Uploaded at {new Date(u.uploadedAt).toLocaleString()}</p>
                <pre className="whitespace-pre-wrap bg-gray-50 p-2 rounded mt-2">{u.summary}</pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  const session = await getSession(context)
  if (!session) {
    return {
      redirect: { destination: '/login', permanent: false },
    }
  }
  return { props: { session } }
}
