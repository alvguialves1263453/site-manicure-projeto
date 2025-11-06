import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simple validation
    if (formData.username === "admin" && formData.password === "1234") {
      localStorage.setItem("isAdminAuthenticated", "true");
      toast.success("Login realizado com sucesso!");
      navigate("/admin/dashboard");
    } else {
      toast.error("Usuário ou senha inválidos");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Início
          </Link>
        </Button>
        
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <img src={logo} alt="Logo" className="h-16 w-16 mx-auto object-contain" />
            </div>
            <CardTitle className="text-3xl font-serif">Painel Administrativo</CardTitle>
            <CardDescription>Entre com suas credenciais</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="admin"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="1234"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-hero hover:opacity-90"
              disabled={loading}
            >
              <Lock className="mr-2 h-4 w-4" />
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Para criar uma conta de administrador, contate o suporte
            </p>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Admin;
