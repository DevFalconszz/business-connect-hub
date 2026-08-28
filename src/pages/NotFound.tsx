import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-md">
        <h1 className="mb-2 text-6xl font-black text-foreground">404</h1>
        <p className="mb-6 text-lg text-muted-foreground">Oops! Página não encontrada</p>
        <Button asChild className="bg-gold-500 text-black hover:bg-gold-600 rounded-xl h-12 px-6">
          <a href="/" className="inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao inicio
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
