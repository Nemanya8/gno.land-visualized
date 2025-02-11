"use client"

export default function Home() {

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <button
        style={{ flex: 1, fontSize: '2rem' }}
        onClick={() => window.location.href = '/list'}
      >
        List
      </button>
      <button
        style={{ flex: 1, fontSize: '2rem' }}
        onClick={() => window.location.href = '/graph'}
      >
        Graph
      </button>
    </div>
  )
}

