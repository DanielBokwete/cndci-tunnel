'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { ProgrammeAvecSecteur, Programme, Vacation, Faq, Temoignage, Intervenant, Competence, Module } from '@/lib/types'
import LeadForm from './lead-form'
import './skiller.css'

const ICONES = [
  'M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z',
  'M4 7V5h16v2M12 5v14M9 19h6',
  'M4 5h16v11H4zM8 20h8M12 16v4',
  'M13 3L5 14h6l-1 7 8-11h-6z',
  'M5 6h14v9H9l-4 4zM9 10h6',
  'M8 8l-4 4 4 4M16 8l4 4-4 4M13 6l-2 12',
]

export type InfosAffichage = {
  debut: string | null
  debutCourt: string | null
  fin: string | null
  lieu: string | null
  adresse: string | null
}

export default function SkillerLanding({
  fontClass,
  programme,
  infos,
  vacations,
  faqs,
  competences,
  modules,
  intervenants,
  videos,
  captures,
  programmesSimilaires,
}: {
  fontClass: string
  programme: ProgrammeAvecSecteur
  infos: InfosAffichage
  vacations: Vacation[]
  faqs: Faq[]
  competences: Competence[]
  modules: Module[]
  intervenants: Intervenant[]
  videos: Temoignage[]
  captures: Temoignage[]
  programmesSimilaires: Programme[]
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const winRef = useRef<HTMLDivElement>(null)
  const heroCtaRef = useRef<HTMLDivElement>(null)
  const prixRef = useRef<HTMLSpanElement>(null)
  const promoRef = useRef<HTMLVideoElement>(null)
  const [sonActif, setSonActif] = useState(false)
  const [barreVisible, setBarreVisible] = useState(false)
  const [temps, setTemps] = useState<string | null>(null)

  const prix = programme.prix
  const prixOriginal = programme.prix_original && prix != null && programme.prix_original > prix ? programme.prix_original : null
  const reduction = prixOriginal && prix != null ? Math.round(((prixOriginal - prix) / prixOriginal) * 100) : null
  const frais = programme.frais_inscription
  const videoPresentation = programme.video_presentation_url
  const nomSecteur = programme.secteur?.nom ?? "S'KILLER"
  // Le logo du haut et du bas affiche toujours la marque du programme, pas la branche (AI, DESK, BRAND...)
  const nomProgramme = "S'KILLER"

  const mots = programme.titre.trim().split(' ')
  const dernierMot = mots.length > 1 ? mots.pop() : null
  const debutTitre = mots.join(' ')

  const publics = (programme.public_cible ?? '')
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)

  const libelleCta = frais ? `Je réserve ma place · ${frais} $` : 'Je réserve ma place'

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    root.classList.add('js')
    const nettoyages: (() => void)[] = []

    // Apparition au défilement
    const rvs = root.querySelectorAll('.rv')
    if ('IntersectionObserver' in window && !reduce) {
      const ro = new IntersectionObserver(
        (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target) } }),
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      )
      rvs.forEach((el) => ro.observe(el))
      nettoyages.push(() => ro.disconnect())
    } else rvs.forEach((el) => el.classList.add('in'))

    // Fenêtre de démo : se redresse en défilant
    const win = winRef.current
    if (win && !reduce) {
      const tilt = () => {
        const r = win.getBoundingClientRect()
        const vh = innerHeight
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.75)))
        win.style.transform = `rotateX(${22 * (1 - p)}deg) scale(${0.94 + 0.06 * p})`
      }
      tilt()
      addEventListener('scroll', tilt, { passive: true })
      addEventListener('resize', tilt)
      nettoyages.push(() => { removeEventListener('scroll', tilt); removeEventListener('resize', tilt) })
    }

    // Halo qui suit le doigt / la souris sur les cartes
    const cartes = root.querySelectorAll<HTMLElement>('.card')
    const halo = (e: PointerEvent) => {
      const c = e.currentTarget as HTMLElement
      const r = c.getBoundingClientRect()
      c.style.setProperty('--mx', `${e.clientX - r.left}px`)
      c.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    cartes.forEach((c) => c.addEventListener('pointermove', halo))
    nettoyages.push(() => cartes.forEach((c) => c.removeEventListener('pointermove', halo)))

    // Prix : décompte prix barré → prix promo à l'apparition
    const pn = prixRef.current
    if (pn && prix != null && prixOriginal && 'IntersectionObserver' in window && !reduce) {
      const po = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return
        po.disconnect()
        const from = prixOriginal, to = prix, t0 = performance.now(), d = 1400
        const step = (t: number) => {
          const k = Math.min(1, (t - t0) / d), ease = 1 - Math.pow(1 - k, 3)
          pn.textContent = String(Math.round(from - (from - to) * ease))
          if (k < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      }), { threshold: 0.6 })
      po.observe(pn)
      nettoyages.push(() => po.disconnect())
    }

    // Barre de réservation mobile : apparaît une fois le haut de page dépassé
    const cta = heroCtaRef.current
    if (cta && 'IntersectionObserver' in window) {
      const mo = new IntersectionObserver((es) => setBarreVisible(!es[0].isIntersecting && es[0].boundingClientRect.top < 0))
      mo.observe(cta)
      nettoyages.push(() => mo.disconnect())
    } else setBarreVisible(true)

    if (reduce) promoRef.current?.pause()

    return () => nettoyages.forEach((n) => n())
  }, [prix, prixOriginal])

  // Compte à rebours de l'offre du jour (jusqu'à minuit, se renouvelle chaque jour)
  useEffect(() => {
    if (!prixOriginal) return
    const pad = (n: number) => n.toString().padStart(2, '0')
    const maj = () => {
      const now = new Date()
      const minuit = new Date(now)
      minuit.setHours(24, 0, 0, 0)
      const r = minuit.getTime() - now.getTime()
      setTemps(`${pad(Math.floor(r / 3600000))}:${pad(Math.floor((r % 3600000) / 60000))}:${pad(Math.floor((r % 60000) / 1000))}`)
    }
    maj()
    const id = setInterval(maj, 1000)
    return () => clearInterval(id)
  }, [prixOriginal])

  function basculerSon() {
    const v = promoRef.current
    if (!v) return
    const activer = v.muted
    if (activer) v.currentTime = 0
    v.muted = !activer
    v.play().catch(() => {})
    setSonActif(activer)
  }

  function allerReservation(e: React.MouseEvent) {
    e.preventDefault()
    document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const facts = [
    infos.debut && { k: 'Début', v: infos.debut },
    programme.duree && { k: 'Durée', v: programme.duree },
    programme.rythme && { k: 'Rythme', v: programme.rythme },
    infos.lieu && { k: 'Lieu', v: infos.lieu },
  ].filter(Boolean) as { k: string; v: string }[]

  const inclus = [
    ...modules.map((m) => m.titre),
    programme.afficher_certification ? 'Certificat de fin de parcours' : null,
  ].filter(Boolean) as string[]

  return (
    <div ref={rootRef} className={`sk ${fontClass}`}>
      <div className="ambient" aria-hidden="true" />

      <nav className="nav" aria-label="Navigation">
        <div className="nav-in">
          <a className="brand" href="#top">
            <img src="/logo-cndci.png" alt="" width={30} height={30} />
            CNDCI · <span>{nomProgramme}</span>
          </a>
          <div className="links">
            <Link href="/">Formations</Link>
            {competences.length > 0 && <a href="#competences">Compétences</a>}
            {modules.length > 0 && <a href="#programme">Programme</a>}
            <a href="#tarif">Tarif</a>
            {faqs.length > 0 && <a href="#faq">FAQ</a>}
          </div>
          <a className="btn btn-primary" href="#reservation" onClick={allerReservation}>Réserver</a>
        </div>
      </nav>

      <main id="top">
        <header className="wrap hero">
          <span className="pill"><b>{programme.accroche || 'Inscriptions ouvertes'}</b>{infos.debutCourt ? `Début le ${infos.debutCourt}` : 'Formation en présentiel'}</span>
          <h1>
            {dernierMot ? <>{debutTitre} <span className="hl">{dernierMot}</span></> : <span className="hl">{programme.titre}</span>}
          </h1>
          {programme.description && <p className="sub">{programme.description}</p>}
          <div className="cta-row" ref={heroCtaRef}>
            <a className="btn btn-primary buzz" href="#reservation" onClick={allerReservation}>{libelleCta}</a>
            <a className="btn btn-ghost" href={modules.length > 0 ? '#programme' : '#tarif'}>Voir le programme</a>
          </div>
          <div className="by">
            Un programme <b>CNDCI</b>
            {programme.afficher_certification && <><i className="dot" />Certificat à la clé</>}
            {programme.paiement_tranches && <><i className="dot" />Paiement par tranches</>}
          </div>

          <div className="stage">
            <div className="window" ref={winRef}>
              <div className="bar-top" aria-hidden="true"><i /><i /><i /><span>cndci.org · {nomProgramme.toLowerCase()}</span></div>
              <div className="promo">
                {videoPresentation ? (
                  <>
                    <video ref={promoRef} autoPlay muted loop playsInline preload="auto" poster={programme.image_header_url ?? undefined} src={videoPresentation} />
                    <button className="chip-btn" type="button" aria-pressed={sonActif} onClick={basculerSon}>
                      {sonActif ? '🔊 Son activé' : '🔇 Activer le son'}
                    </button>
                  </>
                ) : programme.image_header_url ? (
                  <img src={programme.image_header_url} alt={programme.titre} />
                ) : (
                  <div className="fallback"><span className="hl" style={{ background: 'var(--grad)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{nomSecteur}</span></div>
                )}
              </div>
            </div>
          </div>

          {facts.length > 0 && (
            <div className="facts">
              {facts.map((f) => (
                <div className="fact" key={f.k}><small>{f.k}</small><b>{f.v}</b></div>
              ))}
            </div>
          )}
        </header>

        {competences.length > 0 && (
          <section id="competences" className="wrap">
            <div className="head">
              <p className="label rv">Ce que tu sauras faire</p>
              <h2 className="h2 rv d1">Des compétences qui font de toi <em>un projet à toi seul</em></h2>
              {programme.contenu && <p className="sub rv d2">{programme.contenu}</p>}
            </div>
            <div className="grid">
              {competences.map((c, i) => (
                <article key={c.id} className={`card rv ${i === 0 ? 'hot' : ''} ${['', 'd1', 'd2'][i % 3]}`}>
                  <div className="ico"><svg viewBox="0 0 24 24"><path d={ICONES[i % ICONES.length]} /></svg></div>
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{c.titre}</h3>
                  {c.description && <p>{c.description}</p>}
                </article>
              ))}
            </div>
          </section>
        )}

        {videos.length > 0 && (
          <section className="wrap">
            <div className="head">
              <p className="label rv">En vidéo</p>
              <h2 className="h2 rv d1">{programme.titre_video || <>Découvre le programme <em>en vidéo</em></>}</h2>
            </div>
            <div className="shots">
              {videos.map((v) => (
                <div key={v.id} className="rv">
                  <video src={v.url} controls playsInline preload="metadata" style={{ width: '100%', borderRadius: 16, border: '1px solid var(--line)', background: '#000' }} />
                  {v.nom && <p className="sub" style={{ fontSize: 14, marginTop: 8 }}>{v.nom}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {modules.length > 0 && (
          <section id="programme" className="wrap">
            <div className="prog">
              <div className="prog-left">
                <p className="label rv">Le programme</p>
                <h2 className="h2 rv d1">Un parcours clair, <em>module par module</em></h2>
                <p className="sub rv d2">100 % pratique, en présentiel. À chaque module, tu appliques directement sur ton propre projet.</p>
                <ul className="stats rv d3">
                  <li><span className="ico"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M4 10h16" /></svg></span>{modules.length} modules</li>
                  {programme.duree && <li><span className="ico"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></svg></span>{programme.duree}{programme.rythme ? ` · ${programme.rythme}` : ''}</li>}
                  {vacations.length > 0 && <li><span className="ico"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></span>{vacations.length} créneau{vacations.length > 1 ? 'x' : ''} au choix</li>}
                </ul>
              </div>
              <div className="mods">
                {modules.map((m, i) => (
                  <details key={m.id} className={`mod rv ${['', 'd1', 'd2', 'd3'][Math.min(i, 3)]}`} open={i === 0}>
                    <summary>
                      <span className="n">{String(i + 1).padStart(2, '0')}</span>
                      <span className="t">{m.titre}{m.sous_titre && <small>{m.sous_titre}</small>}</span>
                      <span className="plus">+</span>
                    </summary>
                    {m.points && (
                      <ul>
                        {m.points.split('\n').map((p) => p.trim()).filter(Boolean).map((p) => (
                          <li key={p}><i className="check" />{p}</li>
                        ))}
                      </ul>
                    )}
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {vacations.length > 0 && (
          <section className="wrap">
            <div className="head">
              <p className="label rv">Horaires</p>
              <h2 className="h2 rv d1">Choisis <em>ton créneau</em></h2>
              <p className="sub rv d2">{programme.rythme ? `${programme.rythme}, ` : ''}une session de 2 h au moment qui t&apos;arrange.{infos.adresse ? ` Lieu : ${infos.adresse}.` : ''}</p>
            </div>
            <div className="slots">
              {vacations.map((v, i) => (
                <div key={v.id} className={`slot rv ${['', 'd1', 'd2'][i % 3]}`}>
                  <small>{v.nom || `Créneau ${i + 1}`}</small>
                  <b>{v.heure_debut.slice(0, 5).replace(':', 'h')} – {v.heure_fin.slice(0, 5).replace(':', 'h')}</b>
                  {programme.rythme && <span>{programme.rythme}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {publics.length > 0 && (
          <section className="wrap">
            <div className="head" style={{ marginBottom: 0 }}>
              <p className="label rv">Pour qui</p>
              <h2 className="h2 rv d1">Ce programme est fait pour toi si tu es…</h2>
              <div className="who rv d2">{publics.map((p) => <span key={p}>{p}</span>)}</div>
              <p className="sub rv d3">…et que tu veux bâtir ton projet et assurer ta communication sans dépendre de personne.</p>
            </div>
          </section>
        )}

        {intervenants.length > 0 && (
          <section className="wrap">
            <div className="head">
              <p className="label rv">Intervenants</p>
              <h2 className="h2 rv d1">Tu apprends avec <em>des praticiens</em></h2>
            </div>
            <div className="people">
              {intervenants.map((it) => (
                <div key={it.id} className="person rv">
                  {it.photo_url ? <img src={it.photo_url} alt={it.nom} /> : <span className="ini">{it.nom.charAt(0)}</span>}
                  <div><b>{it.nom}</b>{it.bio && <p>{it.bio}</p>}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {captures.length > 0 && (
          <section className="wrap">
            <div className="head">
              <p className="label rv">Ils en parlent</p>
              <h2 className="h2 rv d1">Ce que disent <em>les participants</em></h2>
            </div>
            <div className="shots">
              {captures.map((t) => <img key={t.id} className="rv" src={t.url} alt={t.nom ?? 'Témoignage'} />)}
            </div>
          </section>
        )}

        {prix != null && (
          <section id="tarif" className="wrap">
            <div className="price-wrap">
              <p className="label rv">Tarif</p>
              <h2 className="h2 rv d1">Investis dans <em>tes compétences</em></h2>
            </div>
            <div className="price rv d2">
              <div className="price-in">
                <div className="pl">
                  <span className="ptag">{reduction ? `−${reduction} % · Offre du jour` : programme.accroche || 'Places limitées'}</span>
                  <h3>{programme.titre}</h3>
                  <p className="meta">Formation en présentiel · par le CNDCI</p>
                  <div className="amount">
                    <span className="big" ref={prixRef}>{prix}</span>
                    <span className="cur">USD</span>
                    {prixOriginal && <s>{prixOriginal} USD</s>}
                    <span className="once">Frais de participation{programme.paiement_tranches ? ' · paiement par tranches accepté' : ''}</span>
                  </div>
                  {frais ? <span className="fee">+ <b>{frais} $</b> d&apos;inscription pour réserver ta place</span> : null}
                  {prixOriginal && (
                    <div className="timer"><small>L&apos;offre expire dans</small><b>{temps ?? '--:--:--'}</b></div>
                  )}
                  <a className="btn btn-primary buzz" href="#reservation" onClick={allerReservation}>{libelleCta}</a>
                  <div className="secure"><span>📍 {infos.lieu ?? 'En présentiel'}</span>{programme.paiement_tranches && <span>💳 Paiement en plusieurs fois</span>}</div>
                </div>
                <div className="pr">
                  <div className="tiles">
                    <div className="tile"><small>Début</small><b>{infos.debutCourt ?? 'Bientôt'}</b></div>
                    <div className="tile"><small>Durée</small><b>{programme.duree ?? '—'}</b></div>
                    <div className="tile"><small>Format</small><b>Présentiel</b></div>
                    <div className="tile"><small>Niveau</small><b>Débutant</b></div>
                  </div>
                  {inclus.length > 0 && (
                    <>
                      <p className="incl-label">Ce que tu reçois</p>
                      <ul className="incl">{inclus.map((x) => <li key={x}><i className="check" />{x}</li>)}</ul>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="booking rv">
              <LeadForm
                programmeId={programme.id}
                lienInscription={programme.lien_inscription}
                programmesSimilaires={programmesSimilaires}
                vacations={vacations}
                indicatif={programme.indicatif}
                accent={programme.secteur?.couleur ?? '#ff3b30'}
              />
            </div>
          </section>
        )}

        {prix == null && (
          <section className="wrap">
            <div className="booking rv">
              <LeadForm
                programmeId={programme.id}
                lienInscription={programme.lien_inscription}
                programmesSimilaires={programmesSimilaires}
                vacations={vacations}
                indicatif={programme.indicatif}
                accent={programme.secteur?.couleur ?? '#ff3b30'}
              />
            </div>
          </section>
        )}

        {faqs.length > 0 && (
          <section id="faq" className="wrap">
            <div className="price-wrap">
              <p className="label rv">FAQ</p>
              <h2 className="h2 rv d1">Tes questions</h2>
            </div>
            <div className="faq">
              {faqs.map((f) => (
                <details key={f.id} className="rv"><summary>{f.question}</summary><p>{f.reponse}</p></details>
              ))}
            </div>
          </section>
        )}

        <section className="wrap final">
          <h2 className="h2 rv">Prêt à devenir <em>un {nomProgramme}</em> ?</h2>
          <p className="sub rv d1" style={{ textAlign: 'center' }}>
            {infos.debut ? `La cohorte démarre le ${infos.debut}. ` : ''}Les places sont limitées.
          </p>
          <a className="btn btn-primary buzz rv d2" href="#reservation" onClick={allerReservation}>{libelleCta}</a>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <a className="brand" href="#top"><img src="/logo-cndci.png" alt="" width={30} height={30} />CNDCI · <span>{nomProgramme}</span></a>
          <Link href="/" style={{ textDecoration: 'none' }}>Tous nos programmes →</Link>
          <span>© {new Date().getFullYear()} CNDCI · Groupe ELAKO</span>
        </div>
      </footer>

      <div className={`mbar ${barreVisible ? 'show' : ''}`}>
        <p><b>{prix != null ? `${prix} $` : nomSecteur}{frais ? ` · réservation ${frais} $` : ''}</b>{infos.debutCourt ? `Début le ${infos.debutCourt}` : programme.titre}</p>
        <a className="btn btn-primary" href="#reservation" onClick={allerReservation}>Réserver</a>
      </div>
    </div>
  )
}
