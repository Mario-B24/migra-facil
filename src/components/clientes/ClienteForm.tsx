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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";

type Cliente = Tables<"clients">;

const clienteSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(255),
  apellidos: z.string().trim().min(1, "Los apellidos son obligatorios").max(255),
  email: z.string().trim().email("Email inválido").max(255),
  telefono: z.string().trim().min(1, "El teléfono es obligatorio").max(50),
  nacionalidad: z.string().trim().min(1, "La nacionalidad es obligatoria").max(100),
  nie_pasaporte: z.string().trim().min(1, "NIE/Pasaporte es obligatorio").max(50),
  fecha_vencimiento_nie: z.date().optional().nullable(),
  fecha_nacimiento: z.date().optional().nullable(),
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
      fecha_vencimiento_nie: cliente?.fecha_vencimiento_nie ? new Date(cliente.fecha_vencimiento_nie) : undefined,
      fecha_nacimiento: cliente?.fecha_nacimiento ? new Date(cliente.fecha_nacimiento) : undefined,
      calle: cliente?.calle || "",
      numero: cliente?.numero || "",
      piso: cliente?.piso || "",
      puerta: cliente?.puerta || "",
      observaciones: cliente?.observaciones || "",
    },
  });

  const handleSubmit = async (data: ClienteFormData) => {
    await onSubmit(data);
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
              <FormItem className="flex flex-col">
                <FormLabel>Fecha Vencimiento NIE</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fecha_nacimiento"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Nacimiento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
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
          <Button type="submit">
            {cliente ? "Actualizar" : "Crear"} Cliente
          </Button>
        </div>
      </form>
    </Form>
  );
}
