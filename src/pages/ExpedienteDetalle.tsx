import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, FileText, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const estadoColors: Record<string, string> = {
  pendiente_documentos: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  documentos_completos: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  presentado: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  en_tramite: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  aprobado: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  denegado: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  archivado: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
};

const estadoLabels: Record<string, string> = {
  pendiente_documentos: "Pendiente Documentos",
  documentos_completos: "Documentos Completos",
  presentado: "Presentado",
  en_tramite: "En Trámite",
  aprobado: "Aprobado",
  denegado: "Denegado",
  archivado: "Archivado",
};

export default function ExpedienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expediente, setExpediente] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchExpediente();
    }
  }, [id]);

  const fetchExpediente = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("expedientes")
        .select(`
          *,
          clients:cliente_id (
            nombre,
            apellidos,
            email,
            telefono
          ),
          tipos_tramite:tipo_tramite_id (
            nombre
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setExpediente(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar el expediente");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-8">
          <p>Cargando expediente...</p>
        </div>
      </MainLayout>
    );
  }

  if (!expediente) {
    return (
      <MainLayout>
        <div className="p-8">
          <p>Expediente no encontrado</p>
          <Button onClick={() => navigate("/expedientes")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Expedientes
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => navigate("/expedientes")} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Expedientes
            </Button>
            <h1 className="text-3xl font-bold">Expediente {expediente.numero_expediente}</h1>
            <p className="text-muted-foreground">Detalles del expediente</p>
          </div>
          <Badge variant="outline" className={estadoColors[expediente.estado] || ""}>
            {estadoLabels[expediente.estado] || expediente.estado}
          </Badge>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información del Expediente
              </h2>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Número de Expediente</p>
                <p className="text-base">{expediente.numero_expediente}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo de Trámite</p>
                <p className="text-base">{expediente.tipos_tramite?.nombre || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha de Inicio</p>
                <p className="text-base">
                  {expediente.fecha_inicio
                    ? format(new Date(expediente.fecha_inicio), "dd/MM/yyyy", { locale: es })
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha Estimada</p>
                <p className="text-base">
                  {expediente.fecha_estimada
                    ? format(new Date(expediente.fecha_estimada), "dd/MM/yyyy", { locale: es })
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Precio Acordado</p>
                <p className="text-base font-semibold">{expediente.precio_acordado}€</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <Badge variant="outline" className={estadoColors[expediente.estado] || ""}>
                  {estadoLabels[expediente.estado] || expediente.estado}
                </Badge>
              </div>
              {expediente.notas && (
                <div className="col-span-full">
                  <p className="text-sm font-medium text-muted-foreground">Notas</p>
                  <p className="text-base">{expediente.notas}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Información del Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                <p className="text-base">
                  {expediente.clients
                    ? `${expediente.clients.nombre} ${expediente.clients.apellidos}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{expediente.clients?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                <p className="text-base">{expediente.clients?.telefono || "N/A"}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pagos
              </h2>
              <Button variant="outline" size="sm">
                Añadir Pago
              </Button>
            </div>
            <p className="text-muted-foreground">No hay pagos registrados para este expediente</p>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
