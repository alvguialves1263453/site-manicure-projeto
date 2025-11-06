import { Button } from "./ui/button";
import { Calendar, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-nails.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Manicure profissional"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-overlay"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 sm:py-28 md:py-32 text-center">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary-light/30">
            <Sparkles className="h-4 w-4 text-primary-light" />
            <span className="text-sm font-medium text-primary-light">Sua beleza merece cuidado especial</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-light leading-tight">
            Sua <span className="italic">melhor versão,</span>
            <br />
            começa aqui!
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-primary-light/90 max-w-2xl mx-auto leading-relaxed px-4">
            Conheça nossos serviços e transforme cuidados em autoestima
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 px-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-primary-light text-primary-dark hover:bg-primary-light/90 shadow-hover font-semibold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
            >
              <Link to="/agendar">
                <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Agendar Agora
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-2 border-primary-light text-primary-light hover:bg-primary-light/10 backdrop-blur-sm font-semibold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
            >
              <a href="#servicos">Ver Serviços</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-light/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary-light/50 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
