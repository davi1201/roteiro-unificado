import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/features/auth/useAuth'
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
import { changePasswordSchema, type ChangePasswordFormData } from '@/schemas/changePassword'

interface ChangePasswordModalProps {
  open: boolean
  onClose: () => void
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
  })

  const { user } = useAuth()
  const toast = useToast()

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordFormData) => {
      // Opção B: re-autenticar antes de atualizar (T-13-05 mitigado)
      if (user?.email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: data.currentPassword,
        })
        if (signInError) {
          throw new Error('wrong_current_password')
        }
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      })
      if (updateError) {
        throw new Error('update_failed')
      }
    },
    onSuccess: () => {
      toast.success('Senha alterada com sucesso')
      reset()
      onClose()
    },
    onError: (err: Error) => {
      if (err.message === 'wrong_current_password') {
        toast.error('Senha atual incorreta.')
      } else {
        toast.error('Não foi possível alterar a senha. Tente novamente.')
      }
    },
  })

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Alterar senha</DialogTitle>
        <DialogDescription>Insira sua senha atual e a nova senha desejada.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit((data) => changePasswordMutation.mutate(data))} noValidate>
        <DialogContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="current-password" className="text-sm text-gray-700">
              Senha atual
            </label>
            <Input
              id="current-password"
              type="password"
              error={!!errors.currentPassword}
              errorMessage={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="new-password" className="text-sm text-gray-700">
              Nova senha
            </label>
            <Input
              id="new-password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              error={!!errors.newPassword}
              errorMessage={errors.newPassword?.message}
              {...register('newPassword')}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirm-password" className="text-sm text-gray-700">
              Confirmar nova senha
            </label>
            <Input
              id="confirm-password"
              type="password"
              error={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword?.message}
              {...register('confirmPassword')}
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
            disabled={changePasswordMutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={changePasswordMutation.isPending}>
            {changePasswordMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
