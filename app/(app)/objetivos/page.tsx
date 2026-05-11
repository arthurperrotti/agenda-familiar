'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ObjectiveModal } from '@/components/objetivos/ObjectiveModal'
import { ObjectiveCard } from '@/components/objetivos/ObjectiveCard'
import { Plus, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Objective, ObjectiveStatus } from '@/types'

const tabs: { value: ObjectiveStatus | 'todos'; label: string }[] = [
  { value: 'todos',        label: 'Todos'         },
  { value: 'nao_iniciado', label: 'Não iniciados' },
  { value: 'em_progresso', label: 'Em progresso'  },
  { value: 'concluido',    label: 'Concluídos'    },
  { value: 'pausado',      label: 'Pausados'      },
]

export default function ObjetivosPage() {
  const supabase = createClient()
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Objective | null>(null)
  const [activeTab, setActiveTab] = useState<ObjectiveStatus | 'todos'>('todos')
  const [familyId, setFamilyId] = useState('')
  const [userId, setUserId] = useState('')
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
        setLoading(false)
      }
    }
    init()
  }, [])

  const loadObjectives = useCallback(async () => {
    if (!familyId) return
    const { data } = await supabase
      .from('objectives')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })
    setObjectives((data as Objective[]) ?? [])
    setLoading(false)
  }, [familyId])

  useEffect(() => { loadObjectives() }, [loadObjectives])

  async function handleDelete(id: string) {
    await supabase.from('objectives').delete().eq('id', id)
    setObjectives(prev => prev.filter(o => o.id !== id))
  }

  async function handleStatusChange(id: string, status: ObjectiveStatus) {
    await supabase.from('objectives').update({ status }).eq('id', id)
    setObjectives(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  function handleEdit(objective: Objective) {
    setEditing(objective)
    setModalOpen(true)
  }

  function handleNew() {
    setEditing(null)
    setModalOpen(true)
  }

  const filtered = activeTab === 'todos'
    ? objectives
    : objectives.filter(o => o.status === activeTab)

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
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Objetivos</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {objectives.length} objetivo{objectives.length !== 1 ? 's' : ''} no total
          </p>
        </div>
        <Button onClick={handleNew} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Novo objetivo
        </Button>
      </div>

      {/* Abas de filtro */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.value
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
            {tab.value !== 'todos' && (
              <span className="ml-1.5 text-xs text-muted-foreground">
                ({objectives.filter(o => o.status === tab.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grade de objetivos */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm gap-3">
          <Target className="w-10 h-10 opacity-20" />
          <p>{activeTab === 'todos' ? 'Nenhum objetivo ainda. Crie o primeiro!' : 'Nenhum objetivo nesta categoria.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(objective => (
            <ObjectiveCard
              key={objective.id}
              objective={objective}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {familyId && userId && (
        <ObjectiveModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditing(null) }}
          onSaved={loadObjectives}
          familyId={familyId}
          userId={userId}
          objective={editing}
        />
      )}
    </div>
  )
}
