import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Vite + React + Tailwind + daisyUI</h2>
          <p>This project is ready for deployment on Netlify!</p>
          <div className="flex justify-center my-4">
            <button className="btn btn-primary" onClick={() => setCount((count) => count + 1)}>
              Count is {count}
            </button>
          </div>
          <div className="card-actions justify-end">
            <button className="btn btn-ghost">Learn More</button>
            <button className="btn btn-secondary">Get Started</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
