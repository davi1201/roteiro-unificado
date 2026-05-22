import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/useAuth'
import { useToast } from '@/hooks/useToast'
import { Button, Input, Card, CardHeader, CardContent, Spinner } from '@/components/ui'

const loginSchema = z.object({
  email: z.string().min(1, 'O email é obrigatório').email('Insira um email válido'),
  password: z.string().min(1, 'A senha é obrigatória'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function Login() {
  const { session, role, orgId, isLoading } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  // Redirect already-authenticated users and handle post-login navigation.
  // This covers two cases:
  // 1. User visits /login while already authenticated (mount redirect)
  // 2. Post-login: onAuthStateChange fires asynchronously; when role/orgId
  //    settle in context, this effect triggers and navigates to the correct route.
  useEffect(() => {
    if (isLoading || !session) return

    if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true })
    } else if (role === 'company' && orgId) {
      navigate(`/form/${orgId}`, { replace: true })
    } else if (role !== null) {
      // Authenticated but org_members record incomplete or unknown role
      toast.error('Configuração incompleta. Contate o suporte.')
    }
  }, [session, role, orgId, isLoading, navigate, toast])

  const onSubmit = async (data: LoginFormData) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      toast.error('Email ou senha inválidos')
    }
    // On success: onAuthStateChange updates session/role/orgId in AuthProvider,
    // which triggers the useEffect above to perform the role-based redirect.
  }

  if (isLoading) {
    return (
      <div className="bg-primary flex min-h-screen items-center justify-center">
        <Spinner size="lg" className="border-white border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="bg-primary flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-[400px] shadow-md">
        <CardHeader className="flex flex-col items-center gap-1 p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Roteiro Unificado</h1>
          <p className="text-sm text-gray-500">Piloto Sinduscon</p>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 p-6 pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                error={!!errors.email}
                errorMessage={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm text-gray-700">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                error={!!errors.password}
                errorMessage={errors.password?.message}
                {...register('password')}
              />
            </div>

            <Link to="/forgot-password" className="text-primary self-end text-sm hover:underline">
              Esqueci minha senha
            </Link>

            <Button
              type="submit"
              isLoading={isSubmitting}
              className="bg-accent hover:bg-accent-600 w-full text-white"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
