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
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  codigo: z.string().min(1, "El código es obligatorio"),
  precio_base: z.string().min(0, "El precio debe ser mayor o igual a 0"),
  active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface TipoTramiteFormProps {
  tipoTramite?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TipoTramiteForm({ tipoTramite, onSuccess, onCancel }: TipoTramiteFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: tipoTramite?.nombre || "",
      codigo: tipoTramite?.codigo || "",
      precio_base: tipoTramite?.precio_base?.toString() || "0",
      active: tipoTramite?.active ?? true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const data = {
        nombre: values.nombre,
        codigo: values.codigo,
        precio_base: parseFloat(values.precio_base),
        active: values.active,
      };

      if (tipoTramite) {
        const { error } = await supabase
          .from("tipos_tramite")
          .update(data)
          .eq("id", tipoTramite.id);

        if (error) throw error;
        toast.success("Tipo de trámite actualizado correctamente");
      } else {
        const { error } = await supabase
          .from("tipos_tramite")
          .insert(data);

        if (error) throw error;
        toast.success("Tipo de trámite creado correctamente");
      }

      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar el tipo de trámite");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Renovación TIE" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="codigo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: REN-TIE" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="precio_base"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio Base (€)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
            {tipoTramite ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
