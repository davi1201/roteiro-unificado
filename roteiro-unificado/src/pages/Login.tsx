import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/useAuth'
import { useToast } from '@/hooks/useToast'
import { Button, Input, Card, CardHeader, CardContent, Spinner } from '@/components/ui'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'O email é obrigatório')
    .email('Insira um email válido'),
  password: z.string().min(1, 'A senha é obrigatória'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function Login() {
  const { isLoading } = useAuth()
  const toast = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <Spinner size="lg" className="border-white border-t-transparent" />
      </div>
    )
  }

  const onSubmit = async (data: LoginFormData) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      toast.error('Email ou senha inválidos')
    }
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <Card className="w-full max-w-[400px] shadow-md">
        <CardHeader className="flex flex-col items-center gap-1 text-center p-6">
          <h1 className="text-2xl font-bold text-gray-900">Roteiro Unificado</h1>
          <p className="text-sm text-gray-500">Piloto Sinduscon</p>
        </CardHeader>

        <CardContent className="p-6 pt-0 flex flex-col gap-4">
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

            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline self-end"
            >
              Esqueci minha senha
            </Link>

            <Button
              type="submit"
              isLoading={isSubmitting}
              className="bg-accent hover:bg-accent-600 text-white w-full"
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
