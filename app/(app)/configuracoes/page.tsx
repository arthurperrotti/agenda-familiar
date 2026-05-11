'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLOR_PALETTE = [
  { value: '#5B7FD4', label: 'Azul'      },
  { value: '#7B6BA8', label: 'Roxo'      },
  { value: '#5B8A7A', label: 'Verde'     },
  { value: '#A06B8A', label: 'Rosa'      },
  { value: '#D4745B', label: 'Laranja'   },
  { value: '#D45B5B', label: 'Vermelho'  },
  { value: '#4A9A9A', label: 'Turquesa'  },
  { value: '#C4A020', label: 'Dourado'   },
  { value: '#5B9BD4', label: 'Céu'       },
  { value: '#8A8A9A', label: 'Cinza'     },
]

export default function ConfiguracoesPage() {
  const supabase = createClient()
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_PALETTE[0].value)
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, avatar_color')
        .eq('id', user.id)
        .single()

      if (profile) {
        setName(profile.name ?? '')
        setColor(profile.avatar_color ?? COLOR_PALETTE[0].value)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    await supabase
      .from('profiles')
      .update({ name, avatar_color: color })
      .eq('id', userId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground text-sm">
        Carregando...
      </div>
    )
  }

  // Inicial do nome para o preview
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  return (
    <div className="p-6 max-w-md space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Personalize seu perfil na família</p>
      </div>

      {/* Preview do avatar */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md transition-colors"
          style={{ backgroundColor: color }}
        >
          {initial}
        </div>
        <div>
          <p className="font-medium text-sm">{name || 'Seu nome'}</p>
          <p className="text-xs text-muted-foreground">Assim você aparece nos eventos</p>
        </div>
      </div>

      {/* Nome */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Seu nome</Label>
        <Input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex: Arthur"
          maxLength={30}
        />
      </div>

      {/* Paleta de cores */}
      <div className="space-y-3">
        <Label>Sua cor</Label>
        <p className="text-xs text-muted-foreground -mt-1">
          Aparece nos eventos que você criar, para a família identificar quem agendou.
        </p>
        <div className="grid grid-cols-5 gap-3">
          {COLOR_PALETTE.map(c => (
            <button
              key={c.value}
              onClick={() => setColor(c.value)}
              title={c.label}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2',
                color === c.value && 'ring-2 ring-offset-2 ring-foreground'
              )}
              style={{ backgroundColor: c.value }}
            >
              {color === c.value && <Check className="w-4 h-4 text-white drop-shadow" />}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar alterações'}
      </Button>
    </div>
  )
}
