import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function GeminiChat() {
  const { data: session } = useSession();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  // You could also use a `getServerSideProps` check here to protect the page
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-lg text-gray-700">Please <Link href="/login" className="text-blue-600 underline">log in</Link> to access this page.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt) return;
    
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (res.ok) {
        setResponse(data.text);
      } else {
        setResponse(data.error || 'An unexpected error occurred.');
      }
    } catch (error) {
      setResponse('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Gemini AI Assistant</title>
      </Head>
      <div className="min-h-screen p-8 flex flex-col items-center">
        <div className="max-w-xl w-full bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Gemini AI Assistant</h1>
          <form onSubmit={handleSubmit} className="mb-6">
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-300"
              rows="5"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask me anything..."
              disabled={loading}
            ></textarea>
            <button
              type="submit"
              className="mt-4 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Get Response'}
            </button>
          </form>
          {response && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Response:</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{response}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
