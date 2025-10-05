import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerfilUsuarioForm } from "@/components/configuracion/PerfilUsuarioForm";
import { CambiarPasswordForm } from "@/components/configuracion/CambiarPasswordForm";
import { GestoriaConfigForm } from "@/components/configuracion/GestoriaConfigForm";
import { GestionUsuarios } from "@/components/configuracion/GestionUsuarios";
import { Button } from "@/components/ui/button";
import { Download, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function Configuracion() {
  const { theme, setTheme } = useTheme();

  const exportData = async () => {
    try {
      const [clients, expedientes, pagos, tiposTramite] = await Promise.all([
        supabase.from("clients").select("*"),
        supabase.from("expedientes").select("*"),
        supabase.from("payments").select("*"),
        supabase.from("tipos_tramite").select("*"),
      ]);

      const data = {
        clientes: clients.data || [],
        expedientes: expedientes.data || [],
        pagos: pagos.data || [],
        tipos_tramite: tiposTramite.data || [],
        fecha_exportacion: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Datos exportados correctamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al exportar los datos");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Gestiona la configuración del sistema</p>
        </div>

        <Tabs defaultValue="perfil" className="space-y-4">
          <TabsList>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="gestoria">Gestoría</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="sistema">Sistema</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Perfil de Usuario</CardTitle>
                <CardDescription>Gestiona tu información personal</CardDescription>
              </CardHeader>
              <CardContent>
                <PerfilUsuarioForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
              </CardHeader>
              <CardContent>
                <CambiarPasswordForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gestoria">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de la Gestoría</CardTitle>
                <CardDescription>Información y configuración de tu gestoría</CardDescription>
              </CardHeader>
              <CardContent>
                <GestoriaConfigForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usuarios">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>Administra los usuarios con acceso al sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <GestionUsuarios />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sistema" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Apariencia</CardTitle>
                <CardDescription>Personaliza el aspecto de la aplicación</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Tema</p>
                    <p className="text-sm text-muted-foreground">
                      Cambia entre modo claro y oscuro
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("light")}
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Claro
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("dark")}
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Oscuro
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Copia de Seguridad</CardTitle>
                <CardDescription>Gestiona las copias de seguridad de tus datos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <p className="text-sm font-medium">Backups Automáticos</p>
                  <p className="text-sm text-muted-foreground">
                    Supabase realiza copias de seguridad automáticas de tu base de datos diariamente.
                    Estos backups se mantienen por 7 días y pueden ser restaurados desde el panel de
                    Supabase si es necesario.
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="font-medium mb-2">Exportar Datos</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Descarga una copia completa de todos tus datos en formato JSON. Incluye clientes,
                    expedientes, pagos y configuración.
                  </p>
                  <Button onClick={exportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Datos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
