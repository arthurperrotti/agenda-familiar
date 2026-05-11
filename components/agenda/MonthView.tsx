'use client'

import { useMemo } from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, isSameMonth, isSameDay, isToday,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { categoryConfig } from '@/lib/categories'
import type { Event, User } from '@/types'
import { cn } from '@/lib/utils'

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface MonthViewProps {
  currentDate: Date
  events: Event[]
  members: Record<string, User>
  onDayClick: (date: string) => void
  onEventClick: (event: Event) => void
}

export function MonthView({ currentDate, events, members, onDayClick, onEventClick }: MonthViewProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
    const result: Date[] = []
    let d = start
    while (d <= end) {
      result.push(d)
      d = addDays(d, 1)
    }
    return result
  }, [currentDate])

  const eventsByDay = useMemo(() => {
    const map: Record<string, Event[]> = {}
    for (const e of events) {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    }
    return map
  }, [events])

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEK_DAYS.map(day => (
          <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Grade de dias */}
      <div className="flex-1 grid grid-cols-7" style={{ gridAutoRows: '1fr' }}>
        {days.map(day => {
          const key = format(day, 'yyyy-MM-dd')
          const dayEvents = eventsByDay[key] ?? []
          const isCurrentMonth = isSameMonth(day, currentDate)
          const today = isToday(day)

          return (
            <div
              key={key}
              onClick={() => onDayClick(key)}
              className={cn(
                'border-b border-r border-border p-1.5 cursor-pointer transition-colors min-h-[90px]',
                isCurrentMonth ? 'bg-background hover:bg-muted/40' : 'bg-muted/20',
                'last-of-type:border-r-0'
              )}
            >
              {/* Número do dia */}
              <div className="flex justify-end mb-1">
                <span className={cn(
                  'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full',
                  today ? 'bg-primary text-primary-foreground' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {format(day, 'd')}
                </span>
              </div>

              {/* Eventos do dia (máx 3 visíveis) */}
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map(event => {
                  const color = categoryConfig[event.category]?.darkColor ?? '#8B8FA8'
                  const creator = members[event.created_by]
                  const avatarColor = creator?.avatar_color ?? '#8B8FA8'
                  const initial = creator?.name?.charAt(0).toUpperCase() ?? '?'
                  return (
                    <button
                      key={event.id}
                      onClick={e => { e.stopPropagation(); onEventClick(event) }}
                      className="w-full text-left text-[10px] px-1.5 py-0.5 rounded font-medium leading-tight flex items-center gap-1"
                      style={{ backgroundColor: color + '30', color }}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0 flex items-center justify-center text-[7px] font-bold text-white"
                        style={{ backgroundColor: avatarColor }}
                      >{initial}</span>
                      <span className="truncate">{event.start_time.slice(0, 5)} {event.title}</span>
                    </button>
                  )
                })}
                {dayEvents.length > 3 && (
                  <p className="text-[10px] text-muted-foreground pl-1">
                    +{dayEvents.length - 3} mais
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
