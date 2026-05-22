function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#123B66',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <h1 style={{ color: '#ffffff', fontSize: '2rem', marginBottom: '1rem' }}>
        Roteiro Unificado
      </h1>
      <p style={{ color: '#cbd5e1', marginBottom: '2rem' }}>
        Plataforma de Avaliação de Prontidão — Piloto Sinduscon
      </p>
      <button
        style={{
          background: '#F28C28',
          color: '#ffffff',
          border: 'none',
          borderRadius: '0.375rem',
          padding: '0.625rem 1.5rem',
          fontSize: '1rem',
          cursor: 'pointer',
          fontWeight: 600,
        }}
        onClick={() => alert('App iniciado! Fase 1 — Scaffolding em progresso.')}
      >
        Começar Avaliação
      </button>
    </div>
  )
}

export default App
