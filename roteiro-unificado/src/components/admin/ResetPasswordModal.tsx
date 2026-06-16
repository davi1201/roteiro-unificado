import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import {
  Button,
  Input,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from '@/components/ui'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/schemas/resetPassword'

interface ResetPasswordModalProps {
  userId: string
  memberEmail?: string
  open: boolean
  onClose: () => void
}

export function ResetPasswordModal({
  userId,
  memberEmail,
  open,
  onClose,
}: ResetPasswordModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  })

  const toast = useToast()

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      const { data: fnData, error: fnError } = await supabase.functions.invoke<{
        success: boolean
      }>('reset-user-password', {
        body: { user_id: userId, password: data.password },
      })
      if (fnError || !fnData?.success) {
        throw new Error('reset_failed')
      }
    },
    onSuccess: () => {
      toast.success('Senha redefinida com sucesso')
      reset()
      onClose()
    },
    onError: () => {
      toast.error('Não foi possível redefinir a senha. Tente novamente.')
    },
  })

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Redefinir senha</DialogTitle>
        <DialogDescription>
          {memberEmail ? `Nova senha para ${memberEmail}.` : 'Digite a nova senha para o usuário.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit((data) => resetPasswordMutation.mutate(data))} noValidate>
        <DialogContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="reset-password" className="text-sm text-gray-700">
              Nova senha
            </label>
            <Input
              id="reset-password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              error={!!errors.password}
              errorMessage={errors.password?.message}
              autoFocus
              {...register('password')}
            />
          </div>
        </DialogContent>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              reset()
              onClose()
            }}
            disabled={resetPasswordMutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={resetPasswordMutation.isPending}>
            {resetPasswordMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
