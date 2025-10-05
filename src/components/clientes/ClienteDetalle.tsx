import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Edit, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { ClienteForm } from "./ClienteForm";

type Cliente = Tables<"clients">;
type Expediente = Tables<"expedientes">;
type Payment = Tables<"payments">;

export default function ClienteDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [pagos, setPagos] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchClienteData();
    }
  }, [id]);

  const fetchClienteData = async () => {
    if (!id) return;

    setLoading(true);

    const [clienteResult, expedientesResult, pagosResult] = await Promise.all([
      supabase.from("clients").select("*").eq("id", id).maybeSingle(),
      supabase.from("expedientes").select("*, tipos_tramite(nombre)").eq("cliente_id", id).order("created_at", { ascending: false }),
      supabase.from("payments").select("*").eq("cliente_id", id).order("fecha_pago", { ascending: false }),
    ]);

    if (clienteResult.error) {
      toast.error("Error al cargar cliente");
      navigate("/clientes");
      return;
    }

    if (clienteResult.data) {
      setCliente(clienteResult.data);
    }

    if (!expedientesResult.error && expedientesResult.data) {
      setExpedientes(expedientesResult.data);
    }

    if (!pagosResult.error && pagosResult.data) {
      setPagos(pagosResult.data);
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (!id) return;

    const { error } = await supabase.from("clients").delete().eq("id", id);

    if (error) {
      toast.error("Error al eliminar cliente");
    } else {
      toast.success("Cliente eliminado correctamente");
      navigate("/clientes");
    }
  };

  const handleEdit = async (data: any) => {
    if (!id) return;

    const { error } = await supabase
      .from("clients")
      .update({
        ...data,
        fecha_vencimiento_nie: data.fecha_vencimiento_nie ? format(data.fecha_vencimiento_nie, "yyyy-MM-dd") : null,
        fecha_nacimiento: data.fecha_nacimiento ? format(data.fecha_nacimiento, "yyyy-MM-dd") : null,
      })
      .eq("id", id);

    if (error) {
      toast.error("Error al actualizar cliente");
    } else {
      toast.success("Cliente actualizado correctamente");
      setShowEditDialog(false);
      fetchClienteData();
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Cargando...</div>
        </div>
      </MainLayout>
    );
  }

  if (!cliente) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Cliente no encontrado</div>
        </div>
      </MainLayout>
    );
  }

  const totalPagado = pagos.reduce((sum, pago) => sum + Number(pago.importe), 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/clientes")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {cliente.nombre} {cliente.apellidos}
              </h1>
              <p className="text-muted-foreground">NIE/Pasaporte: {cliente.nie_pasaporte}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" onClick={() => navigate(`/expedientes/nuevo?cliente_id=${id}`)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Expediente
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Email:</span>
                <p className="font-medium">{cliente.email || "-"}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Teléfono:</span>
                <p className="font-medium">{cliente.telefono || "-"}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Nacionalidad:</span>
                <p className="font-medium">{cliente.nacionalidad || "-"}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Fecha de Nacimiento:</span>
                <p className="font-medium">
                  {cliente.fecha_nacimiento ? format(new Date(cliente.fecha_nacimiento), "dd/MM/yyyy") : "-"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Vencimiento NIE:</span>
                <p className="font-medium">
                  {cliente.fecha_vencimiento_nie ? format(new Date(cliente.fecha_vencimiento_nie), "dd/MM/yyyy") : "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dirección</CardTitle>
            </CardHeader>
            <CardContent>
              {cliente.calle || cliente.numero ? (
                <p className="font-medium">
                  {cliente.calle} {cliente.numero}
                  {cliente.piso && `, ${cliente.piso}`}
                  {cliente.puerta && ` ${cliente.puerta}`}
                </p>
              ) : (
                <p className="text-muted-foreground">No especificada</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{cliente.observaciones || "Sin observaciones"}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expedientes ({expedientes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {expedientes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay expedientes registrados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">Número</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">Fecha Inicio</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">Precio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {expedientes.map((exp: any) => (
                      <tr key={exp.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/expedientes/${exp.id}`)}>
                        <td className="px-4 py-3">{exp.numero_expediente}</td>
                        <td className="px-4 py-3">{exp.tipos_tramite?.nombre || "-"}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{exp.estado}</Badge>
                        </td>
                        <td className="px-4 py-3">{format(new Date(exp.fecha_inicio), "dd/MM/yyyy")}</td>
                        <td className="px-4 py-3">{Number(exp.precio_acordado).toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Pagos ({pagos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pagos.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay pagos registrados</p>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Fecha</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Concepto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Método</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase">Importe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pagos.map((pago) => (
                        <tr key={pago.id} className="hover:bg-muted/50">
                          <td className="px-4 py-3">{format(new Date(pago.fecha_pago), "dd/MM/yyyy")}</td>
                          <td className="px-4 py-3">{pago.concepto || "-"}</td>
                          <td className="px-4 py-3">{pago.metodo_pago || "-"}</td>
                          <td className="px-4 py-3 text-right font-medium">{Number(pago.importe).toFixed(2)} €</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end pt-4 border-t">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Pagado</p>
                    <p className="text-2xl font-bold">{totalPagado.toFixed(2)} €</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el cliente y todos sus expedientes y pagos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <ClienteForm cliente={cliente} onSubmit={handleEdit} onCancel={() => setShowEditDialog(false)} />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
