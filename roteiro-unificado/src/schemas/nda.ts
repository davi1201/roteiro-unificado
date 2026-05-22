import { z } from 'zod'

/**
 * Schema para a aba NDA — Acordo de Não-Divulgação.
 *
 * Esta é a ÚNICA aba do formulário com campo obrigatório (per D-07 do CONTEXT.md).
 * O campo `aceitaTermos` usa `z.literal(true)` para garantir que apenas o valor
 * exato `true` seja aceito. Qualquer outro valor (false, undefined, "true", 1)
 * falha a validação com a mensagem de erro definida via errorMap.
 *
 * O errorMap deve ser visível ao usuário ao tentar submeter sem marcar o checkbox.
 * O campo deve ser inicializado como `false` no defaultValues (não undefined) para
 * garantir que a mensagem de erro apareça corretamente (ver RESEARCH §Pitfall 3).
 *
 * Campos de identificação do representante da construtora (Parte A):
 * todos opcionais — per D-05, a versão React foca no aceite do representante, não
 * nos dados completos do contrato (Parte B da SuaEquipe.IA excluída per D-05).
 *
 * Fonte de verdade: roteiro_unificado_completo_torre360_habilitacoes_nda_piloto_sinduscon_v2.html
 * aba id="nda" — campos simplificados conforme decisões D-05/D-07.
 */

export const ndaSchema = z.object({
  // Campos de identificação do representante — todos opcionais
  nomeRepresentante: z.string().optional(),
  cargo: z.string().optional(),
  cpf: z.string().optional(),

  // Data de aceite — auto-preenchida ao montar o formulário; optional no schema
  // pois zodResolver usa z.input type onde .default() tornaria o campo opcional,
  // causando mismatch com useForm<NdaData>. O componente define o valor em defaultValues.
  dataAceite: z.string().optional(),

  // Campo OBRIGATÓRIO — único campo obrigatório de toda a Phase 7
  // z.literal(true) aceita apenas o valor exato true; false/undefined falham com mensagem definida
  // Zod v4: params usa { message: string } diretamente (errorMap foi renomeado)
  aceitaTermos: z.literal(true, {
    message: 'Você deve aceitar os termos do NDA para continuar',
  }),

  // Observações adicionais — opcional
  observacoes: z.string().optional(),
})

export type NdaData = z.infer<typeof ndaSchema>

/**
 * Número de campos obrigatórios para cálculo de completeness.
 * `aceitaTermos` é o único campo obrigatório nesta aba e em todo o formulário.
 */
export const NDA_REQUIRED_COUNT = 1
