import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ExpedienteForm } from "@/components/expedientes/ExpedienteForm";

const ITEMS_PER_PAGE = 20;

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

export default function Expedientes() {
  const navigate = useNavigate();
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [tiposTramite, setTiposTramite] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [filterTipoTramite, setFilterTipoTramite] = useState<string>("all");

  useEffect(() => {
    fetchTiposTramite();
    fetchExpedientes();
  }, [currentPage, searchTerm, filterEstado, filterTipoTramite]);

  const fetchTiposTramite = async () => {
    try {
      const { data, error } = await supabase
        .from("tipos_tramite")
        .select("id, nombre")
        .order("nombre");

      if (error) throw error;
      setTiposTramite(data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchExpedientes = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("expedientes")
        .select(`
          *,
          clients:cliente_id (
            nombre,
            apellidos
          ),
          tipos_tramite:tipo_tramite_id (
            nombre
          )
        `, { count: "exact" });

      if (searchTerm) {
        query = query.or(
          `numero_expediente.ilike.%${searchTerm}%,clients.nombre.ilike.%${searchTerm}%,clients.apellidos.ilike.%${searchTerm}%`
        );
      }

      if (filterEstado !== "all") {
        query = query.eq("estado", filterEstado);
      }

      if (filterTipoTramite !== "all") {
        query = query.eq("tipo_tramite_id", filterTipoTramite);
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await query
        .order("fecha_inicio", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setExpedientes(data || []);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar los expedientes");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading && expedientes.length === 0) {
    return (
      <div className="p-8">
        <p>Cargando expedientes...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Expedientes</h1>
        <p className="text-muted-foreground">
          Gestión de expedientes y trámites
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número o cliente..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowNewDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Expediente
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select
                value={filterEstado}
                onValueChange={(value) => {
                  setFilterEstado(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente_documentos">Pendiente Documentos</SelectItem>
                  <SelectItem value="documentos_completos">Documentos Completos</SelectItem>
                  <SelectItem value="presentado">Presentado</SelectItem>
                  <SelectItem value="en_tramite">En Trámite</SelectItem>
                  <SelectItem value="aprobado">Aprobado</SelectItem>
                  <SelectItem value="denegado">Denegado</SelectItem>
                  <SelectItem value="archivado">Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select
                value={filterTipoTramite}
                onValueChange={(value) => {
                  setFilterTipoTramite(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo de trámite" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {tiposTramite.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº Expediente</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo de Trámite</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Inicio</TableHead>
              <TableHead>Precio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expedientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No se encontraron expedientes
                </TableCell>
              </TableRow>
            ) : (
              expedientes.map((expediente) => (
                <TableRow
                  key={expediente.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/expedientes/${expediente.id}`)}
                >
                  <TableCell className="font-medium">
                    {expediente.numero_expediente}
                  </TableCell>
                  <TableCell>
                    {expediente.clients
                      ? `${expediente.clients.apellidos}, ${expediente.clients.nombre}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {expediente.tipos_tramite?.nombre || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={estadoColors[expediente.estado] || ""}
                    >
                      {estadoLabels[expediente.estado] || expediente.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {expediente.fecha_inicio
                      ? format(new Date(expediente.fecha_inicio), "dd/MM/yyyy", {
                          locale: es,
                        })
                      : "N/A"}
                  </TableCell>
                  <TableCell>{expediente.precio_acordado}€</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Expediente</DialogTitle>
            <DialogDescription>
              Complete los datos para crear un nuevo expediente
            </DialogDescription>
          </DialogHeader>
          <ExpedienteForm
            onSuccess={() => {
              setShowNewDialog(false);
              fetchExpedientes();
            }}
            onCancel={() => setShowNewDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
