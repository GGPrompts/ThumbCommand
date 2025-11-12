export default function SimpleTest() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #18181b, #000)',
      color: 'white',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          color: '#22c55e'
        }}>
          ✅ React is Working!
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
          ThumbCommand is loading correctly
        </p>
        <div style={{
          background: 'rgba(34, 197, 94, 0.2)',
          border: '2px solid #22c55e',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p>If you can see this, it means:</p>
          <ul style={{ textAlign: 'left', marginTop: '10px' }}>
            <li>✅ Server is running</li>
            <li>✅ React is working</li>
            <li>✅ Vite is compiling</li>
            <li>✅ JavaScript is executing</li>
          </ul>
        </div>
        <button
          onClick={() => window.location.href = '/dashboard'}
          style={{
            background: '#22c55e',
            color: 'black',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Try Full App
        </button>
        <button
          onClick={() => console.log('Console test - check Eruda')}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Test Console
        </button>
      </div>
    </div>
  )
}
