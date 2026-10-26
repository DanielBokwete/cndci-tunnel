-- CNDCI · S'KILLER AI Cohorte 1 · script tout-en-un (migration + page + contenu)
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

-- Crée la page S'KILLER AI · Cohorte 1 (si elle n'existe pas encore)
insert into public.programmes (organisation_id, secteur_id, titre, slug, type, image_header_url, image_card_url, image_affiche_url,
  pays, indicatif, ville, lien_inscription, afficher_certification, actif, promo_start_at)
select organisation_id, secteur_id, 'S''KILLER AI', 'skiller-ai', 'formation', image_header_url, image_card_url, image_affiche_url,
  pays, indicatif, ville, lien_inscription, true, true, now()
from public.programmes
where slug = 'coder-avec-l-ia-tout-en-gardant-le-controle'
  and not exists (select 1 from public.programmes where slug = 'skiller-ai');
-- =====================================================================
-- CNDCI · Contenu de la page S'KILLER AI · Cohorte 1
-- 1) Crée d'abord le programme dans l'admin (titre, secteur S'KILLER AI, images)
-- 2) Remplace le slug ci-dessous par celui du programme
-- 3) Exécute ce script dans Supabase > SQL Editor (il peut être relancé)
-- =====================================================================
do $$
declare
  v_slug text := 'skiller-ai';
  v_id uuid;
begin
  select id into v_id from public.programmes where slug = v_slug;
  if v_id is null then
    raise exception 'Programme introuvable pour le slug %', v_slug;
  end if;

  update public.programmes set
    type = 'formation',
    description = 'En 8 semaines, deviens capable de créer ton projet de A à Z avec l''IA : contenus, automatisations, agents IA et applications. Seul, sans dépendre d''une équipe.',
    accroche = 'Cohorte 1 · Places limitées',
    duree = '8 semaines',
    rythme = 'Lun · Mer · Ven',
    date_debut = '2026-11-16',
    date_fin = '2027-01-08',
    prix = 160,
    frais_inscription = 10,
    lieu = 'Silikin Village · Concession COTEX, N° 63, avenue Colonel Mondjiba, Gombe',
    ville = 'Kinshasa',
    paiement_tranches = true,
    afficher_certification = true,
    public_cible = E'Entrepreneur\nÉtudiant\nFreelance\nCommunity manager\nPorteur de projet\nSalarié en reconversion',
    contenu = 'En 2026, plus besoin d''une équipe de 10 personnes pour bâtir un projet à la hauteur des grandes startups. S''KILLER AI te donne les compétences et les outils pour tout faire toi-même : comprendre l''IA, la piloter, créer tes contenus, automatiser ton travail, déployer des agents et lancer tes applications.'
  where id = v_id;

  -- Créneaux (chaque participant choisit une vacation)
  delete from public.vacations where programme_id = v_id;
  insert into public.vacations (programme_id, nom, heure_debut, heure_fin, ordre) values
    (v_id, 'Matinée',     '09:30', '11:30', 0),
    (v_id, 'Après-midi',  '13:30', '15:30', 1),
    (v_id, 'Soirée',      '17:30', '19:30', 2);

  -- Compétences
  delete from public.competences where programme_id = v_id;
  insert into public.competences (programme_id, titre, description, ordre) values
    (v_id, 'Maîtriser les meilleurs outils IA', 'Comprendre les LLM et choisir le bon outil pour chaque besoin : texte, image, vidéo, code.', 0),
    (v_id, 'Parler à l''IA comme un pro', 'Le prompt engineering pour obtenir exactement le résultat voulu, du premier coup.', 1),
    (v_id, 'Créer tes contenus en autonomie', 'Affiches, vidéos publicitaires et motion design pour ta marque, sans graphiste.', 2),
    (v_id, 'Automatiser tes tâches', 'Des workflows avec Claude et n8n qui travaillent pour toi, 24 h/24.', 3),
    (v_id, 'Déployer chatbots et agents IA', 'Un assistant qui répond, vend et suit tes clients sur WhatsApp et ton site.', 4),
    (v_id, 'Lancer tes applications', 'Créer une app web ou mobile avec le Vibe Coding, même sans être développeur.', 5);

  -- Modules
  delete from public.modules where programme_id = v_id;
  insert into public.modules (programme_id, titre, sous_titre, points, ordre) values
    (v_id, 'Introduction à l''IA', 'Comprendre l''IA, les LLM et les outils du moment',
      E'Ce qu''est vraiment l''IA générative et comment fonctionne un LLM\nLe tour des meilleurs outils IA du moment et leurs usages\nL''IA appliquée au marketing, à l''éducation, au commerce et à la gestion', 0),
    (v_id, 'Le Prompt Engineering', 'Diriger l''IA avec précision',
      E'La structure d''un prompt qui donne des résultats pros\nRôles, contexte, exemples et contraintes\nTa bibliothèque de prompts réutilisables', 1),
    (v_id, 'Créer des contenus avec l''IA', 'Affiches, vidéos publicitaires, Vibe Motion',
      E'Créer des affiches professionnelles à ta charte\nRéaliser des vidéos publicitaires avec l''IA\nAnimer tes visuels en motion design (Vibe Motion)', 2),
    (v_id, 'Automatisation des tâches', 'Claude, n8n et compagnie',
      E'Repérer ce qui peut être automatisé dans ton activité\nConstruire tes premiers workflows avec n8n\nConnecter l''IA à tes outils du quotidien', 3),
    (v_id, 'Chatbots et agents IA', 'Des assistants qui travaillent pour toi',
      E'Créer un chatbot pour ton site ou WhatsApp\nConcevoir un agent IA capable d''agir seul\nLe nourrir avec les informations de ton activité', 4),
    (v_id, 'Création d''applications avec l''IA', 'Le Vibe Coding, web et mobile',
      E'Décrire ton application et la faire générer par l''IA\nAjouter une base de données et la mettre en ligne\nProjet final : ton propre projet construit de A à Z', 5);

  -- FAQ
  delete from public.faqs where programme_id = v_id;
  insert into public.faqs (programme_id, question, reponse, ordre) values
    (v_id, 'Faut-il des connaissances en informatique ?', 'Non. Le parcours part de zéro. Il suffit de savoir utiliser un ordinateur et d''avoir envie d''apprendre.', 0),
    (v_id, 'Dois-je venir avec mon ordinateur ?', 'Oui, c''est fortement recommandé : la formation est 100 % pratique et tu repars avec tes projets sur ta machine.', 1),
    (v_id, 'Puis-je payer en plusieurs fois ?', 'Oui. Tu réserves ta place avec les 10 $ d''inscription, puis tu règles les 160 $ de participation par tranches.', 2),
    (v_id, 'Comment se passent les sessions ?', 'Cours en présentiel les lundi, mercredi et vendredi pendant 8 semaines. Tu choisis la vacation qui te convient : matinée, après-midi ou soirée.', 3),
    (v_id, 'Vais-je recevoir un certificat ?', 'Oui. Un certificat S''KILLER AI du CNDCI est remis à la fin du parcours, après la présentation de ton projet final.', 4);
end $$;
