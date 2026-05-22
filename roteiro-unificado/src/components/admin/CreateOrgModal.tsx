import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
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
import { createOrgSchema, type CreateOrgFormData } from '@/schemas/createOrg'

interface CreateOrgModalProps {
  open: boolean
  onClose: () => void
}

export function CreateOrgModal({ open, onClose }: CreateOrgModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateOrgFormData>({
    resolver: zodResolver(createOrgSchema),
    mode: 'onBlur',
  })

  const queryClient = useQueryClient()
  const toast = useToast()

  const createOrgMutation = useMutation({
    mutationFn: async (data: CreateOrgFormData) => {
      const payload: Database['public']['Tables']['orgs']['Insert'] = {
        name: data.name,
        cnpj: data.cnpj,
        active: true,
      }
      const { error } = await supabase.from('orgs').insert(payload as never)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgs'] })
      toast.success('Organização criada com sucesso')
      reset()
      onClose()
    },
    onError: () => {
      toast.error('Erro ao criar organização. Tente novamente.')
    },
  })

  const onSubmit = (data: CreateOrgFormData) => createOrgMutation.mutate(data)

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Nova organização</DialogTitle>
        <DialogDescription>
          Cadastre uma nova construtora no piloto. Você poderá adicionar membros depois.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="org-name" className="text-sm text-gray-700">
              Nome da organização
            </label>
            <Input
              id="org-name"
              type="text"
              placeholder="Ex: Construtora Silva Ltda."
              error={!!errors.name}
              errorMessage={errors.name?.message}
              autoFocus
              {...register('name')}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="org-cnpj" className="text-sm text-gray-700">
              CNPJ
            </label>
            <Input
              id="org-cnpj"
              type="text"
              inputMode="numeric"
              placeholder="00000000000000"
              maxLength={14}
              error={!!errors.cnpj}
              errorMessage={errors.cnpj?.message}
              {...register('cnpj')}
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
            disabled={createOrgMutation.isPending}
          >
            Descartar
          </Button>
          <Button type="submit" variant="primary" isLoading={createOrgMutation.isPending}>
            {createOrgMutation.isPending ? 'Criando...' : 'Criar Organização'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
