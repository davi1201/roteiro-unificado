import { toast, type ExternalToast } from 'sonner'

type ToastOptions = ExternalToast

/**
 * Hook wrapper sobre o Sonner para uso padronizado no projeto.
 *
 * Uso:
 *   const { success, error, loading, promise } = useToast()
 *   success('Avaliação salva com sucesso!')
 *   error('Erro ao salvar. Tente novamente.')
 *   loading('Salvando avaliação...')
 *   promise(saveAssessment(), { loading: '...', success: '...', error: '...' })
 */
export function useToast() {
  return {
    success: (message: string, options?: ToastOptions) => toast.success(message, options),

    error: (message: string, options?: ToastOptions) => toast.error(message, options),

    loading: (message: string, options?: ToastOptions) => toast.loading(message, options),

    info: (message: string, options?: ToastOptions) => toast.info(message, options),

    warning: (message: string, options?: ToastOptions) => toast.warning(message, options),

    promise: <T>(
      promiseFn: Promise<T>,
      msgs: {
        loading: string
        success: string | ((data: T) => string)
        error: string | ((error: unknown) => string)
      }
    ) => toast.promise(promiseFn, msgs),

    dismiss: (toastId?: string | number) => toast.dismiss(toastId),
  }
}
