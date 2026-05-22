import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { addMemberSchema, type AddMemberFormData } from '@/schemas/addMember'

interface AddMemberModalProps {
  orgId: string
  open: boolean
  onClose: () => void
}

export function AddMemberModal({ orgId, open, onClose }: AddMemberModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
    mode: 'onBlur',
  })

  const queryClient = useQueryClient()
  const toast = useToast()

  const addMemberMutation = useMutation({
    mutationFn: async (data: AddMemberFormData) => {
      // Step 1 (D-01): invocar Edge Function — service_role isolada no Deno runtime
      const { data: fnData, error: fnError } = await supabase.functions.invoke<{
        user_id: string
      }>('create-user', {
        body: { email: data.email, password: data.password, org_id: orgId },
      })
      if (fnError || !fnData?.user_id) {
        // Mensagem especifica se email ja existe (Edge Function devolve 400 com error.message do supabase auth)
        const message = fnError?.message ?? ''
        if (message.toLowerCase().includes('already') || message.toLowerCase().includes('exists')) {
          throw new Error('email_exists')
        }
        throw new Error('edge_function_failed')
      }

      // Step 2 (D-03): INSERT em org_members com user_id retornado
      // Cast necessario — schema manual nao resolve corretamente o tipo Insert via supabase-js inferencia
      const { error: memberError } = await supabase.from('org_members').insert({
        org_id: orgId,
        user_id: fnData.user_id,
        role: 'company' as const,
      } as unknown as never)
      if (memberError) throw new Error('org_members_insert_failed')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org_members', orgId] })
      queryClient.invalidateQueries({ queryKey: ['orgs'] }) // member_count desatualiza
      toast.success('Membro adicionado com sucesso')
      reset()
      onClose()
    },
    onError: (err: Error) => {
      if (err.message === 'email_exists') {
        toast.error('Este email já está cadastrado no sistema.')
      } else {
        toast.error('Não foi possível adicionar o membro. Verifique o email.')
      }
    },
  })

  const onSubmit = (data: AddMemberFormData) => addMemberMutation.mutate(data)

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Convidar membro</DialogTitle>
        <DialogDescription>
          O usuário poderá fazer login imediatamente com o email e a senha temporária definidos
          abaixo.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="member-email" className="text-sm text-gray-700">
              Email do usuário
            </label>
            <Input
              id="member-email"
              type="email"
              placeholder="usuario@construtora.com"
              error={!!errors.email}
              errorMessage={errors.email?.message}
              autoFocus
              {...register('email')}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="member-password" className="text-sm text-gray-700">
              Senha temporária
            </label>
            <Input
              id="member-password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              error={!!errors.password}
              errorMessage={errors.password?.message}
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
            disabled={addMemberMutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={addMemberMutation.isPending}>
            {addMemberMutation.isPending ? 'Adicionando...' : 'Adicionar Membro'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
