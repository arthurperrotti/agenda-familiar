'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [familyName, setFamilyName] = useState('')
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Criar a família
    const { data: family, error: familyError } = await supabase
      .from('families')
      .insert({ name: familyName })
      .select()
      .single()

    if (familyError || !family) {
      setError('Erro ao criar a família. Tente novamente.')
      setLoading(false)
      return
    }

    // Atualizar o perfil do usuário com nome e família
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ name: userName, family_id: family.id, role: 'admin' })
      .eq('id', user.id)

    if (profileError) {
      setError('Erro ao salvar seu perfil. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/agenda/semana')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">

        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
            <Users className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo!</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Vamos configurar sua família antes de começar
            </p>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Criar sua família</CardTitle>
            <CardDescription>
              Você será o administrador e poderá convidar outras pessoas depois.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Seu nome</Label>
                <Input
                  id="userName"
                  placeholder="Ex: Arthur"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="familyName">Nome da família</Label>
                <Input
                  id="familyName"
                  placeholder="Ex: Família Perrotti"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-destructive text-sm">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Criando...' : 'Criar e entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
