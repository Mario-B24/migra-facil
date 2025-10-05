import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Euro, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalExpedientes: 0,
    expedientesActivos: 0,
    totalPagos: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [clientes, expedientes, pagos] = await Promise.all([
        supabase.from("clients").select("*", { count: "exact", head: true }),
        supabase.from("expedientes").select("*", { count: "exact", head: true }),
        supabase.from("payments").select("importe"),
      ]);

      const expedientesActivos = await supabase
        .from("expedientes")
        .select("*", { count: "exact", head: true })
        .neq("estado", "completado");

      const totalPagos = pagos.data?.reduce((sum, p) => sum + Number(p.importe), 0) || 0;

      setStats({
        totalClientes: clientes.count || 0,
        totalExpedientes: expedientes.count || 0,
        expedientesActivos: expedientesActivos.count || 0,
        totalPagos,
      });
    };

    fetchStats();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general del sistema</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClientes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expedientes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExpedientes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expedientes Activos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.expedientesActivos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pagos</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.totalPagos.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bienvenido a MigraFácil</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Sistema completo de gestión para gestoría de extranjería. Utiliza el menú lateral
              para navegar entre las diferentes secciones.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
