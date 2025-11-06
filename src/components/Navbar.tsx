import { Link, useLocation } from "react-router-dom";
import { Menu, X, Calendar } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: "Início", path: "/" },
    { name: "Serviços", path: "/#servicos" },
    { name: "Galeria", path: "/#galeria" },
    { name: "Contato", path: "/#contato" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Studio Logo" className="h-12 w-12 object-contain" />
            <span className="font-serif text-2xl font-bold text-primary">Studio de Beleza</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? "text-primary" : "text-foreground"
                }`}
              >
                {link.name}
              </a>
            ))}
            <Button asChild className="bg-gradient-hero hover:opacity-90 shadow-elegant">
              <Link to="/agendar">
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Horário
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-2 text-sm font-medium transition-colors hover:bg-muted rounded-lg ${
                    isActive(link.path) ? "text-primary bg-muted" : "text-foreground"
                  }`}
                >
                  {link.name}
                </a>
              ))}
              <Button asChild className="bg-gradient-hero hover:opacity-90 mx-4">
                <Link to="/agendar" onClick={() => setIsOpen(false)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar Horário
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
