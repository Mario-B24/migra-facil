import { useState, useEffect } from "react";
  import { useParams, useNavigate } from "react-router-dom";
  import { supabase } from "@/integrations/supabase/client";
  import { Button } from "@/components/ui/button";
  import { Card } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { Separator } from "@/components/ui/separator";
  import { Checkbox } from "@/components/ui/checkbox";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
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
  import { ArrowLeft, ExternalLink, FileText, Euro, History, Edit, Download } from "lucide-react";
  import { toast } from "sonner";
  import { format } from "date-fns";
  import { es } from "date-fns/locale";
  import { PagoForm } from "@/components/expedientes/PagoForm";
  import { downloadRecibo } from "@/lib/generateRecibo";

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
    const [documentos, setDocumentos] = useState<any[]>([]);
    const [historial, setHistorial] = useState<any[]>([]);
    const [pagos, setPagos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPagoDialog, setShowPagoDialog] = useState(false);
    const [showEstadoConfirm, setShowEstadoConfirm] = useState<string | null>(null);

    useEffect(() => {
      if (id) {
        fetchExpediente();
        fetchDocumentos();
        fetchHistorial();
        fetchPagos();
      }
    }, [id]);

    const fetchExpediente = async () => {
      try {
        const { data, error } = await supabase
          .from("expedientes")
          .select(`
            *,
            clients:cliente_id (
              id,
              nombre,
              apellidos,
              email,
              telefono,
              nie_pasaporte
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

    const fetchDocumentos = async () => {
      try {
        const { data, error } = await supabase
          .from("expediente_documentos")
          .select(`
            *,
            documentos_requeridos:documento_requerido_id (
              nombre_documento,
              descripcion
            )
          `)
          .eq("expediente_id", id)
          .order("created_at");

        if (error) throw error;
        setDocumentos(data || []);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const fetchHistorial = async () => {
      try {
        const { data, error } = await supabase
          .from("historial_estados")
          .select("*")
          .eq("expediente_id", id)
          .order("fecha_cambio", { ascending: false });

        if (error) throw error;
        setHistorial(data || []);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const fetchPagos = async () => {
      try {
        const { data, error } = await supabase
          .from("payments")
          .select("*")
          .eq("expediente_id", id)
          .order("fecha_pago", { ascending: false });

        if (error) throw error;
        setPagos(data || []);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const handleDescargarRecibo = (pago: any) => {
      if (!expediente || !expediente.clients) return;

      const numeroRecibo = `${expediente.numero_expediente}/${pago.id.substring(0, 8)}`;

      downloadRecibo({
        numeroRecibo,
        cliente: {
          nombre: expediente.clients.nombre,
          apellidos: expediente.clients.apellidos,
          email: expediente.clients.email || '',
          telefono: expediente.clients.telefono || '',
          nie_pasaporte: expediente.clients.nie_pasaporte || '',
        },
        expediente: {
          numero_expediente: expediente.numero_expediente,
          tipo_tramite: expediente.tipos_tramite?.nombre || '',
          fecha_inicio: expediente.fecha_inicio,
          precio_acordado: expediente.precio_acordado,
        },
        pago: {
          fecha_pago: pago.fecha_pago,
          importe: parseFloat(pago.importe),
          metodo_pago: pago.metodo_pago || 'efectivo',
          concepto: pago.concepto,
        },
        totales: {
          precioAcordado: expediente.precio_acordado,
          totalPagado: totalPagado,
          pendiente: expediente.precio_acordado - totalPagado,
          estePago: parseFloat(pago.importe),
        },
      });
    };

    const handleDocumentoCheck = async (docId: string, checked: boolean) => {
      try {
        const { error } = await supabase
          .from("expediente_documentos")
          .update({
            estado_documento: checked ? "recibido" : "pendiente",
            fecha_recibido: checked ? new Date().toISOString() : null,
          })
          .eq("id", docId);

        if (error) throw error;

        await fetchDocumentos();

        const { data: allDocs } = await supabase
          .from("expediente_documentos")
          .select("estado_documento")
          .eq("expediente_id", id);

        if (allDocs) {
          const allRecibidos = allDocs.every(d => d.estado_documento === "recibido");

          if (allRecibidos && expediente?.estado === "pendiente_documentos") {
            await handleEstadoChange("documentos_completos");
          }
        }

        toast.success(checked ? "Documento marcado como recibido" : "Documento marcado como pendiente");
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error al actualizar el documento");
      }
    };

    const handleEstadoChange = async (nuevoEstado: string) => {
      try {
        const { error: updateError } = await supabase
          .from("expedientes")
          .update({ estado: nuevoEstado })
          .eq("id", id);

        if (updateError) throw updateError;

        toast.success("Estado actualizado correctamente");
        setShowEstadoConfirm(null);
        fetchExpediente();
        fetchHistorial();
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error al actualizar el estado");
      }
    };

    if (loading) {
      return (
        <div className="p-8">
          <p>Cargando expediente...</p>
        </div>
      );
    }

    if (!expediente) {
      return (
        <div className="p-8">
          <p>Expediente no encontrado</p>
          <Button onClick={() => navigate("/expedientes")} className="mt-4">
            Volver a Expedientes
          </Button>
        </div>
      );
    }

    const documentosRecibidos = documentos.filter(d => d.estado_documento === "recibido").length;
    const totalDocumentos = documentos.length;
    const totalPagado = pagos.reduce((sum, p) => sum + parseFloat(p.importe || 0), 0);

    return (
      <div className="p-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/expedientes")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Expedientes
        </Button>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold">
                  Expediente {expediente.numero_expediente}
                </h1>
                <p className="text-muted-foreground">
                  {expediente.tipos_tramite?.nombre}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className={estadoColors[expediente.estado] || ""}
                >
                  {estadoLabels[expediente.estado] || expediente.estado}
                </Badge>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Cliente</h3>
                <div className="flex items-center gap-2">
                  <span>
                    {expediente.clients?.apellidos}, {expediente.clients?.nombre}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/clientes/${expediente.cliente_id}`)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {expediente.clients?.email}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Cambiar Estado</h3>
                <Select
                  value={expediente.estado}
                  onValueChange={(value) => setShowEstadoConfirm(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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

              <div>
                <h3 className="font-semibold mb-2">Fecha de Inicio</h3>
                <p>
                  {expediente.fecha_inicio
                    ? format(new Date(expediente.fecha_inicio), "PPP", { locale: es })
                    : "N/A"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Fecha de Presentación</h3>
                <p>
                  {expediente.fecha_presentacion
                    ? format(new Date(expediente.fecha_presentacion), "PPP", { locale: es })
                    : "No presentado"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Nº Expediente Oficial</h3>
                <p>{expediente.numero_expediente_oficial || "No asignado"}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Precio Acordado</h3>
                <p>{expediente.precio_acordado}€</p>
              </div>
            </div>

            {expediente.observaciones && (
              <>
                <Separator className="my-4" />
                <div>
                  <h3 className="font-semibold mb-2">Observaciones</h3>
                  <p className="text-muted-foreground">{expediente.observaciones}</p>
                </div>
              </>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Documentos Requeridos</h2>
              </div>
              <Badge variant="outline">
                {documentosRecibidos} de {totalDocumentos} recibidos
              </Badge>
            </div>

            <div className="space-y-3">
              {documentos.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                >
                  <Checkbox
                    checked={doc.estado_documento === "recibido"}
                    onCheckedChange={(checked) =>
                      handleDocumentoCheck(doc.id, checked as boolean)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {doc.documentos_requeridos?.nombre_documento}
                      </p>
                      <Badge
                        variant={doc.estado_documento === "recibido" ? "default" : "secondary"}
                      >
                        {doc.estado_documento === "recibido" ? "Recibido" : "Pendiente"}
                      </Badge>
                    </div>
                    {doc.documentos_requeridos?.descripcion && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {doc.documentos_requeridos.descripcion}
                      </p>
                    )}
                    {doc.fecha_recibido && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Recibido el {format(new Date(doc.fecha_recibido), "PPP", { locale: es })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Historial de Estados</h2>
            </div>

            <div className="space-y-4">
              {historial.map((item, index) => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    {index < historial.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2">
                      {item.estado_anterior && (
                        <>
                          <Badge variant="outline" className="text-xs">
                            {estadoLabels[item.estado_anterior] || item.estado_anterior}
                          </Badge>
                          <span className="text-muted-foreground">→</span>
                        </>
                      )}
                      <Badge variant="outline" className={`text-xs ${estadoColors[item.estado_nuevo]}`}>
                        {estadoLabels[item.estado_nuevo] || item.estado_nuevo}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(item.fecha_cambio), "PPP 'a las' p", { locale: es })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Pagos</h2>
              </div>
              <Button onClick={() => setShowPagoDialog(true)}>
                Registrar Pago
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Total</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {expediente.precio_acordado.toFixed(2)}€
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Pagado</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {totalPagado.toFixed(2)}€
                </p>
              </div>
              <div className={`${
                expediente.precio_acordado - totalPagado > 0
                  ? 'bg-orange-50 dark:bg-orange-950'
                  : 'bg-gray-50 dark:bg-gray-950'
              } p-4 rounded-lg text-center`}>
                <p className="text-sm text-muted-foreground mb-1">Pendiente</p>
                <p className={`text-2xl font-bold ${
                  expediente.precio_acordado - totalPagado > 0
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {(expediente.precio_acordado - totalPagado).toFixed(2)}€
                </p>
              </div>
            </div>

            {pagos.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-muted rounded-lg font-medium text-sm">
                  <div>Fecha</div>
                  <div>Concepto</div>
                  <div>Método</div>
                  <div className="text-right">Importe</div>
                  <div className="text-right">Acciones</div>
                </div>
                {pagos.map((pago) => (
                  <div
                    key={pago.id}
                    className="grid grid-cols-5 gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors items-center"
                  >
                    <div>
                      <p className="font-medium">
                        {format(new Date(pago.fecha_pago), "dd/MM/yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(pago.fecha_pago), "PPP", { locale: es })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">{pago.concepto || expediente.tipos_tramite?.nombre || '-'}</p>
                    </div>
                    <div>
                      <Badge variant="outline" className="capitalize">
                        {pago.metodo_pago || 'efectivo'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{parseFloat(pago.importe).toFixed(2)}€</p>
                    </div>
                    <div className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDescargarRecibo(pago)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar Recibo
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <Euro className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No hay pagos registrados</p>
              </div>
            )}
          </Card>
        </div>

        <Dialog open={showPagoDialog} onOpenChange={setShowPagoDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Pago</DialogTitle>
              <DialogDescription>
                Complete los datos del pago realizado
              </DialogDescription>
            </DialogHeader>
            <PagoForm
              expedienteId={id!}
              clienteId={expediente.cliente_id}
              onSuccess={() => {
                setShowPagoDialog(false);
                fetchPagos();
              }}
              onCancel={() => setShowPagoDialog(false)}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={showEstadoConfirm !== null}
          onOpenChange={() => setShowEstadoConfirm(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar cambio de estado</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Está seguro de que desea cambiar el estado del expediente a{" "}
                <strong>{showEstadoConfirm ? estadoLabels[showEstadoConfirm] : ""}</strong>?
                Este cambio se registrará en el historial.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => showEstadoConfirm && handleEstadoChange(showEstadoConfirm)}
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }