import { useState } from "react";
import { Eye, EyeOff, Lock, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface LoginProps {
  onLogin: (user: string) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const { toast } = useToast();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha username e senha.",
        variant: "destructive",
      });
      return;
    }

    const validUsers = ["recep", "alexandre"];
    
    setIsLoading(true);

    setTimeout(() => {
      if (validUsers.includes(user.toLowerCase()) && password.length >= 6) {
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo ao sistema, ${user}`,
        });
        onLogin(user);
      } else {
        toast({
          title: "Credenciais inválidas",
          description: "username ou senha incorretos. Tente novamente.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Sistema de Entrevistas</h1>
          <p className="text-muted-foreground mt-2">
            Faça login para acessar o painel administrativo
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Acesso Administrativo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="username"
                    type="username"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    placeholder="Username"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar no Sistema"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Sistema criado por Alexandre Lemos</p>
          <p className="mt-1">© 2025 - <a href="https://linktr.ee/alexandre0lemos">Alexandre Lemos</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;