import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import { Button, Input, Card, CardHeader, CardContent } from '@/components/ui'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'O email é obrigatório').email('Insira um email válido'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPassword() {
  const toast = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error === null) {
      toast.success('Link enviado. Verifique sua caixa de entrada')
    } else {
      toast.error('Não foi possível enviar o link. Tente novamente')
    }
  }

  return (
    <div className="bg-primary flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-[400px] shadow-md">
        <CardHeader className="flex flex-col items-center gap-1 p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Recuperar senha</h1>
          <p className="text-sm text-gray-500">
            Insira seu email e enviaremos um link para redefinir sua senha
          </p>
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

            <Button
              type="submit"
              isLoading={isSubmitting}
              className="bg-accent hover:bg-accent-600 w-full text-white"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar link'}
            </Button>
          </form>

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

export default ForgotPassword
