import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Eye, EyeOff, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const { signIn, resetPassword, user, loading, role } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const homePath = role === 'admin' ? '/dashboard' : role === 'tm' ? '/tm' : '/';

  useEffect(() => {
    if (!loading && user) {
      navigate(homePath, { replace: true });
    }
  }, [user, loading, navigate, homePath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Preencha email e senha.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Login realizado com sucesso!');
        navigate(homePath, { replace: true });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Informe o email cadastrado.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await resetPassword(email.trim());
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Se o email estiver cadastrado, enviamos um link de redefinição de senha.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex flex-col items-center justify-center gap-3 mb-4">
            <img src="/logo.png" alt="CRM MI" className="h-24 w-24 object-cover rounded-full" />
            <span className="text-2xl font-bold text-foreground">CRM MI</span>
          </div>
          <CardTitle className="text-xl text-muted-foreground font-normal">
            {mode === 'login' ? 'Entre na sua conta' : 'Recuperar senha'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {mode === 'login' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl bg-background border-input focus:border-gold-500 focus:ring-gold-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-muted-foreground">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl bg-background border-input focus:border-gold-500 focus:ring-gold-500 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-semibold bg-gold-500 text-black hover:bg-gold-600"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Entrar'
                )}
              </Button>

              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                Esqueceu a senha?
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Informe o email cadastrado e enviaremos um link para redefinir sua senha.
              </p>
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-sm text-muted-foreground">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl bg-background border-input focus:border-gold-500 focus:ring-gold-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-semibold bg-gold-500 text-black hover:bg-gold-600"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5 mr-2" />}
                {submitting ? 'Enviando...' : 'Enviar link de redefinição'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setMode('login')}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para o login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
