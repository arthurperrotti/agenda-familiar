'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { categoryConfig } from '@/lib/categories'
import type { Category, Urgency, ObjectiveStatus, Visibility, Objective } from '@/types'
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

interface ObjectiveModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  familyId: string
  userId: string
  objective?: Objective | null
}

const emptyForm = {
  title: '',
  description: '',
  category: 'familiar' as Category,
  urgency: 'media' as Urgency,
  deadline: '',
  status: 'nao_iniciado' as ObjectiveStatus,
  visibility: 'shared' as Visibility,
  notes: '',
}

const urgencyConfig: Record<Urgency, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
}

const statusConfig: Record<ObjectiveStatus, string> = {
  nao_iniciado: 'Não iniciado',
  em_progresso: 'Em progresso',
  concluido: 'Concluído',
  pausado: 'Pausado',
}

export function ObjectiveModal({ open, onClose, onSaved, familyId, userId, objective }: ObjectiveModalProps) {
  const supabase = createClient()
  const [form, setForm] = useState({ ...emptyForm })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (objective) {
      setForm({
        title: objective.title,
        description: objective.description ?? '',
        category: objective.category,
        urgency: objective.urgency,
        deadline: objective.deadline ?? '',
        status: objective.status,
        visibility: objective.visibility,
        notes: objective.notes ?? '',
      })
    } else {
      setForm({ ...emptyForm })
    }
  }, [objective, open])

  function set(field: string, value: string | null) {
    setForm(prev => ({ ...prev, [field]: value ?? '' }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!form.title) {
      setError('Preencha o título.')
      setLoading(false)
      return
    }

    const payload = {
      family_id: familyId,
      title: form.title,
      description: form.description || null,
      category: form.category,
      urgency: form.urgency,
      deadline: form.deadline || null,
      status: form.status,
      visibility: form.visibility,
      notes: form.notes || null,
      created_by: userId,
    }

    if (objective) {
      const { error: err } = await supabase
        .from('objectives')
        .update(payload)
        .eq('id', objective.id)
      if (err) { setError('Erro ao atualizar.'); setLoading(false); return }
    } else {
      const { error: err } = await supabase
        .from('objectives')
        .insert(payload)
      if (err) { setError('Erro ao salvar.'); setLoading(false); return }
    }

    setLoading(false)
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
          <DialogTitle>{objective ? 'Editar objetivo' : 'Novo objetivo'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="obj-title">Título *</Label>
            <Input
              id="obj-title"
              placeholder="Ex: Viajar para Portugal"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
            />
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
              <Label>Urgência</Label>
              <Select value={form.urgency} onValueChange={v => set('urgency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(urgencyConfig).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="obj-deadline">Prazo</Label>
              <Input
                id="obj-deadline"
                type="date"
                value={form.deadline}
                onChange={e => set('deadline', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, label]) => (
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
            <Label htmlFor="obj-description">Descrição</Label>
            <Textarea
              id="obj-description"
              placeholder="Detalhes do objetivo..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={2}
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : objective ? 'Salvar alterações' : 'Criar objetivo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
