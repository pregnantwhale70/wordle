import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [word, setWord] = useState('');
  const [guesses, setGuesses] = useState(Array(6).fill().map(() => Array(5).fill('')));
  const [color, setColor] = useState(Array(6).fill().map(() => Array(5).fill('bg-white')));
  const [currRow, setCurrRow] = useState(0);
  const [currCol, setCurrCol] = useState(0);
  const [currWord, setCurrWord] = useState('');
  const [message, setMessage] = useState('');

  const inputRefs = useRef(Array(6).fill().map(() => Array(5).fill(null)));

  useEffect(() => {
    fetchWord();
  }, []);

  useEffect(() => {
    if (currRow < 6 && currCol < 5) {
      inputRefs.current[currRow][currCol]?.focus();
    }
  }, [currRow, currCol]);

  const fetchWord = async () => {
    try {
      const res = await fetch('https://random-word-api.herokuapp.com/word?length=5');
      const data = await res.json();
      setWord(data[0].toUpperCase());
      console.log('Target Word:', data[0]);
    } catch (error) {
      console.error('Failed to fetch word:', error);
    }
  };

  const handleBackspace = (rowIdx, colIdx) => {
    if (message || currRow >= 6) return;
    const updated = [...guesses];
    if (guesses[rowIdx][colIdx] !== '') {
      updated[rowIdx][colIdx] = '';
      setGuesses(updated);
      setCurrWord(prev => prev.slice(0, -1));
    } else if (colIdx > 0) {
      updated[rowIdx][colIdx - 1] = '';
      setGuesses(updated);
      setCurrCol(colIdx - 1);
      setCurrWord(prev => prev.slice(0, -1));
    }
  };

  const handleEnter = () => {
    if (currWord.length !== 5 || message || currRow >= 6) return;

    const guess = currWord.split('');
    const target = word.split('');
    const newColor = [...color];
    const used = Array(5).fill(false);

    for (let i = 0; i < 5; i++) {
      if (guess[i] === target[i]) {
        newColor[currRow][i] = 'bg-green-500';
        used[i] = true;
      }
    }

    for (let i = 0; i < 5; i++) {
      if (newColor[currRow][i] !== 'bg-green-500') {
        let found = false;
        for (let j = 0; j < 5; j++) {
          if (!used[j] && guess[i] === target[j]) {
            found = true;
            used[j] = true;
            break;
          }
        }
        newColor[currRow][i] = found ? 'bg-yellow-500' : 'bg-gray-400';
      }
    }

    setColor(newColor);

    if (currWord === word) {
      setMessage('🎉 You guessed it right!');
    } else if (currRow === 5) {
      setMessage(`❌ Game over! The word was ${word}`);
    }

    setCurrRow(prev => prev + 1);
    setCurrCol(0);
    setCurrWord('');
  };

  const handleRestart = () => {
    setGuesses(Array(6).fill().map(() => Array(5).fill('')));
    setColor(Array(6).fill().map(() => Array(5).fill('bg-white')));
    setCurrRow(0);
    setCurrCol(0);
    setCurrWord('');
    setMessage('');
    fetchWord();
  };

  return (
    <>
      <div className="flex flex-col items-center gap-2 mt-10">
        {
          guesses.map((guess, rowIdx) => (
            <div className="flex gap-2" key={rowIdx}>
              {
                guess.map((letter, colIdx) => (
                  <input
                    key={colIdx}
                    ref={el => inputRefs.current[rowIdx][colIdx] = el}
                    type="text"
                    maxLength={1}
                    value={letter}
                    disabled={rowIdx !== currRow || message}
                    onChange={(e) => {
                      if (rowIdx !== currRow || message) return;
                      const val = e.target.value.toUpperCase();
                      if (!/^[A-Z]$/.test(val)) return;
                      const updated = [...guesses];
                      updated[rowIdx][colIdx] = val;
                      setGuesses(updated);
                      setCurrWord(prev => prev + val);
                      if (colIdx < 4) setCurrCol(colIdx + 1);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace') {
                        e.preventDefault();
                        handleBackspace(rowIdx, colIdx);
                      }
                    }}
                    className={`w-12 h-12 border text-center text-xl font-bold uppercase ${color[rowIdx][colIdx]} border-gray-400`}
                  />
                ))
              }
            </div>
          ))
        }
      </div>

      <div className="flex flex-col items-center mt-6 gap-2">
        <button
          disabled={currWord.length !== 5 || message || currRow >= 6}
          className={`px-4 py-2 rounded text-white ${
            currWord.length !== 5 || message || currRow >= 6
              ? 'bg-gray-400'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
          onClick={handleEnter}
        >
          ENTER
        </button>

        <button
          onClick={handleRestart}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          New Game
        </button>

        {message && (
          <div className="mt-4 text-lg font-semibold text-center text-purple-700">
            {message}
          </div>
        )}
      </div>

    </>
  );
}

export default App;
