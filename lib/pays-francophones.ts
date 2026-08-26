export type Pays = { nom: string; indicatif: string }

export const PAYS_FRANCOPHONES: Pays[] = [
  { nom: 'République Démocratique du Congo', indicatif: '243' },
  { nom: 'Congo-Brazzaville', indicatif: '242' },
  { nom: "Côte d'Ivoire", indicatif: '225' },
  { nom: 'Sénégal', indicatif: '221' },
  { nom: 'Mali', indicatif: '223' },
  { nom: 'Burkina Faso', indicatif: '226' },
  { nom: 'Niger', indicatif: '227' },
  { nom: 'Togo', indicatif: '228' },
  { nom: 'Bénin', indicatif: '229' },
  { nom: 'Guinée', indicatif: '224' },
  { nom: 'Cameroun', indicatif: '237' },
  { nom: 'Gabon', indicatif: '241' },
  { nom: 'Tchad', indicatif: '235' },
  { nom: 'République Centrafricaine', indicatif: '236' },
  { nom: 'Rwanda', indicatif: '250' },
  { nom: 'Burundi', indicatif: '257' },
  { nom: 'Madagascar', indicatif: '261' },
  { nom: 'Djibouti', indicatif: '253' },
  { nom: 'Comores', indicatif: '269' },
  { nom: 'Mauritanie', indicatif: '222' },
  { nom: 'Maroc', indicatif: '212' },
  { nom: 'Algérie', indicatif: '213' },
  { nom: 'Tunisie', indicatif: '216' },
  { nom: 'France', indicatif: '33' },
  { nom: 'Belgique', indicatif: '32' },
  { nom: 'Suisse', indicatif: '41' },
  { nom: 'Luxembourg', indicatif: '352' },
  { nom: 'Canada', indicatif: '1' },
  { nom: 'Haïti', indicatif: '509' },
]

export function formaterNumeroInternational(numeroBrut: string, indicatif: string): string {
  const chiffresIndicatif = indicatif.replace(/\D/g, '')
  let chiffres = numeroBrut.replace(/\D/g, '')

  // Si le numéro commence déjà par l'indicatif, on ne le rajoute pas
  if (chiffres.startsWith(chiffresIndicatif)) {
    return chiffres
  }

  // Retire un ou plusieurs zéros de tête (format local classique : 08xxxxxxxx -> 8xxxxxxxx)
  chiffres = chiffres.replace(/^0+/, '')

  return chiffresIndicatif + chiffres
}