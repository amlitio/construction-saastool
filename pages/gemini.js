import { useState } from 'react';
import Head from 'next/head';
import { useSession, signIn } from 'next-auth/react';

export default function GeminiChat() {
  const { data: session, status } = useSession();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Handle unauthenticated state
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-lg text-gray-700 mb-4">You must be signed in to view this page.</p>
        <button
          onClick={() => signIn('github')}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Sign in with GitHub
        </button>
      </div>
    );
  }

  // Authenticated state: render the main component
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
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome, {session.user.name}!</h1>
          <h2 className="text-xl font-bold text-center text-gray-600 mb-6">Gemini AI Assistant</h2>
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
