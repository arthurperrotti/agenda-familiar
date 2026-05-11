'use client'

import { useMemo } from 'react'
import { format, startOfWeek, addDays, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { categoryConfig } from '@/lib/categories'
import type { Event, User } from '@/types'

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6) // 06h às 22h
const HOUR_HEIGHT = 64

interface WeekViewProps {
  currentDate: Date
  events: Event[]
  members: Record<string, User>
  onSlotClick: (date: string, time: string) => void
  onEventClick: (event: Event) => void
}

export function WeekView({ currentDate, events, members, onSlotClick, onEventClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const eventsByDay = useMemo(() => {
    const map: Record<string, Event[]> = {}
    for (const event of events) {
      const key = event.date
      if (!map[key]) map[key] = []
      map[key].push(event)
    }
    return map
  }, [events])

  function getEventStyle(event: Event) {
    const [startH, startM] = event.start_time.split(':').map(Number)
    const [endH, endM] = event.end_time.split(':').map(Number)
    const top = ((startH - 6) + startM / 60) * HOUR_HEIGHT
    const height = Math.max(((endH - startH) + (endM - startM) / 60) * HOUR_HEIGHT, 24)
    const color = categoryConfig[event.category]?.darkColor ?? '#8B8FA8'
    return { top, height, color }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho dos dias */}
      <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-border sticky top-0 bg-background z-10">
        <div className="border-r border-border" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="p-3 text-center border-r border-border last:border-r-0"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase">
              {format(day, 'EEE', { locale: ptBR })}
            </p>
            <p className={`text-lg font-semibold mt-0.5 w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
              isToday(day) ? 'bg-primary text-primary-foreground' : 'text-foreground'
            }`}>
              {format(day, 'd')}
            </p>
          </div>
        ))}
      </div>

      {/* Grade de horários */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[56px_repeat(7,1fr)] relative">
          {/* Coluna de horas */}
          <div className="border-r border-border">
            {HOURS.map(hour => (
              <div
                key={hour}
                style={{ height: HOUR_HEIGHT }}
                className="border-b border-border flex items-start pt-1 pr-2 justify-end"
              >
                <span className="text-[11px] text-muted-foreground">
                  {String(hour).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Colunas dos dias */}
          {days.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd')
            const dayEvents = eventsByDay[dayKey] ?? []

            return (
              <div key={dayKey} className="relative border-r border-border last:border-r-0">
                {HOURS.map(hour => (
                  <div
                    key={hour}
                    style={{ height: HOUR_HEIGHT }}
                    className="border-b border-border hover:bg-muted/40 cursor-pointer transition-colors"
                    onClick={() => onSlotClick(dayKey, `${String(hour).padStart(2, '0')}:00`)}
                  />
                ))}

                {dayEvents.map(event => {
                  const { top, height, color } = getEventStyle(event)
                  const creator = members[event.created_by]
                  const avatarColor = creator?.avatar_color ?? '#8B8FA8'
                  const initial = creator?.name?.charAt(0).toUpperCase() ?? '?'

                  return (
                    <div
                      key={event.id}
                      style={{ top, height, backgroundColor: color + '33', borderLeftColor: color }}
                      className="absolute inset-x-0.5 rounded-md border-l-[3px] px-2 py-1 cursor-pointer hover:brightness-110 transition-all overflow-hidden z-10"
                      onClick={(e) => { e.stopPropagation(); onEventClick(event) }}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold leading-tight truncate" style={{ color }}>
                            {event.title}
                          </p>
                          {height >= 36 && (
                            <p className="text-[10px] text-muted-foreground">
                              {event.start_time.slice(0, 5)} – {event.end_time.slice(0, 5)}
                            </p>
                          )}
                        </div>
                        {/* Avatar do criador */}
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0 mt-0.5"
                          style={{ backgroundColor: avatarColor }}
                          title={creator?.name ?? 'Desconhecido'}
                        >
                          {initial}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
