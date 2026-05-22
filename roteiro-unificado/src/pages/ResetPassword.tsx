import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import { Button, Input, Card, CardHeader, CardContent, Spinner } from '@/components/ui'

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export function ResetPassword() {
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null)
  const navigate = useNavigate()
  const toast = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasValidSession(session !== null)
    })
  }, [])

  const onSubmit = async (data: ResetPasswordFormData) => {
    const { error } = await supabase.auth.updateUser({ password: data.password })

    if (error) {
      toast.error(error.message || 'Não foi possível redefinir a senha. Tente novamente')
    } else {
      toast.success('Senha redefinida com sucesso')
      navigate('/login')
    }
  }

  return (
    <div className="bg-primary flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-[400px] shadow-md">
        <CardHeader className="flex flex-col items-center gap-1 p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Redefinir senha</h1>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 p-6 pt-0">
          {hasValidSession === null && (
            <div className="flex justify-center py-4">
              <Spinner size="md" className="border-primary border-t-transparent" />
            </div>
          )}

          {hasValidSession === false && (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <p className="text-sm text-gray-700">
                Link expirado. Solicite um novo link de recuperação
              </p>
              <Link
                to="/forgot-password"
                className="text-primary text-sm font-medium hover:underline"
              >
                Solicitar novo link
              </Link>
            </div>
          )}

          {hasValidSession === true && (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-sm text-gray-700">
                  Nova senha
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

              <div className="flex flex-col gap-1">
                <label htmlFor="confirmPassword" className="text-sm text-gray-700">
                  Confirmar nova senha
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  error={!!errors.confirmPassword}
                  errorMessage={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="bg-accent hover:bg-accent-600 w-full text-white"
              >
                {isSubmitting ? 'Redefinindo...' : 'Redefinir senha'}
              </Button>
            </form>
          )}

          <div className="flex justify-center">
            <Link to="/login" className="text-primary text-center text-sm hover:underline">
              Voltar para o login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResetPassword
