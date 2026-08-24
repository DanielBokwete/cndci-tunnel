export type Secteur = {
  id: string
  nom: string
  slug: string
  couleur: string
  created_at: string
}

export type Programme = {
  id: string
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
  prix: number | null
  prix_original: number | null
  frais_inscription: number | null
  lien_inscription: string | null
  promo_start_at: string
  actif: boolean
  created_at: string
  updated_at: string
}

export type ProgrammeAvecSecteur = Programme & {
  secteur: Secteur | null
}

export type Prospect = {
  id: string
  programme_id: string
  nom: string
  whatsapp: string
  email: string | null
  genre: 'homme' | 'femme' | null
  age: number | null
  confirme: boolean
  created_at: string
}