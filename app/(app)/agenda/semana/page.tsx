'use client'

import { useState, useEffect, useCallback } from 'react'
import { addWeeks, subWeeks, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { WeekView } from '@/components/agenda/WeekView'
import { EventModal } from '@/components/agenda/EventModal'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Event } from '@/types'

export default function SemanaPage() {
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

  function handleSlotClick(date: string) {
    setDefaultDate(date)
    setEditingEvent(null)
    setModalOpen(true)
  }

  function handleEventClick(event: Event) {
    setEditingEvent(event)
    setDefaultDate(event.date)
    setModalOpen(true)
  }

  function handleNewEvent() {
    setDefaultDate(format(new Date(), 'yyyy-MM-dd'))
    setEditingEvent(null)
    setModalOpen(true)
  }

  const weekLabel = format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground text-sm">
        Carregando...
      </div>
    )
  }

  if (noFamily) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-sm">Perfil sem família vinculada.</p>
          <p className="text-xs text-muted-foreground">Verifique o banco de dados ou faça o onboarding.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pl-14 md:pl-6 pr-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentDate(d => subWeeks(d, 1))}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h1 className="text-base font-semibold capitalize min-w-40 text-center">{weekLabel}</h1>
          <button
            onClick={() => setCurrentDate(d => addWeeks(d, 1))}
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

        <Button onClick={handleNewEvent} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Novo evento
        </Button>
      </div>

      {/* Grade semanal */}
      <div className="flex-1 overflow-hidden">
        <WeekView
          currentDate={currentDate}
          events={events}
          onSlotClick={handleSlotClick}
          onEventClick={handleEventClick}
        />
      </div>

      {/* Modal de criação/edição */}
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
