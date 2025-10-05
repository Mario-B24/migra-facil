import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PagoStandaloneForm } from "@/components/pagos/PagoStandaloneForm";
import { Card } from "@/components/ui/card";

interface Pago {
  id: string;
  fecha_pago: string;
  importe: number;
  metodo_pago: string;
  concepto: string;
  expedientes: {
    numero_expediente: string;
  };
  clients: {
    nombre: string;
    apellidos: string;
  };
}

export default function Pagos() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMetodo, setFilterMetodo] = useState<string>("todos");
  const [fechaDesde, setFechaDesde] = useState<Date | undefined>();
  const [fechaHasta, setFechaHasta] = useState<Date | undefined>();
  const [openDialog, setOpenDialog] = useState(false);
  const [totalIngresos, setTotalIngresos] = useState(0);

  useEffect(() => {
    fetchPagos();
  }, [searchTerm, filterMetodo, fechaDesde, fechaHasta]);

  const fetchPagos = async () => {
    setLoading(true);
    let query = supabase
      .from("payments")
      .select(`
        id,
        fecha_pago,
        importe,
        metodo_pago,
        concepto,
        expedientes!inner(numero_expediente),
        clients!inner(nombre, apellidos)
      `)
      .order("fecha_pago", { ascending: false });

    if (searchTerm) {
      query = query.or(
        `clients.nombre.ilike.%${searchTerm}%,clients.apellidos.ilike.%${searchTerm}%,expedientes.numero_expediente.ilike.%${searchTerm}%`
      );
    }

    if (filterMetodo !== "todos") {
      query = query.eq("metodo_pago", filterMetodo);
    }

    if (fechaDesde) {
      query = query.gte("fecha_pago", format(fechaDesde, "yyyy-MM-dd"));
    }

    if (fechaHasta) {
      query = query.lte("fecha_pago", format(fechaHasta, "yyyy-MM-dd"));
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching pagos:", error);
      setLoading(false);
      return;
    }

    setPagos(data || []);
    
    const total = data?.reduce((sum, pago) => sum + parseFloat(pago.importe.toString()), 0) || 0;
    setTotalIngresos(total);
    
    setLoading(false);
  };

  const handleSuccess = () => {
    setOpenDialog(false);
    fetchPagos();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Pagos</h1>
            <p className="text-muted-foreground">Gestión de pagos e ingresos</p>
          </div>
          <Button onClick={() => setOpenDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Registrar Pago
          </Button>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente o expediente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterMetodo} onValueChange={setFilterMetodo}>
              <SelectTrigger>
                <SelectValue placeholder="Método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los métodos</SelectItem>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                <SelectItem value="bizum">Bizum</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !fechaDesde && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaDesde ? format(fechaDesde, "PPP", { locale: es }) : "Fecha desde"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fechaDesde}
                  onSelect={setFechaDesde}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !fechaHasta && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaHasta ? format(fechaHasta, "PPP", { locale: es }) : "Fecha hasta"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fechaHasta}
                  onSelect={setFechaHasta}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {(fechaDesde || fechaHasta || filterMetodo !== "todos") && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFechaDesde(undefined);
                  setFechaHasta(undefined);
                  setFilterMetodo("todos");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Total de Ingresos</h2>
            <p className="text-3xl font-bold text-green-600">{totalIngresos.toFixed(2)} €</p>
          </div>
        </Card>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Expediente</TableHead>
                <TableHead>Importe</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Concepto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Cargando pagos...
                  </TableCell>
                </TableRow>
              ) : pagos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay pagos registrados
                  </TableCell>
                </TableRow>
              ) : (
                pagos.map((pago) => (
                  <TableRow key={pago.id}>
                    <TableCell>
                      {format(new Date(pago.fecha_pago), "dd/MM/yyyy", { locale: es })}
                    </TableCell>
                    <TableCell>
                      {pago.clients.nombre} {pago.clients.apellidos}
                    </TableCell>
                    <TableCell>{pago.expedientes.numero_expediente}</TableCell>
                    <TableCell className="font-medium">{parseFloat(pago.importe.toString()).toFixed(2)} €</TableCell>
                    <TableCell className="capitalize">{pago.metodo_pago}</TableCell>
                    <TableCell>{pago.concepto || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Pago</DialogTitle>
          </DialogHeader>
          <PagoStandaloneForm
            onSuccess={handleSuccess}
            onCancel={() => setOpenDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
