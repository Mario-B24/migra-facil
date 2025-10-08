import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Search, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { ClienteForm } from "@/components/clientes/ClienteForm";

type Cliente = Tables<"clients">;

const ITEMS_PER_PAGE = 20;

export default function Clientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [nacionalidadFilter, setNacionalidadFilter] = useState<string>("all");
  const [nacionalidades, setNacionalidades] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    filterClientes();
  }, [clientes, searchTerm, nacionalidadFilter]);

  const fetchClientes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });

    if (!error && data) {
      setClientes(data);
      const uniqueNacionalidades = Array.from(new Set(data.map((c) => c.nacionalidad).filter(Boolean))) as string[];
      setNacionalidades(uniqueNacionalidades.sort());
    }
    setLoading(false);
  };

  const filterClientes = () => {
    let filtered = [...clientes];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.nombre.toLowerCase().includes(search) ||
          c.apellidos.toLowerCase().includes(search) ||
          c.email?.toLowerCase().includes(search) ||
          c.nie_pasaporte.toLowerCase().includes(search),
      );
    }

    if (nacionalidadFilter !== "all") {
      filtered = filtered.filter((c) => c.nacionalidad === nacionalidadFilter);
    }

    setFilteredClientes(filtered);
    setCurrentPage(1);
  };

  const handleCreate = async (data: any) => {
    try {
      // Preparar los datos para la inserción
      const clientData = {
        nombre: data.nombre,
        apellidos: data.apellidos,
        email: data.email || null,
        telefono: data.telefono || null,
        nacionalidad: data.nacionalidad || null,
        nie_pasaporte: data.nie_pasaporte,
        fecha_vencimiento_nie: data.fecha_vencimiento_nie ? format(data.fecha_vencimiento_nie, "yyyy-MM-dd") : null,
        fecha_nacimiento: data.fecha_nacimiento ? format(data.fecha_nacimiento, "yyyy-MM-dd") : null,
        calle: data.calle || null,
        numero: data.numero || null,
        piso: data.piso || null,
        puerta: data.puerta || null,
        observaciones: data.observaciones || null,
      };

      const { error } = await supabase.from("clients").insert(clientData);

      if (error) {
        console.error("Error al crear cliente:", error);
        toast.error(`Error al crear cliente: ${error.message}`);
      } else {
        toast.success("Cliente creado correctamente");
        setShowCreateDialog(false);
        fetchClientes();
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      toast.error("Error inesperado al crear cliente");
    }
  };

  const handleDelete = async () => {
    if (!clienteToDelete) return;

    try {
      const { error } = await supabase.from("clients").delete().eq("id", clienteToDelete.id);

      if (error) {
        console.error("Error al eliminar cliente:", error);
        toast.error(`Error al eliminar cliente: ${error.message}`);
      } else {
        toast.success("Cliente eliminado correctamente");
        setClienteToDelete(null);
        fetchClientes();
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      toast.error("Error inesperado al eliminar cliente");
    }
  };

  const totalPages = Math.ceil(filteredClientes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentClientes = filteredClientes.slice(startIndex, endIndex);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">
              {filteredClientes.length} cliente{filteredClientes.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, apellidos, email o NIE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={nacionalidadFilter} onValueChange={setNacionalidadFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filtrar por nacionalidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las nacionalidades</SelectItem>
              {nacionalidades.map((nac) => (
                <SelectItem key={nac} value={nac}>
                  {nac}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">Cargando...</div>
          ) : currentClientes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchTerm || nacionalidadFilter !== "all"
                ? "No se encontraron clientes con los filtros aplicados"
                : "No hay clientes registrados"}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Nombre Completo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Teléfono</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        NIE/Pasaporte
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nacionalidad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {currentClientes.map((cliente) => (
                      <tr key={cliente.id} className="hover:bg-muted/50">
                        <td
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => navigate(`/clientes/${cliente.id}`)}
                        >
                          {cliente.nombre} {cliente.apellidos}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => navigate(`/clientes/${cliente.id}`)}
                        >
                          {cliente.email || "-"}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => navigate(`/clientes/${cliente.id}`)}
                        >
                          {cliente.telefono || "-"}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => navigate(`/clientes/${cliente.id}`)}
                        >
                          {cliente.nie_pasaporte}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => navigate(`/clientes/${cliente.id}`)}
                        >
                          {cliente.nacionalidad || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setClienteToDelete(cliente);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="p-4 border-t">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
          </DialogHeader>
          <ClienteForm onSubmit={handleCreate} onCancel={() => setShowCreateDialog(false)} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!clienteToDelete} onOpenChange={() => setClienteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al cliente{" "}
              <strong>
                {clienteToDelete?.nombre} {clienteToDelete?.apellidos}
              </strong>
              . Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
