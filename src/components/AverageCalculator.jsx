import { useState } from 'react';

const VALID_IDS = ['p', 'f', 'e', 'r'];
const API_ENDPOINTS = {
  p: 'http://20.244.56.144/evaluation-service/primes',
  f: 'http://20.244.56.144/evaluation-service/fibo',
  e: 'http://20.244.56.144/evaluation-service/even',
  r: 'http://20.244.56.144/evaluation-service/rand'
};

function AverageCalculator() {
  const [numberId, setNumberId] = useState('p');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');

  const fetchWithTimeout = async (url, timeout = 500) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error('Fetch failed');
      return await res.json();
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  };

 
const fetchAverage = async () => {
  setLoading(true);
  setError('');
  setResponse(null);

  try {
    const url = API_ENDPOINTS[numberId];
    const data = await fetchWithTimeout(url);

    if (!data.numbers || !Array.isArray(data.numbers)) {
      throw new Error('Invalid data format');
    }

    const avg = data.numbers.reduce((sum, val) => sum + val, 0) / data.numbers.length;

    setResponse({
      windowPrevState: [], // optional, or replace with actual if server gives it
      windowCurrState: data.numbers,
      avg
    });
  } catch (err) {
    setError('Failed to fetch data (timeout or server error).');
  }

  setLoading(false);
};

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-lg space-y-4">
      <h2 className="text-2xl font-semibold text-center">Average Calculator</h2>

      <div className="flex justify-center gap-3">
        {VALID_IDS.map(id => (
          <button
            key={id}
            onClick={() => setNumberId(id)}
            className={`px-4 py-2 rounded-md ${
              numberId === id ? 'bg-blue-600 text-white' : 'bg-gray-300'
            }`}
          >
            {id.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={fetchAverage}
          disabled={loading}
          className="mt-3 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded"
        >
          {loading ? 'Loading...' : 'Fetch Average'}
        </button>
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {response && (
        <div className="mt-4 space-y-2">
          <div><strong>Window Previous State:</strong> {response.windowPrevState.join(', ')}</div>
          <div><strong>Window Current State:</strong> {response.windowCurrState.join(', ')}</div>
          <div><strong>Average:</strong> {Number(response.avg).toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}

export default AverageCalculator;