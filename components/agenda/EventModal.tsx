'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { categoryConfig, priorityConfig } from '@/lib/categories'
import type { Category, Priority, Event } from '@/types'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

interface EventModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  familyId: string
  userId: string
  defaultDate?: string
  event?: Event | null
}

const emptyForm = {
  title: '',
  description: '',
  date: '',
  start_time: '09:00',
  end_time: '10:00',
  category: 'familiar' as Category,
  priority: 'importante' as Priority,
  notes: '',
  visibility: 'shared' as 'shared' | 'private',
}

export function EventModal({ open, onClose, onSaved, familyId, userId, defaultDate, event }: EventModalProps) {
  const supabase = createClient()
  const [form, setForm] = useState({ ...emptyForm, date: defaultDate ?? '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title,
        description: event.description ?? '',
        date: event.date,
        start_time: event.start_time.slice(0, 5),
        end_time: event.end_time.slice(0, 5),
        category: event.category,
        priority: event.priority,
        notes: event.notes ?? '',
        visibility: event.visibility,
      })
    } else {
      setForm({ ...emptyForm, date: defaultDate ?? '' })
    }
  }, [event, defaultDate, open])

  function set(field: string, value: string | null) {
    setForm(prev => ({ ...prev, [field]: value ?? '' }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!form.title || !form.date || !form.start_time || !form.end_time) {
      setError('Preencha título, data e horários.')
      setLoading(false)
      return
    }

    const payload = {
      family_id: familyId,
      title: form.title,
      description: form.description || null,
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      category: form.category,
      priority: form.priority,
      visibility: form.visibility,
      notes: form.notes || null,
      created_by: userId,
    }

    if (event) {
      const { error: err } = await supabase
        .from('events')
        .update(payload)
        .eq('id', event.id)
      if (err) { setError('Erro ao atualizar o evento.'); setLoading(false); return }
    } else {
      const { data: newEvent, error: err } = await supabase
        .from('events')
        .insert(payload)
        .select()
        .single()
      if (err || !newEvent) { setError('Erro ao salvar o evento.'); setLoading(false); return }
      await supabase.from('event_participants').insert({ event_id: newEvent.id, user_id: userId })
    }

    setLoading(false)
    onSaved()
    onClose()
  }

  async function handleDelete() {
    if (!event) return
    setDeleting(true)
    await supabase.from('events').delete().eq('id', event.id)
    setDeleting(false)
    onSaved()
    onClose()
  }

  function handleClose() {
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{event ? 'Editar evento' : 'Novo evento'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: Consulta médica"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="start_time">Início *</Label>
              <Input
                id="start_time"
                type="time"
                value={form.start_time}
                onChange={e => set('start_time', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end_time">Fim *</Label>
              <Input
                id="end_time"
                type="time"
                value={form.end_time}
                onChange={e => set('end_time', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={v => set('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <Select value={form.priority} onValueChange={v => set('priority', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityConfig).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Visibilidade</Label>
            <Select value={form.visibility} onValueChange={v => set('visibility', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="shared">Compartilhado com a família</SelectItem>
                <SelectItem value="private">Apenas eu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Detalhes do evento..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={2}
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <DialogFooter className="gap-2">
            {event && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="mr-auto"
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : event ? 'Salvar alterações' : 'Salvar evento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
