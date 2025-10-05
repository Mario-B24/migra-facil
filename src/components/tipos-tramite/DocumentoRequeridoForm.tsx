import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  nombre_documento: z.string().min(1, "El nombre del documento es obligatorio"),
  descripcion: z.string().optional(),
  orden: z.string().min(0, "El orden debe ser mayor o igual a 0"),
  active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface DocumentoRequeridoFormProps {
  tipoTramiteId: string;
  documento?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DocumentoRequeridoForm({ 
  tipoTramiteId, 
  documento, 
  onSuccess, 
  onCancel 
}: DocumentoRequeridoFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre_documento: documento?.nombre_documento || "",
      descripcion: documento?.descripcion || "",
      orden: documento?.orden?.toString() || "0",
      active: documento?.active ?? true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const data = {
        tipo_tramite_id: tipoTramiteId,
        nombre_documento: values.nombre_documento,
        descripcion: values.descripcion || null,
        orden: parseInt(values.orden),
        active: values.active,
      };

      if (documento) {
        const { error } = await supabase
          .from("documentos_requeridos")
          .update(data)
          .eq("id", documento.id);

        if (error) throw error;
        toast.success("Documento actualizado correctamente");
      } else {
        const { error } = await supabase
          .from("documentos_requeridos")
          .insert(data);

        if (error) throw error;
        toast.success("Documento creado correctamente");
      }

      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar el documento");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre_documento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Documento *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Pasaporte vigente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descripción adicional del documento..."
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="orden"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orden</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Activo</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {documento ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
