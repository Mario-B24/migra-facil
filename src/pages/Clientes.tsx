import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Plus, Search } from "lucide-react";
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

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    filterClientes();
  }, [clientes, searchTerm, nacionalidadFilter]);

  const fetchClientes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setClientes(data);
      const uniqueNacionalidades = Array.from(
        new Set(data.map((c) => c.nacionalidad).filter(Boolean))
      ) as string[];
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
          c.nie_pasaporte.toLowerCase().includes(search)
      );
    }

    if (nacionalidadFilter !== "all") {
      filtered = filtered.filter((c) => c.nacionalidad === nacionalidadFilter);
    }

    setFilteredClientes(filtered);
    setCurrentPage(1);
  };

  const handleCreate = async (data: any) => {
    const { error } = await supabase.from("clients").insert({
      ...data,
      fecha_vencimiento_nie: data.fecha_vencimiento_nie ? format(data.fecha_vencimiento_nie, "yyyy-MM-dd") : null,
      fecha_nacimiento: data.fecha_nacimiento ? format(data.fecha_nacimiento, "yyyy-MM-dd") : null,
    });

    if (error) {
      toast.error("Error al crear cliente");
    } else {
      toast.success("Cliente creado correctamente");
      setShowCreateDialog(false);
      fetchClientes();
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
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        NIE/Pasaporte
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Nacionalidad
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {currentClientes.map((cliente) => (
                      <tr
                        key={cliente.id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate(`/clientes/${cliente.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {cliente.nombre} {cliente.apellidos}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{cliente.email || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{cliente.telefono || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{cliente.nie_pasaporte}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{cliente.nacionalidad || "-"}</td>
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
    </MainLayout>
  );
}
