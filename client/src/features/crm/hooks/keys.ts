// Everything under ['admin'] is dropped when the admin logs in again.
export const crmKeys = {
  all: ['admin', 'crm'] as const,
  list: (view: string, q: string) => ['admin', 'crm', 'clients', view, q] as const,
  lists: ['admin', 'crm', 'clients'] as const,
  summary: ['admin', 'crm', 'summary'] as const,
  client: (id: string) => ['admin', 'crm', 'client', id] as const,
  doc: (id: string) => ['admin', 'crm', 'doc', id] as const,
}
