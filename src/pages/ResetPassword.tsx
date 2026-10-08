import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function ResetPassword() {
  const { user, loading, role } = useAuth();
  const navigate = useNavigate();
  const [viaRecovery, setViaRecovery] = useState(false);
  const [graceDone, setGraceDone] = useState(false);

  const homePath = role === 'admin' ? '/dashboard' : role === 'tm' ? '/tm' : '/';

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setViaRecovery(true);
      }
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // Sem usuário nem link de recuperação depois de um tempo, o link é inválido/expirado.
  useEffect(() => {
    if (loading) return;
    if (user || viaRecovery) return;
    const t = setTimeout(() => setGraceDone(true), 2500);
    return () => clearTimeout(t);
  }, [loading, user, viaRecovery]);

  const showForm = Boolean(user) || viaRecovery;
  if (loading || (!showForm && !graceDone)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center mb-3 text-gold-500">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <CardTitle className="text-xl text-foreground">Link inválido ou expirado</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Este link de redefinição de senha não é válido ou já expirou.
              Solicite um novo link na tela de login.
            </p>
            <Button
              onClick={() => navigate('/login')}
              className="w-full h-12 rounded-xl text-base font-semibold bg-gold-500 text-black hover:bg-gold-600"
            >
              Ir para o login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex flex-col items-center justify-center gap-3 mb-4">
            <img src="/logo.png" alt="CRM MI" className="h-20 w-20 object-cover rounded-full" />
            <span className="text-2xl font-bold text-foreground">CRM MI</span>
          </div>
          <CardTitle className="text-xl text-muted-foreground font-normal">
            {viaRecovery ? 'Defina sua nova senha' : 'Alterar senha'}
          </CardTitle>
          {viaRecovery && (
            <p className="text-xs text-muted-foreground px-2">
              Escolha uma nova senha para acessar sua conta.
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          <ChangePasswordForm
            onSuccess={() => navigate(homePath, { replace: true })}
            submitLabel="Redefinir senha"
          />
        </CardContent>
      </Card>
    </div>
  );
}