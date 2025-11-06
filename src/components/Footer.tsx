import { Instagram, Facebook, Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer id="contato" className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Studio Logo" className="h-12 w-12 object-contain" />
              <span className="font-serif text-2xl font-bold">Studio de Beleza</span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Cuidado, técnica e beleza em cada detalhe. Seu momento de transformação começa aqui.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold">Contato</h3>
            <div className="space-y-3">
              <a
                href="tel:+5511999999999"
                className="flex items-center gap-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <Phone className="h-5 w-5" />
                <span className="text-sm">(11) 99999-9999</span>
              </a>
              <a
                href="mailto:contato@studio.com"
                className="flex items-center gap-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span className="text-sm">contato@studio.com</span>
              </a>
              <div className="flex items-start gap-3 text-primary-foreground/80">
                <MapPin className="h-5 w-5 mt-0.5" />
                <span className="text-sm">
                  Rua das Flores, 123<br />
                  Centro - São Paulo, SP
                </span>
              </div>
            </div>
          </div>

          {/* Horários */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold">Horários</h3>
            <div className="space-y-2 text-sm text-primary-foreground/80">
              <div className="flex justify-between">
                <span>Segunda a Sexta:</span>
                <span className="font-medium">9h às 19h</span>
              </div>
              <div className="flex justify-between">
                <span>Sábado:</span>
                <span className="font-medium">9h às 17h</span>
              </div>
              <div className="flex justify-between">
                <span>Domingo:</span>
                <span className="font-medium">Fechado</span>
              </div>
            </div>
            <a
              href="/admin"
              className="inline-block mt-4 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
            >
              Painel Admin
            </a>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} Studio de Beleza. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
