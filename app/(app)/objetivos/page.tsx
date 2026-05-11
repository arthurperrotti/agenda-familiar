import { Target } from 'lucide-react'

export default function ObjetivosPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Objetivos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Acompanhe as metas da família
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Target className="w-4 h-4" />
          Novo objetivo
        </button>
      </div>

      <div className="flex items-center justify-center h-64 rounded-xl border border-border bg-card text-muted-foreground text-sm">
        <div className="text-center space-y-2">
          <Target className="w-10 h-10 mx-auto opacity-30" />
          <p>Seus objetivos aparecerão aqui</p>
        </div>
      </div>
    </div>
  )
}
