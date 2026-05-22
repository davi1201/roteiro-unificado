import { useParams } from 'react-router-dom'

export function OrgDetail() {
  const { orgId } = useParams<{ orgId: string }>()

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Detalhe da organização</h1>
      <p className="mt-2 text-sm text-gray-500">orgId: {orgId}</p>
    </div>
  )
}
