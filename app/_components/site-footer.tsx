export default function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-white/10 bg-[#070c18]">
      <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <p className="font-extrabold text-lg mb-2">
            CND<span className="text-[#1666f0]">CI</span>
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Centre Numérique de Développement des Compétences Informatiques —
            le centre de formation du Groupe Elako, fondé par Michel Elako en février 2021.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-300 mb-3">Adresse</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            63, av. Colonel Mondjiba, Silikin Village,<br />
            Gombe, Kinshasa (RDC)
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-300 mb-3">Contact</p>
          <p className="text-sm text-gray-500">
            WhatsApp : <a href="https://wa.me/243825367992" target="_blank" rel="noopener noreferrer" className="text-[#1666f0] hover:underline">+243 825 367 992</a>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Email : <span className="text-gray-400">contact@facileapp.org</span>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} CNDCI — Groupe Elako. Tous droits réservés.
      </div>
    </footer>
  )
}