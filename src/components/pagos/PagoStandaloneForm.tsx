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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

const formSchema = z.object({
  expediente_id: z.string().min(1, "Debe seleccionar un expediente"),
  fecha_pago: z.date({ required_error: "La fecha de pago es obligatoria" }),
  importe: z.string().min(1, "El importe es obligatorio").refine(
    (val) => parseFloat(val) > 0,
    "El importe debe ser mayor a 0"
  ),
  metodo_pago: z.string().min(1, "El método de pago es obligatorio"),
  concepto: z.string().optional(),
  observaciones: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PagoStandaloneFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface ExpedienteInfo {
  numero_expediente: string;
  cliente_id: string;
  precio_acordado: number;
  total_pagado: number;
  cliente: {
    nombre: string;
    apellidos: string;
  };
}

export function PagoStandaloneForm({ onSuccess, onCancel }: PagoStandaloneFormProps) {
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [selectedExpedienteInfo, setSelectedExpedienteInfo] = useState<ExpedienteInfo | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expediente_id: "",
      importe: "",
      metodo_pago: "",
      concepto: "",
      observaciones: "",
    },
  });

  useEffect(() => {
    fetchExpedientes();
  }, []);

  const fetchExpedientes = async () => {
    const { data, error } = await supabase
      .from("expedientes")
      .select(`
        id,
        numero_expediente,
        cliente_id,
        precio_acordado,
        clients!inner(nombre, apellidos)
      `)
      .order("numero_expediente", { ascending: false });

    if (error) {
      console.error("Error fetching expedientes:", error);
      return;
    }
    setExpedientes(data || []);
  };

  const fetchExpedienteDetails = async (expedienteId: string) => {
    const { data: expediente, error: expError } = await supabase
      .from("expedientes")
      .select(`
        numero_expediente,
        cliente_id,
        precio_acordado,
        clients!inner(nombre, apellidos)
      `)
      .eq("id", expedienteId)
      .single();

    if (expError) {
      console.error("Error:", expError);
      return;
    }

    const { data: pagos, error: pagosError } = await supabase
      .from("payments")
      .select("importe")
      .eq("expediente_id", expedienteId);

    if (pagosError) {
      console.error("Error:", pagosError);
      return;
    }

    const totalPagado = pagos?.reduce((sum, p) => sum + parseFloat(p.importe.toString()), 0) || 0;

    setSelectedExpedienteInfo({
      numero_expediente: expediente.numero_expediente,
      cliente_id: expediente.cliente_id,
      precio_acordado: parseFloat(expediente.precio_acordado?.toString() || "0"),
      total_pagado: totalPagado,
      cliente: expediente.clients,
    });
  };

  const onSubmit = async (values: FormValues) => {
    if (!selectedExpedienteInfo) {
      toast.error("Debe seleccionar un expediente");
      return;
    }

    try {
      const { error } = await supabase
        .from("payments")
        .insert({
          expediente_id: values.expediente_id,
          cliente_id: selectedExpedienteInfo.cliente_id,
          fecha_pago: format(values.fecha_pago, "yyyy-MM-dd"),
          importe: parseFloat(values.importe),
          metodo_pago: values.metodo_pago,
          concepto: values.concepto || null,
          observaciones: values.observaciones || null,
        });

      if (error) throw error;
      toast.success("Pago registrado correctamente");
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al registrar el pago");
    }
  };

  const handleExpedienteSelect = (expedienteId: string) => {
    form.setValue("expediente_id", expedienteId);
    fetchExpedienteDetails(expedienteId);
    setOpen(false);
  };

  const selectedExpediente = expedientes.find((e) => e.id === form.watch("expediente_id"));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="expediente_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Expediente *</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
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
                      {selectedExpediente
                        ? `${selectedExpediente.numero_expediente} - ${selectedExpediente.clients.nombre} ${selectedExpediente.clients.apellidos}`
                        : "Seleccione un expediente"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar expediente..." />
                    <CommandList>
                      <CommandEmpty>No se encontró el expediente.</CommandEmpty>
                      <CommandGroup>
                        {expedientes.map((expediente) => (
                          <CommandItem
                            key={expediente.id}
                            value={`${expediente.numero_expediente} ${expediente.clients.nombre} ${expediente.clients.apellidos}`}
                            onSelect={() => handleExpedienteSelect(expediente.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === expediente.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {expediente.numero_expediente} - {expediente.clients.nombre} {expediente.clients.apellidos}
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

        {selectedExpedienteInfo && (
          <Card className="p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Cliente:</span>
                <p className="font-medium">
                  {selectedExpedienteInfo.cliente.nombre} {selectedExpedienteInfo.cliente.apellidos}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Precio Acordado:</span>
                <p className="font-medium">{selectedExpedienteInfo.precio_acordado.toFixed(2)} €</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Pagado:</span>
                <p className="font-medium">{selectedExpedienteInfo.total_pagado.toFixed(2)} €</p>
              </div>
              <div>
                <span className="text-muted-foreground">Pendiente:</span>
                <p className="font-medium text-orange-600">
                  {(selectedExpedienteInfo.precio_acordado - selectedExpedienteInfo.total_pagado).toFixed(2)} €
                </p>
              </div>
            </div>
          </Card>
        )}

        <FormField
          control={form.control}
          name="fecha_pago"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Pago *</FormLabel>
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
          name="importe"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Importe (€) *</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="metodo_pago"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de Pago *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un método" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="bizum">Bizum</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="concepto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Concepto</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Pago inicial, Pago final..." {...field} />
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
          <Button type="submit">Registrar Pago</Button>
        </div>
      </form>
    </Form>
  );
}
