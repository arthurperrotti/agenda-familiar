-- =============================================
-- AGENDA FAMILIAR - Schema inicial
-- =============================================

-- Famílias / Grupos
create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz default now()
);

-- Perfis dos usuários (complementa o auth.users do Supabase)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  family_id uuid references public.families(id) on delete set null,
  name text not null,
  avatar_color text not null default '#6C8EF5',
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz default now()
);

-- Eventos da agenda
create table public.events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  description text,
  date date not null,
  start_time time not null,
  end_time time not null,
  category text not null check (category in ('profissional', 'pessoal', 'familiar', 'casal', 'outro')),
  priority text not null default 'importante' check (priority in ('urgente_importante', 'importante', 'urgente', 'baixa')),
  visibility text not null default 'shared' check (visibility in ('shared', 'private')),
  notes text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

-- Participantes dos eventos
create table public.event_participants (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (event_id, user_id)
);

-- Objetivos
create table public.objectives (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  description text,
  category text not null check (category in ('profissional', 'pessoal', 'familiar', 'casal', 'outro')),
  urgency text not null default 'media' check (urgency in ('alta', 'media', 'baixa')),
  deadline date not null,
  status text not null default 'nao_iniciado' check (status in ('nao_iniciado', 'em_progresso', 'concluido', 'pausado')),
  visibility text not null default 'shared' check (visibility in ('shared', 'private')),
  notes text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

-- Participantes dos objetivos
create table public.objective_participants (
  objective_id uuid not null references public.objectives(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (objective_id, user_id)
);

-- =============================================
-- SEGURANÇA: Row Level Security (RLS)
-- =============================================

alter table public.families enable row level security;
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_participants enable row level security;
alter table public.objectives enable row level security;
alter table public.objective_participants enable row level security;

-- Profiles: cada usuário vê apenas quem está na mesma família
create policy "Usuários veem perfis da mesma família"
  on public.profiles for select
  using (
    family_id = (select family_id from public.profiles where id = auth.uid())
  );

create policy "Usuário atualiza apenas o próprio perfil"
  on public.profiles for update
  using (id = auth.uid());

create policy "Usuário insere o próprio perfil"
  on public.profiles for insert
  with check (id = auth.uid());

-- Families: membros veem e atualizam a própria família
create policy "Membros veem a própria família"
  on public.families for select
  using (
    id = (select family_id from public.profiles where id = auth.uid())
  );

create policy "Admin pode atualizar a família"
  on public.families for update
  using (
    id = (select family_id from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Qualquer usuário autenticado pode criar família"
  on public.families for insert
  with check (auth.uid() is not null);

-- Events: membros da mesma família veem eventos shared, ou eventos próprios
create policy "Membros veem eventos da família"
  on public.events for select
  using (
    family_id = (select family_id from public.profiles where id = auth.uid())
    and (visibility = 'shared' or created_by = auth.uid())
  );

create policy "Membros criam eventos na própria família"
  on public.events for insert
  with check (
    family_id = (select family_id from public.profiles where id = auth.uid())
  );

create policy "Criador pode editar o evento"
  on public.events for update
  using (created_by = auth.uid());

create policy "Criador pode excluir o evento"
  on public.events for delete
  using (created_by = auth.uid());

-- Event participants
create policy "Membros veem participantes de eventos da família"
  on public.event_participants for select
  using (
    exists (
      select 1 from public.events e
      join public.profiles p on p.family_id = e.family_id
      where e.id = event_id and p.id = auth.uid()
    )
  );

create policy "Criador gerencia participantes"
  on public.event_participants for insert
  with check (
    exists (
      select 1 from public.events where id = event_id and created_by = auth.uid()
    )
  );

create policy "Criador remove participantes"
  on public.event_participants for delete
  using (
    exists (
      select 1 from public.events where id = event_id and created_by = auth.uid()
    )
  );

-- Objectives: mesma lógica dos eventos
create policy "Membros veem objetivos da família"
  on public.objectives for select
  using (
    family_id = (select family_id from public.profiles where id = auth.uid())
    and (visibility = 'shared' or created_by = auth.uid())
  );

create policy "Membros criam objetivos na própria família"
  on public.objectives for insert
  with check (
    family_id = (select family_id from public.profiles where id = auth.uid())
  );

create policy "Criador pode editar o objetivo"
  on public.objectives for update
  using (created_by = auth.uid());

create policy "Criador pode excluir o objetivo"
  on public.objectives for delete
  using (created_by = auth.uid());

-- Objective participants
create policy "Membros veem participantes de objetivos da família"
  on public.objective_participants for select
  using (
    exists (
      select 1 from public.objectives o
      join public.profiles p on p.family_id = o.family_id
      where o.id = objective_id and p.id = auth.uid()
    )
  );

create policy "Criador gerencia participantes do objetivo"
  on public.objective_participants for insert
  with check (
    exists (
      select 1 from public.objectives where id = objective_id and created_by = auth.uid()
    )
  );

create policy "Criador remove participantes do objetivo"
  on public.objective_participants for delete
  using (
    exists (
      select 1 from public.objectives where id = objective_id and created_by = auth.uid()
    )
  );

-- =============================================
-- Função para criar perfil automaticamente após signup
-- =============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
