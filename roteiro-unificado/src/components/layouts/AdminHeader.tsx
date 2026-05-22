import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { Button } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

export function AdminHeader() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch {
      toast.error('Erro ao encerrar sessão')
    }
  }

  return (
    <header className="bg-primary border-primary-800 fixed top-0 right-0 left-60 z-20 flex h-14 items-center justify-between border-b px-6">
      {/* Left side — empty (logo/brand lives in sidebar) */}
      <div />

      {/* Right side — admin email + logout button */}
      <div className="flex items-center gap-4 text-white">
        <span className="text-sm">{user?.email}</span>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-primary-800 text-white"
          onClick={handleSignOut}
        >
          Encerrar sessão
        </Button>
      </div>
    </header>
  )
}
