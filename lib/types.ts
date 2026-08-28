export type Organisation = {
  id: string
  nom: string
  sous_domaine: string
  proprietaire_id: string
  plan: 'essai' | 'actif' | 'expire' | 'annule'
  essai_fin: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
}

export type Secteur = {
  id: string
  organisation_id: string
  nom: string
  slug: string
  couleur: string
  created_at: string
}

export type Programme = {
  id: string
  organisation_id: string
  secteur_id: string | null
  titre: string
  slug: string
  type: 'formation' | 'masterclass' | 'autre'
  description: string | null
  contenu: string | null
  image_header_url: string | null
  image_card_url: string | null
  image_affiche_url: string | null
  date_debut: string | null
  date_fin: string | null
  heure_debut: string | null
  heure_fin: string | null
  lieu: string | null
  pays: string | null
  indicatif: string | null
  ville: string | null
  prix: number | null
  prix_original: number | null
  frais_inscription: number | null
  lien_inscription: string | null
  afficher_certification: boolean
  public_cible: string | null
  titre_video: string | null
  promo_start_at: string
  actif: boolean
  created_at: string
  updated_at: string
}

export type ProgrammeAvecSecteur = Programme & {
  secteur: Secteur | null
}

export type Vacation = {
  id: string
  programme_id: string
  nom: string | null
  heure_debut: string
  heure_fin: string
  ordre: number
  created_at: string
}

export type Faq = {
  id: string
  programme_id: string
  question: string
  reponse: string
  ordre: number
  created_at: string
}

export type Temoignage = {
  id: string
  programme_id: string
  type: 'image' | 'video'
  url: string
  nom: string | null
  ordre: number
  created_at: string
}

export type Intervenant = {
  id: string
  programme_id: string
  nom: string
  bio: string | null
  photo_url: string | null
  ordre: number
  created_at: string
}

export type Prospect = {
  id: string
  programme_id: string
  vacation_id: string | null
  vacation_secondaire_id: string | null
  nom: string
  whatsapp: string
  email: string | null
  genre: 'homme' | 'femme' | null
  age: number | null
  confirme: boolean
  created_at: string
}