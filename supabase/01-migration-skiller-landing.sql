-- =====================================================================
-- CNDCI · Refonte page de conversion S'KILLER
-- À exécuter UNE fois dans Supabase > SQL Editor
-- =====================================================================

-- 1. Nouveaux champs sur les programmes
alter table public.programmes add column if not exists accroche text;                 -- petit texte de la pilule du hero (ex: "Cohorte 1 · Places limitées")
alter table public.programmes add column if not exists video_presentation_url text;   -- vidéo MP4 affichée dans la fenêtre du hero
alter table public.programmes add column if not exists duree text;                    -- ex: "8 semaines"
alter table public.programmes add column if not exists rythme text;                   -- ex: "Lun · Mer · Ven"
alter table public.programmes add column if not exists paiement_tranches boolean not null default false;

-- 2. Compétences (grille de cartes "Ce que tu sauras faire")
create table if not exists public.competences (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.programmes(id) on delete cascade,
  titre text not null,
  description text,
  ordre int not null default 0,
  created_at timestamptz not null default now()
);

-- 3. Modules (accordéon "Le programme")
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.programmes(id) on delete cascade,
  titre text not null,
  sous_titre text,
  points text,            -- un point par ligne
  ordre int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists competences_programme_idx on public.competences(programme_id, ordre);
create index if not exists modules_programme_idx on public.modules(programme_id, ordre);

-- 4. Sécurité (RLS) : lecture publique, écriture par le propriétaire de l'organisation
alter table public.competences enable row level security;
alter table public.modules enable row level security;

drop policy if exists "competences lecture publique" on public.competences;
create policy "competences lecture publique" on public.competences for select using (true);

drop policy if exists "competences gestion proprietaire" on public.competences;
create policy "competences gestion proprietaire" on public.competences for all
  using (exists (
    select 1 from public.programmes p join public.organisations o on o.id = p.organisation_id
    where p.id = competences.programme_id and o.proprietaire_id = auth.uid()))
  with check (exists (
    select 1 from public.programmes p join public.organisations o on o.id = p.organisation_id
    where p.id = competences.programme_id and o.proprietaire_id = auth.uid()));

drop policy if exists "modules lecture publique" on public.modules;
create policy "modules lecture publique" on public.modules for select using (true);

drop policy if exists "modules gestion proprietaire" on public.modules;
create policy "modules gestion proprietaire" on public.modules for all
  using (exists (
    select 1 from public.programmes p join public.organisations o on o.id = p.organisation_id
    where p.id = modules.programme_id and o.proprietaire_id = auth.uid()))
  with check (exists (
    select 1 from public.programmes p join public.organisations o on o.id = p.organisation_id
    where p.id = modules.programme_id and o.proprietaire_id = auth.uid()));
