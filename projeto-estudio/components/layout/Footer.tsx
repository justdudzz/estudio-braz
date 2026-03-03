import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MapPin, Mail } from 'lucide-react';
import { BUSINESS_INFO } from '../../utils/constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-braz-black pt-24 pb-12 border-t border-white/5 relative z-10 overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-braz-gold/20 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand + NIF */}
          <div className="space-y-8">
            <img src="/iconelogo.png" alt="Logo" className="h-16 w-auto opacity-80" />
            <p className="text-white/40 text-sm leading-loose max-w-xs font-light">
              Estética Avançada & Beleza de Luxo. O seu refúgio de bem-estar no coração de Águeda.
            </p>
            <div className="text-white/30 text-xs space-y-2 uppercase tracking-[0.2em] mt-6">
              <p className="font-bold text-white/50">{BUSINESS_INFO.owner}</p>
              <p>NIF: {BUSINESS_INFO.nif}</p>
            </div>
          </div>

          {/* Explorar */}
          <div>
            <h4 className="text-white/90 font-luxury uppercase tracking-[0.25em] mb-8 text-xs">Explorar</h4>
            <ul className="space-y-4 text-sm text-white/50 font-light">
              <li><Link to="/servicos" className="hover:text-braz-gold transition-colors duration-300">Serviços</Link></li>
              <li><Link to="/portfolio" className="hover:text-braz-gold transition-colors duration-300">Portfólio</Link></li>
              <li><Link to="/sobre" className="hover:text-braz-gold transition-colors duration-300">Sobre Nós</Link></li>
              <li><Link to="/agendar" className="hover:text-braz-gold transition-colors duration-300">Agendar</Link></li>
              <li><Link to="/contacto" className="hover:text-braz-gold transition-colors duration-300">Contacto</Link></li>
              <li><Link to="/faq" className="hover:text-braz-gold transition-colors duration-300">Perguntas Frequentes</Link></li>
              <li><Link to="/cartoes-presente" className="hover:text-braz-gold transition-colors duration-300">Cartões Presente</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white/90 font-luxury uppercase tracking-[0.25em] mb-8 text-xs">Legal</h4>
            <ul className="space-y-4 text-sm text-white/50 font-light">
              <li><Link to="/politica-privacidade" className="hover:text-braz-gold transition-colors duration-300">Privacidade & RGPD</Link></li>
              <li><Link to="/termos-condicoes" className="hover:text-braz-gold transition-colors duration-300">Termos e Condições</Link></li>
              <li>
                <a href={BUSINESS_INFO.ralUrl} target="_blank" rel="noopener noreferrer" className="hover:text-braz-gold transition-colors duration-300 block">
                  Resolução de Conflitos (RAL)
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto + Social */}
          <div className="space-y-10">
            {/* Contact Info */}
            <div>
              <h4 className="text-white/90 font-luxury uppercase tracking-[0.25em] mb-8 text-xs">Contacto</h4>
              <ul className="space-y-5 text-sm text-white/50 font-light">
                <li className="flex items-start space-x-4">
                  <MapPin className="w-5 h-5 text-braz-gold/70 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span className="leading-relaxed">{BUSINESS_INFO.address}</span>
                </li>
                <li className="flex items-center space-x-4">
                  <Mail className="w-5 h-5 text-braz-gold/70 flex-shrink-0" strokeWidth={1.5} />
                  <a href={`mailto:${BUSINESS_INFO.email}`} className="hover:text-braz-gold transition-colors duration-300">{BUSINESS_INFO.email}</a>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div className="space-y-4">
              <a href={BUSINESS_INFO.instagramUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center space-x-4 text-white/50 hover:text-braz-gold group bg-white/[0.02] border border-white/5 p-4 rounded-sm hover:bg-white/[0.05] hover:border-braz-gold/20 transition-all duration-300">
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                <div>
                  <p className="text-xs font-bold text-white/80 uppercase tracking-widest">Studio Braz</p>
                  <p className="text-[10px] text-white/40 tracking-wider">@{BUSINESS_INFO.instagram}</p>
                </div>
              </a>
              <a href={BUSINESS_INFO.instagramPersonalUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center space-x-4 text-white/50 hover:text-braz-gold group bg-white/[0.02] border border-white/5 p-4 rounded-sm hover:bg-white/[0.05] hover:border-braz-gold/20 transition-all duration-300">
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                <div>
                  <p className="text-xs font-bold text-white/80 uppercase tracking-widest">Mariana Braz</p>
                  <p className="text-[10px] text-white/40 tracking-wider">@{BUSINESS_INFO.instagramPersonal}</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left mt-8">
          <p className="text-white/30 text-[10px] font-montserrat uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} {BUSINESS_INFO.name}. Todos os direitos reservados.
          </p>

          <div className="flex items-center space-x-8">
            <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity duration-500 grayscale hover:grayscale-0">
              <img src="https://www.livroreclamacoes.pt/assets/img/logo-livro-reclamacoes.png" alt="Livro de Reclamações" className="h-8 w-auto" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;