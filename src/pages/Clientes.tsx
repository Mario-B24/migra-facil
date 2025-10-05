import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Cliente = Tables<"clients">;

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setClientes(data);
    }
    setLoading(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">Gestión de clientes</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>

        <div className="bg-card rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">Cargando...</div>
          ) : clientes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No hay clientes registrados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      NIE/Pasaporte
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Teléfono
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {cliente.nombre} {cliente.apellidos}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{cliente.nie_pasaporte}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{cliente.email || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{cliente.telefono || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
