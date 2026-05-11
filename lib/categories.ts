import type { Category, Priority } from '@/types'

export const categoryConfig: Record<Category, { label: string; color: string; darkColor: string }> = {
  profissional: { label: 'Profissional', color: '#6B5A9A', darkColor: '#7B6BA8' },
  pessoal:      { label: 'Pessoal',      color: '#A06040', darkColor: '#B07A5A' },
  familiar:     { label: 'Familiar',     color: '#4A8A72', darkColor: '#5B8A7A' },
  casal:        { label: 'Casal',        color: '#9A5A7A', darkColor: '#A06B8A' },
  outro:        { label: 'Outro',        color: '#7A7A8A', darkColor: '#8B8FA8' },
}

export const priorityConfig: Record<Priority, { label: string; badge: string }> = {
  urgente_importante: { label: 'Urgente e importante', badge: 'bg-red-500/20 text-red-400' },
  importante:         { label: 'Importante',           badge: 'bg-blue-500/20 text-blue-400' },
  urgente:            { label: 'Urgente',               badge: 'bg-orange-500/20 text-orange-400' },
  baixa:              { label: 'Baixa prioridade',      badge: 'bg-muted text-muted-foreground' },
}
