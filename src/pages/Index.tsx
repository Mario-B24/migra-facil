import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Building2, FileText, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-glow to-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
              <Building2 className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">MigraFácil</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Sistema completo de gestión para gestoría de extranjería
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <Users className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Gestión de Clientes</h3>
            <p className="text-white/80">Administra toda la información de tus clientes de forma organizada</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <FileText className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Control de Expedientes</h3>
            <p className="text-white/80">Seguimiento completo del estado de cada trámite</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <CheckCircle className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Gestión de Pagos</h3>
            <p className="text-white/80">Registra y controla todos los pagos de manera eficiente</p>
          </div>
        </div>

        <div className="text-center">
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 shadow-xl"
          >
            Acceder al Sistema
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
