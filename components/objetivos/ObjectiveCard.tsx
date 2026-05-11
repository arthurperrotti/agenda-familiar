'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { categoryConfig } from '@/lib/categories'
import { Pencil, Trash2, Circle, Clock, CheckCircle2, PauseCircle } from 'lucide-react'
import type { Objective, ObjectiveStatus } from '@/types'
import { cn } from '@/lib/utils'

interface ObjectiveCardProps {
  objective: Objective
  onEdit: (o: Objective) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: ObjectiveStatus) => void
}

const statusConfig: Record<ObjectiveStatus, { label: string; icon: React.ElementType; color: string; next: ObjectiveStatus }> = {
  nao_iniciado: { label: 'Não iniciado', icon: Circle,        color: 'text-muted-foreground', next: 'em_progresso' },
  em_progresso:  { label: 'Em progresso', icon: Clock,         color: 'text-blue-400',         next: 'concluido'    },
  concluido:     { label: 'Concluído',    icon: CheckCircle2,  color: 'text-green-400',        next: 'nao_iniciado' },
  pausado:       { label: 'Pausado',      icon: PauseCircle,   color: 'text-orange-400',       next: 'em_progresso' },
}

const urgencyBadge: Record<string, string> = {
  alta:  'bg-red-500/15 text-red-400',
  media: 'bg-yellow-500/15 text-yellow-400',
  baixa: 'bg-muted text-muted-foreground',
}

export function ObjectiveCard({ objective, onEdit, onDelete, onStatusChange }: ObjectiveCardProps) {
  const cat = categoryConfig[objective.category]
  const status = statusConfig[objective.status]
  const StatusIcon = status.icon

  const isOverdue = objective.deadline && objective.status !== 'concluido'
    && new Date(objective.deadline) < new Date()

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 space-y-3 hover:border-primary/30 transition-colors"
      style={{ borderLeftWidth: 3, borderLeftColor: cat.darkColor }}
    >
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={cn(
            'font-medium text-sm leading-snug',
            objective.status === 'concluido' && 'line-through text-muted-foreground'
          )}>
            {objective.title}
          </p>
          {objective.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{objective.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(objective)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(objective.id)}
            className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: cat.darkColor + '25', color: cat.darkColor }}>
          {cat.label}
        </span>
        <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium', urgencyBadge[objective.urgency])}>
          {objective.urgency === 'alta' ? 'Urgente' : objective.urgency === 'media' ? 'Média urgência' : 'Baixa urgência'}
        </span>
        {objective.visibility === 'private' && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Privado</span>
        )}
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => onStatusChange(objective.id, status.next)}
          className={cn('flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80', status.color)}
          title={`Avançar para: ${statusConfig[status.next].label}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {status.label}
        </button>

        {objective.deadline && (
          <span className={cn('text-[11px]', isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground')}>
            {isOverdue ? 'Venceu ' : ''}
            {format(new Date(objective.deadline + 'T12:00:00'), "d 'de' MMM", { locale: ptBR })}
          </span>
        )}
      </div>
    </div>
  )
}
