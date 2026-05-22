import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Badge,
  Spinner,
  Skeleton,
} from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { useState } from 'react'

export function DesignSystem() {
  const { success, error, loading, promise } = useToast()
  const [inputValue, setInputValue] = useState('')
  const [hasError, setHasError] = useState(false)

  const simulateAsync = () =>
    new Promise<string>((resolve) => setTimeout(() => resolve('OK'), 1500))

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="bg-primary rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold">Design System — Roteiro Unificado</h1>
          <p className="text-primary-200 mt-2">Paleta Azul/Laranja · Escala G1–G5</p>
        </header>

        {/* Botões */}
        <section className="space-y-4">
          <h2 className="text-primary text-xl font-semibold">Button</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button isLoading>Salvando...</Button>
            <Button disabled>Desabilitado</Button>
          </div>
        </section>

        {/* Badges G1-G5 */}
        <section className="space-y-4">
          <h2 className="text-primary text-xl font-semibold">Badge — Escala de Prontidão</h2>
          <div className="flex flex-wrap gap-3">
            <Badge grade="G1" />
            <Badge grade="G2" />
            <Badge grade="G3" />
            <Badge grade="G4" />
            <Badge grade="G5" />
          </div>
        </section>

        {/* Inputs */}
        <section className="space-y-4">
          <h2 className="text-primary text-xl font-semibold">Input / Textarea / Select</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nome da Empresa</label>
              <Input
                placeholder="Ex: Construtora Exemplo Ltda"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">CNPJ (com erro)</label>
              <Input
                placeholder="00.000.000/0000-00"
                error={hasError}
                errorMessage="CNPJ inválido"
                onFocus={() => setHasError(true)}
                onBlur={() => setHasError(false)}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Observações</label>
            <Textarea placeholder="Descreva a situação atual..." rows={3} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Nível de Prontidão</label>
            <Select
              placeholder="Selecione..."
              options={[
                { value: 'G1', label: 'G1 — Crítico' },
                { value: 'G2', label: 'G2 — Baixo' },
                { value: 'G3', label: 'G3 — Médio' },
                { value: 'G4', label: 'G4 — Bom' },
                { value: 'G5', label: 'G5 — Excelente' },
              ]}
            />
          </div>
        </section>

        {/* Card */}
        <section className="space-y-4">
          <h2 className="text-primary text-xl font-semibold">Card</h2>
          <Card className="max-w-sm">
            <CardHeader>
              <h3 className="font-semibold">Construtora Exemplo</h3>
              <p className="text-sm text-gray-500">Última avaliação: 15/01/2025</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge grade="G4" />
                <span className="text-sm text-gray-600">Prontidão atual</span>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Ver detalhes</Button>
              <Button size="sm" variant="ghost">
                Histórico
              </Button>
            </CardFooter>
          </Card>
        </section>

        {/* Spinner e Skeleton */}
        <section className="space-y-4">
          <h2 className="text-primary text-xl font-semibold">Spinner / Skeleton</h2>
          <div className="flex items-center gap-6">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
          <div className="max-w-sm space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </section>

        {/* Toasts */}
        <section className="space-y-4">
          <h2 className="text-primary text-xl font-semibold">Toast (Sonner)</h2>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => success('Avaliação salva com sucesso!')}>Sucesso</Button>
            <Button variant="danger" onClick={() => error('Erro ao conectar com o servidor.')}>
              Erro
            </Button>
            <Button variant="secondary" onClick={() => loading('Sincronizando dados...')}>
              Loading
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                promise(simulateAsync(), {
                  loading: 'Salvando...',
                  success: 'Salvo com sucesso!',
                  error: 'Erro ao salvar',
                })
              }
            >
              Promise
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
