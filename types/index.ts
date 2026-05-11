export type Category = 'profissional' | 'pessoal' | 'familiar' | 'casal' | 'outro'
export type Priority = 'urgente_importante' | 'importante' | 'urgente' | 'baixa'
export type Visibility = 'shared' | 'private'
export type ObjectiveStatus = 'nao_iniciado' | 'em_progresso' | 'concluido' | 'pausado'
export type Urgency = 'alta' | 'media' | 'baixa'

export interface User {
  id: string
  family_id: string
  name: string
  email: string
  avatar_color: string
  role: 'admin' | 'member'
  created_at: string
}

export interface Family {
  id: string
  name: string
  plan: 'free' | 'pro'
  created_at: string
}

export interface Event {
  id: string
  family_id: string
  title: string
  description?: string
  date: string
  start_time: string
  end_time: string
  category: Category
  priority: Priority
  visibility: Visibility
  notes?: string
  created_by: string
  created_at: string
  participants?: User[]
}

export interface Objective {
  id: string
  family_id: string
  title: string
  description?: string
  category: Category
  urgency: Urgency
  deadline: string
  status: ObjectiveStatus
  visibility: Visibility
  notes?: string
  created_by: string
  created_at: string
  participants?: User[]
}
