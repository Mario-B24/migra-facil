import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { TipoTramiteForm } from "@/components/tipos-tramite/TipoTramiteForm";
import { DocumentoRequeridoForm } from "@/components/tipos-tramite/DocumentoRequeridoForm";

export default function TiposTramite() {
  const [tiposTramite, setTiposTramite] = useState<any[]>([]);
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [selectedTipoTramite, setSelectedTipoTramite] = useState<string | null>(null);
  const [showTipoDialog, setShowTipoDialog] = useState(false);
  const [showDocDialog, setShowDocDialog] = useState(false);
  const [editingTipo, setEditingTipo] = useState<any>(null);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "tipo" | "doc"; id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTiposTramite();
  }, []);

  useEffect(() => {
    if (selectedTipoTramite) {
      fetchDocumentos(selectedTipoTramite);
    }
  }, [selectedTipoTramite]);

  const fetchTiposTramite = async () => {
    try {
      const { data, error } = await supabase
        .from("tipos_tramite")
        .select("*")
        .order("nombre");

      if (error) throw error;
      setTiposTramite(data || []);
      if (data && data.length > 0 && !selectedTipoTramite) {
        setSelectedTipoTramite(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching tipos:", error);
      toast.error("Error al cargar los tipos de trámite");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentos = async (tipoTramiteId: string) => {
    try {
      const { data, error } = await supabase
        .from("documentos_requeridos")
        .select("*")
        .eq("tipo_tramite_id", tipoTramiteId)
        .order("orden");

      if (error) throw error;
      setDocumentos(data || []);
    } catch (error) {
      console.error("Error fetching documentos:", error);
      toast.error("Error al cargar los documentos");
    }
  };

  const handleToggleTipoActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from("tipos_tramite")
        .update({ active })
        .eq("id", id);

      if (error) throw error;
      toast.success(active ? "Tipo de trámite activado" : "Tipo de trámite desactivado");
      fetchTiposTramite();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar el estado");
    }
  };

  const handleToggleDocActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from("documentos_requeridos")
        .update({ active })
        .eq("id", id);

      if (error) throw error;
      toast.success(active ? "Documento activado" : "Documento desactivado");
      if (selectedTipoTramite) fetchDocumentos(selectedTipoTramite);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar el estado");
    }
  };

  const handleDeleteTipo = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tipos_tramite")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Tipo de trámite eliminado");
      setDeleteConfirm(null);
      fetchTiposTramite();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar el tipo de trámite");
    }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      const { error } = await supabase
        .from("documentos_requeridos")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Documento eliminado");
      setDeleteConfirm(null);
      if (selectedTipoTramite) fetchDocumentos(selectedTipoTramite);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar el documento");
    }
  };

  const handleReorderDoc = async (docId: string, direction: "up" | "down") => {
    const docIndex = documentos.findIndex(d => d.id === docId);
    if (docIndex === -1) return;
    
    const doc = documentos[docIndex];
    const swapIndex = direction === "up" ? docIndex - 1 : docIndex + 1;
    
    if (swapIndex < 0 || swapIndex >= documentos.length) return;
    
    const swapDoc = documentos[swapIndex];
    
    try {
      const { error: error1 } = await supabase
        .from("documentos_requeridos")
        .update({ orden: swapDoc.orden })
        .eq("id", doc.id);

      const { error: error2 } = await supabase
        .from("documentos_requeridos")
        .update({ orden: doc.orden })
        .eq("id", swapDoc.id);

      if (error1 || error2) throw error1 || error2;
      
      if (selectedTipoTramite) fetchDocumentos(selectedTipoTramite);
      toast.success("Orden actualizado");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al reordenar");
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tipos de Trámite y Documentos</h1>
        <p className="text-muted-foreground">
          Gestiona los tipos de trámite y sus documentos requeridos
        </p>
      </div>

      <Tabs defaultValue="tipos" className="w-full">
        <TabsList>
          <TabsTrigger value="tipos">Tipos de Trámite</TabsTrigger>
          <TabsTrigger value="documentos">Documentos Requeridos</TabsTrigger>
        </TabsList>

        <TabsContent value="tipos" className="space-y-4">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Tipos de Trámite</h2>
              <Button
                onClick={() => {
                  setEditingTipo(null);
                  setShowTipoDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Tipo
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Precio Base</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiposTramite.map((tipo) => (
                  <TableRow key={tipo.id}>
                    <TableCell className="font-medium">{tipo.nombre}</TableCell>
                    <TableCell>{tipo.codigo}</TableCell>
                    <TableCell>{tipo.precio_base}€</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={tipo.active}
                          onCheckedChange={(checked) =>
                            handleToggleTipoActive(tipo.id, checked)
                          }
                        />
                        <Badge variant={tipo.active ? "default" : "secondary"}>
                          {tipo.active ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingTipo(tipo);
                          setShowTipoDialog(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setDeleteConfirm({ type: "tipo", id: tipo.id })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="space-y-4">
          <Card className="p-6">
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">
                Seleccionar Tipo de Trámite
              </label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={selectedTipoTramite || ""}
                onChange={(e) => setSelectedTipoTramite(e.target.value)}
              >
                {tiposTramite.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            {selectedTipoTramite && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Documentos Requeridos</h2>
                  <Button
                    onClick={() => {
                      setEditingDoc(null);
                      setShowDocDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Documento
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Orden</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentos.map((doc, index) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              disabled={index === 0}
                              onClick={() => handleReorderDoc(doc.id, "up")}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              disabled={index === documentos.length - 1}
                              onClick={() => handleReorderDoc(doc.id, "down")}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {doc.nombre_documento}
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {doc.descripcion || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={doc.active}
                              onCheckedChange={(checked) =>
                                handleToggleDocActive(doc.id, checked)
                              }
                            />
                            <Badge variant={doc.active ? "default" : "secondary"}>
                              {doc.active ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingDoc(doc);
                              setShowDocDialog(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setDeleteConfirm({ type: "doc", id: doc.id })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showTipoDialog} onOpenChange={setShowTipoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTipo ? "Editar Tipo de Trámite" : "Nuevo Tipo de Trámite"}
            </DialogTitle>
            <DialogDescription>
              Complete los datos del tipo de trámite
            </DialogDescription>
          </DialogHeader>
          <TipoTramiteForm
            tipoTramite={editingTipo}
            onSuccess={() => {
              setShowTipoDialog(false);
              setEditingTipo(null);
              fetchTiposTramite();
            }}
            onCancel={() => {
              setShowTipoDialog(false);
              setEditingTipo(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showDocDialog} onOpenChange={setShowDocDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDoc ? "Editar Documento" : "Nuevo Documento"}
            </DialogTitle>
            <DialogDescription>
              Complete los datos del documento requerido
            </DialogDescription>
          </DialogHeader>
          {selectedTipoTramite && (
            <DocumentoRequeridoForm
              tipoTramiteId={selectedTipoTramite}
              documento={editingDoc}
              onSuccess={() => {
                setShowDocDialog(false);
                setEditingDoc(null);
                fetchDocumentos(selectedTipoTramite);
              }}
              onCancel={() => {
                setShowDocDialog(false);
                setEditingDoc(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el{" "}
              {deleteConfirm?.type === "tipo"
                ? "tipo de trámite"
                : "documento requerido"}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm?.type === "tipo") {
                  handleDeleteTipo(deleteConfirm.id);
                } else if (deleteConfirm?.type === "doc") {
                  handleDeleteDoc(deleteConfirm.id);
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
