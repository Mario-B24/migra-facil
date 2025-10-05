import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const formSchema = z.object({
  nombre_gestoria: z.string().min(1, "El nombre es obligatorio"),
  logo_url: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  codigo_postal: z.string().optional(),
  formato_numeracion: z.string().min(1, "El formato de numeración es obligatorio"),
});

type FormValues = z.infer<typeof formSchema>;

export function GestoriaConfigForm() {
  const [loading, setLoading] = useState(false);
  const [configId, setConfigId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre_gestoria: "",
      logo_url: "",
      telefono: "",
      email: "",
      direccion: "",
      ciudad: "",
      codigo_postal: "",
      formato_numeracion: "YY/XXX",
    },
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const { data } = await supabase
      .from("gestoria_config")
      .select("*")
      .single();

    if (data) {
      setConfigId(data.id);
      form.reset({
        nombre_gestoria: data.nombre_gestoria,
        logo_url: data.logo_url || "",
        telefono: data.telefono || "",
        email: data.email || "",
        direccion: data.direccion || "",
        ciudad: data.ciudad || "",
        codigo_postal: data.codigo_postal || "",
        formato_numeracion: data.formato_numeracion || "YY/XXX",
      });
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!configId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("gestoria_config")
        .update({
          nombre_gestoria: values.nombre_gestoria,
          logo_url: values.logo_url || null,
          telefono: values.telefono || null,
          email: values.email || null,
          direccion: values.direccion || null,
          ciudad: values.ciudad || null,
          codigo_postal: values.codigo_postal || null,
          formato_numeracion: values.formato_numeracion,
        })
        .eq("id", configId);

      if (error) throw error;
      toast.success("Configuración actualizada correctamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar la configuración");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre_gestoria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Gestoría *</FormLabel>
              <FormControl>
                <Input placeholder="Mi Gestoría" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logo_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL del Logo</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="+34 XXX XXX XXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="contacto@gestoria.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Textarea placeholder="Calle, número..." rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ciudad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciudad</FormLabel>
                <FormControl>
                  <Input placeholder="Madrid" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="codigo_postal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Postal</FormLabel>
                <FormControl>
                  <Input placeholder="28001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="formato_numeracion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Formato de Numeración de Expedientes *</FormLabel>
              <FormControl>
                <Input placeholder="YY/XXX" {...field} />
              </FormControl>
              <FormDescription>
                YY = Año (ej: 25), XXX = Número correlativo (ej: 001)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Configuración"}
        </Button>
      </form>
    </Form>
  );
}
