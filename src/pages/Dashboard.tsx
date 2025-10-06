import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Euro, AlertCircle, Clock, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
interface DashboardStats {
  totalClientes: number;
  expedientesActivos: number;
  expedientesPendientes: number;
  ingresosMesActual: number;
}
interface ExpedientePorEstado {
  estado: string;
  cantidad: number;
}
interface ExpedientePorMes {
  mes: string;
  cantidad: number;
}
interface IngresosPorMes {
  mes: string;
  ingresos: number;
}
interface TipoTramiteTop {
  nombre: string;
  cantidad: number;
}
interface ExpedienteReciente {
  id: string;
  numero_expediente: string;
  estado: string;
  fecha_inicio: string;
  clients: {
    nombre: string;
    apellidos: string;
  };
  tipos_tramite: {
    nombre: string;
  };
}
interface ClienteAlerta {
  id: string;
  nombre: string;
  apellidos: string;
  nie_pasaporte: string;
  fecha_vencimiento_nie: string;
  dias_restantes: number;
}
interface ExpedienteSinMovimiento {
  id: string;
  numero_expediente: string;
  dias_sin_movimiento: number;
  clients: {
    nombre: string;
    apellidos: string;
  };
}
const ESTADO_COLORS: Record<string, string> = {
  pendiente_documentos: "#f59e0b",
  documentos_completos: "#3b82f6",
  presentado: "#8b5cf6",
  en_tramite: "#f97316",
  aprobado: "#10b981",
  denegado: "#ef4444",
  archivado: "#6b7280"
};
const ESTADO_LABELS: Record<string, string> = {
  pendiente_documentos: "Pendiente Docs",
  documentos_completos: "Docs Completos",
  presentado: "Presentado",
  en_tramite: "En Trámite",
  aprobado: "Aprobado",
  denegado: "Denegado",
  archivado: "Archivado"
};
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    expedientesActivos: 0,
    expedientesPendientes: 0,
    ingresosMesActual: 0
  });
  const [expedientesPorEstado, setExpedientesPorEstado] = useState<ExpedientePorEstado[]>([]);
  const [expedientesPorMes, setExpedientesPorMes] = useState<ExpedientePorMes[]>([]);
  const [ingresosPorMes, setIngresosPorMes] = useState<IngresosPorMes[]>([]);
  const [topTiposTramite, setTopTiposTramite] = useState<TipoTramiteTop[]>([]);
  const [expedientesRecientes, setExpedientesRecientes] = useState<ExpedienteReciente[]>([]);
  const [clientesConNieVenciendo, setClientesConNieVenciendo] = useState<ClienteAlerta[]>([]);
  const [expedientesSinMovimiento, setExpedientesSinMovimiento] = useState<ExpedienteSinMovimiento[]>([]);
  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    await Promise.all([fetchStats(), fetchExpedientesPorEstado(), fetchExpedientesPorMes(), fetchIngresosPorMes(), fetchTopTiposTramite(), fetchExpedientesRecientes(), fetchClientesConNieVenciendo(), fetchExpedientesSinMovimiento()]);
  };
  const fetchStats = async () => {
    const today = new Date();
    const firstDayOfMonth = startOfMonth(today);
    const lastDayOfMonth = endOfMonth(today);
    const [clientes, expedientesActivos, expedientesPendientes, pagos] = await Promise.all([supabase.from("clients").select("*", {
      count: "exact",
      head: true
    }), supabase.from("expedientes").select("*", {
      count: "exact",
      head: true
    }).in("estado", ["pendiente_documentos", "documentos_completos", "presentado", "en_tramite"]), supabase.from("expedientes").select("*", {
      count: "exact",
      head: true
    }).eq("estado", "pendiente_documentos"), supabase.from("payments").select("importe").gte("fecha_pago", format(firstDayOfMonth, "yyyy-MM-dd")).lte("fecha_pago", format(lastDayOfMonth, "yyyy-MM-dd"))]);
    const ingresosMesActual = pagos.data?.reduce((sum, p) => sum + Number(p.importe), 0) || 0;
    setStats({
      totalClientes: clientes.count || 0,
      expedientesActivos: expedientesActivos.count || 0,
      expedientesPendientes: expedientesPendientes.count || 0,
      ingresosMesActual
    });
  };
  const fetchExpedientesPorEstado = async () => {
    const {
      data
    } = await supabase.from("expedientes").select("estado");
    if (!data) return;
    const estadoCounts = data.reduce((acc, exp) => {
      acc[exp.estado] = (acc[exp.estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const chartData = Object.entries(estadoCounts).map(([estado, cantidad]) => ({
      estado: ESTADO_LABELS[estado] || estado,
      cantidad
    }));
    setExpedientesPorEstado(chartData);
  };
  const fetchExpedientesPorMes = async () => {
    const {
      data
    } = await supabase.from("expedientes").select("fecha_inicio").gte("fecha_inicio", format(subMonths(new Date(), 5), "yyyy-MM-dd")).order("fecha_inicio", {
      ascending: true
    });
    if (!data) return;
    const monthCounts: Record<string, number> = {};
    data.forEach(exp => {
      const monthKey = format(new Date(exp.fecha_inicio), "MMM yy", {
        locale: es
      });
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });
    const chartData = Object.entries(monthCounts).map(([mes, cantidad]) => ({
      mes,
      cantidad
    }));
    setExpedientesPorMes(chartData);
  };
  const fetchIngresosPorMes = async () => {
    const {
      data
    } = await supabase.from("payments").select("fecha_pago, importe").gte("fecha_pago", format(subMonths(new Date(), 5), "yyyy-MM-dd")).order("fecha_pago", {
      ascending: true
    });
    if (!data) return;
    const monthIngresos: Record<string, number> = {};
    data.forEach(pago => {
      const monthKey = format(new Date(pago.fecha_pago), "MMM yy", {
        locale: es
      });
      monthIngresos[monthKey] = (monthIngresos[monthKey] || 0) + Number(pago.importe);
    });
    const chartData = Object.entries(monthIngresos).map(([mes, ingresos]) => ({
      mes,
      ingresos
    }));
    setIngresosPorMes(chartData);
  };
  const fetchTopTiposTramite = async () => {
    const {
      data
    } = await supabase.from("expedientes").select("tipo_tramite_id, tipos_tramite!inner(nombre)");
    if (!data) return;
    const tramiteCounts: Record<string, number> = {};
    data.forEach(exp => {
      const nombre = exp.tipos_tramite.nombre;
      tramiteCounts[nombre] = (tramiteCounts[nombre] || 0) + 1;
    });
    const chartData = Object.entries(tramiteCounts).map(([nombre, cantidad]) => ({
      nombre,
      cantidad
    })).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);
    setTopTiposTramite(chartData);
  };
  const fetchExpedientesRecientes = async () => {
    const {
      data
    } = await supabase.from("expedientes").select(`
        id,
        numero_expediente,
        estado,
        fecha_inicio,
        clients!inner(nombre, apellidos),
        tipos_tramite!inner(nombre)
      `).order("created_at", {
      ascending: false
    }).limit(10);
    setExpedientesRecientes(data || []);
  };
  const fetchClientesConNieVenciendo = async () => {
    const {
      data
    } = await supabase.from("clients").select("id, nombre, apellidos, nie_pasaporte, fecha_vencimiento_nie").not("fecha_vencimiento_nie", "is", null);
    if (!data) return;
    const today = new Date();
    const alertas = data.map(cliente => {
      const fechaVencimiento = new Date(cliente.fecha_vencimiento_nie!);
      const diasRestantes = differenceInDays(fechaVencimiento, today);
      return {
        ...cliente,
        dias_restantes: diasRestantes
      };
    }).filter(c => c.dias_restantes <= 30 && c.dias_restantes >= 0).sort((a, b) => a.dias_restantes - b.dias_restantes);
    setClientesConNieVenciendo(alertas);
  };
  const fetchExpedientesSinMovimiento = async () => {
    const {
      data
    } = await supabase.from("expedientes").select(`
        id,
        numero_expediente,
        updated_at,
        clients!inner(nombre, apellidos)
      `).in("estado", ["pendiente_documentos", "documentos_completos", "presentado", "en_tramite"]);
    if (!data) return;
    const today = new Date();
    const sinMovimiento = data.map(exp => {
      const ultimaActualizacion = new Date(exp.updated_at);
      const diasSinMovimiento = differenceInDays(today, ultimaActualizacion);
      return {
        ...exp,
        dias_sin_movimiento: diasSinMovimiento
      };
    }).filter(e => e.dias_sin_movimiento > 30).sort((a, b) => b.dias_sin_movimiento - a.dias_sin_movimiento).slice(0, 5);
    setExpedientesSinMovimiento(sinMovimiento);
  };
  const getEstadoBadgeColor = (estado: string) => {
    const colors: Record<string, string> = {
      pendiente_documentos: "bg-yellow-500",
      documentos_completos: "bg-blue-500",
      presentado: "bg-purple-500",
      en_tramite: "bg-orange-500",
      aprobado: "bg-green-500",
      denegado: "bg-red-500",
      archivado: "bg-gray-500"
    };
    return colors[estado] || "bg-gray-500";
  };
  return <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general del sistema</p>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClientes}</div>
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
              <CardTitle className="text-sm font-medium">Pendientes Documentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.expedientesPendientes}</div>
            </CardContent>
          </Card>

          
        </div>

        {/* Alertas */}
        {(clientesConNieVenciendo.length > 0 || expedientesSinMovimiento.length > 0) && <div className="grid gap-4 md:grid-cols-2">
            {clientesConNieVenciendo.length > 0 && <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    NIE Próximos a Vencer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {clientesConNieVenciendo.map(cliente => <div key={cliente.id} className="flex justify-between items-center p-2 bg-orange-50 rounded border border-orange-200">
                        <div>
                          <p className="font-medium">
                            {cliente.nombre} {cliente.apellidos}
                          </p>
                          <p className="text-sm text-muted-foreground">{cliente.nie_pasaporte}</p>
                        </div>
                        <Badge variant="outline" className="bg-orange-100">
                          {cliente.dias_restantes} días
                        </Badge>
                      </div>)}
                  </div>
                </CardContent>
              </Card>}

            {expedientesSinMovimiento.length > 0 && <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-red-500" />
                    Expedientes Sin Movimiento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {expedientesSinMovimiento.map(exp => <div key={exp.id} className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-200 cursor-pointer hover:bg-red-100" onClick={() => navigate(`/expedientes/${exp.id}`)}>
                        <div>
                          <p className="font-medium">{exp.numero_expediente}</p>
                          <p className="text-sm text-muted-foreground">
                            {exp.clients.nombre} {exp.clients.apellidos}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-red-100">
                          {exp.dias_sin_movimiento} días
                        </Badge>
                      </div>)}
                  </div>
                </CardContent>
              </Card>}
          </div>}

        {/* Gráficos */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Expedientes por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={expedientesPorEstado} dataKey="cantidad" nameKey="estado" cx="50%" cy="50%" outerRadius={80} label>
                    {expedientesPorEstado.map((entry, index) => {
                    const estado = Object.keys(ESTADO_LABELS).find(k => ESTADO_LABELS[k] === entry.estado);
                    const color = estado ? ESTADO_COLORS[estado] : "#6b7280";
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 5 Tipos de Trámite</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTiposTramite.map((tramite, index) => <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{tramite.nombre}</span>
                        <span className="text-sm text-muted-foreground">{tramite.cantidad}</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full">
                        <div className="bg-primary h-2 rounded-full" style={{
                      width: `${tramite.cantidad / Math.max(...topTiposTramite.map(t => t.cantidad)) * 100}%`
                    }} />
                      </div>
                    </div>
                  </div>)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expedientes Creados (Últimos 6 Meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={expedientesPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cantidad" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          
        </div>

        {/* Expedientes Recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Expedientes Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo Trámite</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expedientesRecientes.length === 0 ? <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No hay expedientes recientes
                    </TableCell>
                  </TableRow> : expedientesRecientes.map(exp => <TableRow key={exp.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/expedientes/${exp.id}`)}>
                      <TableCell className="font-medium">{exp.numero_expediente}</TableCell>
                      <TableCell>
                        {exp.clients.nombre} {exp.clients.apellidos}
                      </TableCell>
                      <TableCell>{exp.tipos_tramite.nombre}</TableCell>
                      <TableCell>
                        <Badge className={getEstadoBadgeColor(exp.estado)}>
                          {ESTADO_LABELS[exp.estado] || exp.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(exp.fecha_inicio), "dd/MM/yyyy", {
                    locale: es
                  })}
                      </TableCell>
                    </TableRow>)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>;
}