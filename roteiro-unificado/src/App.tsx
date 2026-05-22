import { useToast } from '@/hooks/useToast'

function App() {
  const { success, error, loading, promise } = useToast()

  const simulateAsync = () =>
    new Promise<string>((resolve, reject) => {
      const shouldSucceed = Math.random() > 0.5
      setTimeout(() => {
        if (shouldSucceed) resolve('Avaliação salva!')
        else reject(new Error('Falha na conexão'))
      }, 2000)
    })

  return (
    <div className="bg-primary flex min-h-screen flex-col items-center justify-center gap-4 font-sans">
      <h1 className="text-3xl font-bold text-white">Roteiro Unificado</h1>
      <p className="text-primary-200 mb-4">Teste do sistema de notificações</p>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => success('Dados salvos com sucesso!')}
          className="bg-g5 cursor-pointer rounded-md px-4 py-2 text-white"
        >
          Toast Sucesso
        </button>

        <button
          onClick={() => error('Erro ao salvar. Tente novamente.')}
          className="bg-g1 cursor-pointer rounded-md px-4 py-2 text-white"
        >
          Toast Erro
        </button>

        <button
          onClick={() => loading('Carregando dados...')}
          className="bg-primary-600 cursor-pointer rounded-md px-4 py-2 text-white"
        >
          Toast Loading
        </button>

        <button
          onClick={() =>
            promise(simulateAsync(), {
              loading: 'Salvando avaliação...',
              success: 'Avaliação salva com sucesso!',
              error: 'Erro ao salvar a avaliação.',
            })
          }
          className="bg-accent cursor-pointer rounded-md px-4 py-2 text-white"
        >
          Toast Promise
        </button>
      </div>
    </div>
  )
}

export default App
