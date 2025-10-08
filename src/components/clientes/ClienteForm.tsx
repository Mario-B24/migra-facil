import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tables } from "@/integrations/supabase/types";

type Cliente = Tables<"clients">;

// Helper para convertir DD/MM/YYYY a Date
const parseDate = (dateStr: string): Date | null => {
  if (!dateStr || dateStr.trim() === "") return null;
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  return new Date(year, month, day);
};

// Helper para convertir Date a DD/MM/YYYY
const formatDate = (date: Date | null | undefined): string => {
  if (!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const clienteSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(255),
  apellidos: z.string().trim().min(1, "Los apellidos son obligatorios").max(255),
  email: z.string().trim().email("Email inválido").max(255),
  telefono: z.string().trim().min(1, "El teléfono es obligatorio").max(50),
  nacionalidad: z.string().trim().min(1, "La nacionalidad es obligatoria").max(100),
  nie_pasaporte: z.string().trim().min(1, "NIE/Pasaporte es obligatorio").max(50),
  fecha_vencimiento_nie: z.string().trim().optional().or(z.literal("")),
  fecha_nacimiento: z.string().trim().optional().or(z.literal("")),
  calle: z.string().trim().max(255).optional().or(z.literal("")),
  numero: z.string().trim().max(20).optional().or(z.literal("")),
  piso: z.string().trim().max(20).optional().or(z.literal("")),
  puerta: z.string().trim().max(20).optional().or(z.literal("")),
  observaciones: z.string().trim().max(5000).optional().or(z.literal("")),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

interface ClienteFormProps {
  cliente?: Cliente;
  onSubmit: (data: ClienteFormData) => Promise<void>;
  onCancel: () => void;
}

export function ClienteForm({ cliente, onSubmit, onCancel }: ClienteFormProps) {
  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: cliente?.nombre || "",
      apellidos: cliente?.apellidos || "",
      email: cliente?.email || "",
      telefono: cliente?.telefono || "",
      nacionalidad: cliente?.nacionalidad || "",
      nie_pasaporte: cliente?.nie_pasaporte || "",
      fecha_vencimiento_nie: formatDate(
        cliente?.fecha_vencimiento_nie ? new Date(cliente.fecha_vencimiento_nie) : null,
      ),
      fecha_nacimiento: formatDate(cliente?.fecha_nacimiento ? new Date(cliente.fecha_nacimiento) : null),
      calle: cliente?.calle || "",
      numero: cliente?.numero || "",
      piso: cliente?.piso || "",
      puerta: cliente?.puerta || "",
      observaciones: cliente?.observaciones || "",
    },
  });

  const handleSubmit = async (data: ClienteFormData) => {
    // Convertir las fechas de string a Date antes de enviar
    const formattedData = {
      ...data,
      fecha_vencimiento_nie: parseDate(data.fecha_vencimiento_nie || ""),
      fecha_nacimiento: parseDate(data.fecha_nacimiento || ""),
    };
    await onSubmit(formattedData as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apellidos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellidos *</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nacionalidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nacionalidad *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nie_pasaporte"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIE/Pasaporte *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fecha_vencimiento_nie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha Vencimiento NIE</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="DD/MM/YYYY" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fecha_nacimiento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Nacimiento</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="DD/MM/YYYY" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Dirección</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="calle"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Calle</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="piso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Piso</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="puerta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Puerta</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="observaciones"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">{cliente ? "Actualizar" : "Crear"} Cliente</Button>
        </div>
      </form>
    </Form>
  );
}
