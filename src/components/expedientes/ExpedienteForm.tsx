import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  cliente_id: z.string().min(1, "Debe seleccionar un cliente"),
  tipo_tramite_id: z.string().min(1, "Debe seleccionar un tipo de trámite"),
  fecha_inicio: z.date({ required_error: "La fecha de inicio es obligatoria" }),
  precio_acordado: z.string().min(0),
  observaciones: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ExpedienteFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ExpedienteForm({ onSuccess, onCancel }: ExpedienteFormProps) {
  const [clientes, setClientes] = useState<any[]>([]);
  const [tiposTramite, setTiposTramite] = useState<any[]>([]);
  const [openClienteCombo, setOpenClienteCombo] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente_id: "",
      tipo_tramite_id: "",
      precio_acordado: "0",
      observaciones: "",
    },
  });

  useEffect(() => {
    fetchClientes();
    fetchTiposTramite();
  }, []);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, nombre, apellidos, email")
        .order("apellidos");

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar clientes");
    }
  };

  const fetchTiposTramite = async () => {
    try {
      const { data, error } = await supabase
        .from("tipos_tramite")
        .select("id, nombre, precio_base")
        .eq("active", true)
        .order("nombre");

      if (error) throw error;
      setTiposTramite(data || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar tipos de trámite");
    }
  };

  const generateNumeroExpediente = async () => {
    const year = new Date().getFullYear().toString().slice(-2);
    
    const { data, error } = await supabase
      .from("expedientes")
      .select("numero_expediente")
      .like("numero_expediente", `${year}/%`)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) throw error;

    let correlativo = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].numero_expediente.split("/")[1];
      correlativo = parseInt(lastNumber) + 1;
    }

    return `${year}/${correlativo.toString().padStart(3, "0")}`;
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const numeroExpediente = await generateNumeroExpediente();

      const { data: expediente, error: expedienteError } = await supabase
        .from("expedientes")
        .insert({
          numero_expediente: numeroExpediente,
          cliente_id: values.cliente_id,
          tipo_tramite_id: values.tipo_tramite_id,
          fecha_inicio: format(values.fecha_inicio, "yyyy-MM-dd"),
          precio_acordado: parseFloat(values.precio_acordado),
          observaciones: values.observaciones || null,
          estado: "pendiente_documentos",
        })
        .select()
        .single();

      if (expedienteError) throw expedienteError;

      const { data: documentosRequeridos, error: docError } = await supabase
        .from("documentos_requeridos")
        .select("id")
        .eq("tipo_tramite_id", values.tipo_tramite_id)
        .eq("active", true);

      if (docError) throw docError;

      if (documentosRequeridos && documentosRequeridos.length > 0) {
        const expedienteDocumentos = documentosRequeridos.map((doc) => ({
          expediente_id: expediente.id,
          documento_requerido_id: doc.id,
          estado_documento: "pendiente",
        }));

        const { error: docInsertError } = await supabase
          .from("expediente_documentos")
          .insert(expedienteDocumentos);

        if (docInsertError) throw docInsertError;
      }

      const { data: userData } = await supabase.auth.getUser();
      
      const { error: historialError } = await supabase
        .from("historial_estados")
        .insert({
          expediente_id: expediente.id,
          estado_anterior: null,
          estado_nuevo: "pendiente_documentos",
          usuario_id: userData?.user?.id || null,
        });

      if (historialError) throw historialError;

      toast.success(`Expediente ${numeroExpediente} creado correctamente`);
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear el expediente");
    } finally {
      setLoading(false);
    }
  };

  const handleTipoTramiteChange = (tipoTramiteId: string) => {
    const tipoTramite = tiposTramite.find((t) => t.id === tipoTramiteId);
    if (tipoTramite && tipoTramite.precio_base) {
      form.setValue("precio_acordado", tipoTramite.precio_base.toString());
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="cliente_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Cliente *</FormLabel>
              <Popover open={openClienteCombo} onOpenChange={setOpenClienteCombo}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? (() => {
                            const cliente = clientes.find((c) => c.id === field.value);
                            return cliente
                              ? `${cliente.apellidos}, ${cliente.nombre}`
                              : "Seleccione un cliente";
                          })()
                        : "Seleccione un cliente"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandList>
                      <CommandEmpty>No se encontró el cliente.</CommandEmpty>
                      <CommandGroup>
                        {clientes.map((cliente) => (
                          <CommandItem
                            key={cliente.id}
                            value={`${cliente.apellidos} ${cliente.nombre} ${cliente.email}`}
                            onSelect={() => {
                              form.setValue("cliente_id", cliente.id);
                              setOpenClienteCombo(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                cliente.id === field.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {cliente.apellidos}, {cliente.nombre}
                            <span className="ml-2 text-xs text-muted-foreground">
                              {cliente.email}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipo_tramite_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Trámite *</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleTipoTramiteChange(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo de trámite" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tiposTramite.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nombre} - {tipo.precio_base}€
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fecha_inicio"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Inicio *</FormLabel>
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
                        format(field.value, "PPP", { locale: es })
                      ) : (
                        <span>Seleccione una fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
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

        <FormField
          control={form.control}
          name="precio_acordado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio Acordado (€)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observaciones"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observaciones adicionales..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creando..." : "Crear Expediente"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
