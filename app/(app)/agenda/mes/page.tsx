'use client'

import { useState, useEffect, useCallback } from 'react'
import { addMonths, subMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { MonthView } from '@/components/agenda/MonthView'
import { EventModal } from '@/components/agenda/EventModal'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Event } from '@/types'

export default function MesPage() {
  const supabase = createClient()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [defaultDate, setDefaultDate] = useState('')
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [familyId, setFamilyId] = useState('')
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [noFamily, setNoFamily] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single()
      if (profile?.family_id) {
        setFamilyId(profile.family_id)
      } else {
        setNoFamily(true)
      }
      setLoading(false)
    }
    init()
  }, [])

  const loadEvents = useCallback(async () => {
    if (!familyId) return
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('family_id', familyId)
      .order('start_time')
    setEvents((data as Event[]) ?? [])
  }, [familyId])

  useEffect(() => { loadEvents() }, [loadEvents])

  function handleDayClick(date: string) {
    setDefaultDate(date)
    setEditingEvent(null)
    setModalOpen(true)
  }

  function handleEventClick(event: Event) {
    setEditingEvent(event)
    setDefaultDate(event.date)
    setModalOpen(true)
  }

  const monthLabel = format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground text-sm">
        Carregando...
      </div>
    )
  }

  if (noFamily) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground text-sm">
        Perfil sem família vinculada.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentDate(d => subMonths(d, 1))}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h1 className="text-base font-semibold capitalize min-w-40 text-center">{monthLabel}</h1>
          <button
            onClick={() => setCurrentDate(d => addMonths(d, 1))}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => setCurrentDate(new Date())}
          >
            Hoje
          </Button>
        </div>

        <Button
          onClick={() => { setEditingEvent(null); setDefaultDate(format(new Date(), 'yyyy-MM-dd')); setModalOpen(true) }}
          size="sm"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo evento
        </Button>
      </div>

      {/* Calendário mensal */}
      <div className="flex-1 overflow-hidden">
        <MonthView
          currentDate={currentDate}
          events={events}
          onDayClick={handleDayClick}
          onEventClick={handleEventClick}
        />
      </div>

      {/* Modal */}
      {familyId && userId && (
        <EventModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingEvent(null) }}
          onSaved={loadEvents}
          familyId={familyId}
          userId={userId}
          defaultDate={defaultDate}
          event={editingEvent}
        />
      )}
    </div>
  )
}
