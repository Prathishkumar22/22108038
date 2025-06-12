
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [numberId, setNumberId] = useState('p'); 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [windowSize, setWindowSize] = useState(10);
  const [numberWindow, setNumberWindow] = useState([]);

  const API_ENDPOINTS = {
    p: 'http://20.244.56.144/evaluation-service/primes',
    f: 'http://20.244.56.144/evaluation-service/fibo',
    e: 'http://20.244.56.144/evaluation-service/even', 
    r: 'http://20.244.56.144/evaluation-service/rand'  
  };

  const fetchNumbers = async () => {
    setLoading(true);
    setError(null);
    
    try {
    
      const response = await fetch(API_ENDPOINTS[numberId], {
        signal: AbortSignal.timeout(500) 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      const newNumbers = result.numbers || [];
      
      const prevWindow = [...numberWindow];
      let updatedWindow = [...numberWindow];
      
      newNumbers.forEach(num => {
        if (!updatedWindow.includes(num)) {
          if (updatedWindow.length >= windowSize) {
            updatedWindow.shift()
          }
          updatedWindow.push(num);
        }
      });
      
      // Calculate average
      const sum = updatedWindow.reduce((acc, curr) => acc + curr, 0);
      const avg = updatedWindow.length > 0 
        ? (sum / updatedWindow.length).toFixed(2)
        : '0.00';
      
      setNumberWindow(updatedWindow);
      setData({
        windowPrevState: prevWindow,
        windowCurrState: updatedWindow,
        numbers: newNumbers,
        avg: avg
      });
      
    } catch (err) {
      setError(err.name === 'AbortError' 
        ? 'Request timed out (500ms)' 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNumbers();
  }, [numberId]);

  const handleNumberIdChange = (e) => {
    setNumberId(e.target.value);
  };

  const handleWindowSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    if (!isNaN(newSize) && newSize > 0) {
      setWindowSize(newSize);
      
      setNumberWindow(prev => prev.slice(-newSize));
    }
  };

  return (
    <div className="app">
      <h1>Average Calculator</h1>
      
      <div className="controls">
        <div className="control-group">
          <label htmlFor="number-type">Select number type:</label>
          <select 
            id="number-type" 
            value={numberId} 
            onChange={handleNumberIdChange}
          >
            <option value="p">Prime Numbers</option>
            <option value="f">Fibonacci Numbers</option>
            <option value="e">Even Numbers</option>
            <option value="r">Random Numbers</option>
          </select>
        </div>
        
        {/* <div className="control-group">
          <label htmlFor="window-size">Window Size:</label>
          <input
            id="window-size"
            type="number"
            min="1"
            value={windowSize}
            onChange={handleWindowSizeChange}
          />
        </div> */}
        
        <button onClick={fetchNumbers} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Numbers'}
        </button>
      </div>

      {error && (
        <div className="error">
          Error: {error}
          <button onClick={fetchNumbers} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {data && (
        <div className="results">
          <div className="window-state">
            <h3>Window States:</h3>
            <div>
              <strong>Previous:</strong> {JSON.stringify(data.windowPrevState)}
            </div>
            <div>
              <strong>Current:</strong> {JSON.stringify(data.windowCurrState)}
            </div>
          </div>
          
          <div className="numbers">
            <h3>New Numbers Received:</h3>
            {JSON.stringify(data.numbers)}
          </div>
          
          <div className="average">
            <h3>Average:</h3>
            {data.avg}
          </div>
        </div>
      )}

      <div className="server-info">
        <h3>Server Information:</h3>
        <p>Fetching from: <code>{API_ENDPOINTS[numberId]}</code></p>
        {/* <p>Current window size: {windowSize}</p> */}
        {/* <p>Numbers in window: {numberWindow.length}</p> */}
      </div>
    </div>
  );
}

export default App;