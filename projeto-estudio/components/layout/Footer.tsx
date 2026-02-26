import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram, MapPin, Mail } from 'lucide-react';
import { scrollToSection } from '../../utils/scroll';
import { BUSINESS_INFO } from '../../utils/constants';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Serviços', id: 'servicos' },
    { name: 'A Especialista', id: 'especialista' },
    { name: 'Agendamento', id: 'agendamento' },
  ];

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/privacidade');
    window.scrollTo(0, 0);
  };

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/termos');
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-[#050505] pt-20 pb-10 border-t border-white/5 relative z-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand + NIF */}
          <div className="space-y-6">
            <img src="/logo.png" alt="Logo" className="h-16 w-auto opacity-90" />
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Estética Avançada & Beleza de Luxo. O seu refúgio de bem-estar no coração de Águeda.
            </p>
            <div className="text-white/50 text-xs space-y-1 uppercase tracking-wider mt-4">
              <p>{BUSINESS_INFO.owner}</p>
              <p>NIF: {BUSINESS_INFO.nif}</p>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">Explorar</h4>
            <ul className="space-y-4 text-sm text-white/60">
              {navLinks.map(link => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="hover:text-braz-pink transition-colors text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">Legal</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li>
                <button
                  onClick={handlePrivacyClick}
                  className="hover:text-braz-pink transition-colors text-left"
                >
                  Privacidade & RGPD
                </button>
              </li>
              <li>
                <button
                  onClick={handleTermsClick}
                  className="hover:text-braz-pink transition-colors text-left"
                >
                  Termos e Condições
                </button>
              </li>
              <li>
                <a
                  href={BUSINESS_INFO.ralUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-braz-pink transition-colors text-left block"
                >
                  Resolução de Conflitos (RAL)
                </a>
              </li>
            </ul>
          </div>

          {/* Contactos */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">Contacto</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-braz-pink flex-shrink-0 mt-1" />
                <span>{BUSINESS_INFO.address}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-braz-pink flex-shrink-0" />
                <a
                  href={`mailto:${BUSINESS_INFO.email}`}
                  className="hover:text-white transition-colors"
                >
                  {BUSINESS_INFO.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">Siga-nos</h4>
            <div className="space-y-4">
              {/* Estúdio Braz */}
              <a
                href={BUSINESS_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-white/70 hover:text-braz-pink group bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all"
              >
                <Instagram className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <div>
                  {/* CORREÇÃO AQUI: Alterado de Estúdio para Studio */}
                  <p className="text-xs font-bold text-white uppercase">Studio Braz</p>
                  <p className="text-[10px]">@{BUSINESS_INFO.instagram}</p>
                </div>
              </a>

              {/* Mariana Braz */}
              <a
                href={BUSINESS_INFO.instagramPersonalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-white/70 hover:text-braz-pink group bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all"
              >
                <Instagram className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <div>
                  <p className="text-xs font-bold text-white uppercase">Mariana Braz</p>
                  <p className="text-[10px]">@{BUSINESS_INFO.instagramPersonal}</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-white/20 text-xs font-montserrat uppercase tracking-wider">
            © {new Date().getFullYear()} {BUSINESS_INFO.name}. Todos os direitos reservados.
          </p>

          <div className="flex items-center space-x-8">
            <a
              href="https://www.livroreclamacoes.pt"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <img
                src="https://www.livroreclamacoes.pt/assets/img/logo-livro-reclamacoes.png"
                alt="Livro de Reclamações"
                className="h-9 w-auto"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;