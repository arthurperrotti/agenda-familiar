import { CalendarDays } from 'lucide-react'

export default function SemanaPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Agenda da semana</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visualize e organize os compromissos da família
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <CalendarDays className="w-4 h-4" />
          Novo evento
        </button>
      </div>

      {/* Placeholder da grade semanal */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
            <div
              key={dia}
              className="p-3 text-center text-xs font-medium text-muted-foreground border-r border-border last:border-r-0"
            >
              {dia}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center h-96 text-muted-foreground text-sm">
          <div className="text-center space-y-2">
            <CalendarDays className="w-10 h-10 mx-auto opacity-30" />
            <p>A grade da agenda será construída aqui</p>
            <p className="text-xs opacity-60">Em breve os eventos aparecerão nesta visualização</p>
          </div>
        </div>
      </div>
    </div>
  )
}
