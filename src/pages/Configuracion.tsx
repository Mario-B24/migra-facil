import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Configuracion() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Configuración del sistema</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Trámite</CardTitle>
              <CardDescription>Gestionar tipos de trámites disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configura los diferentes tipos de trámites que ofrece tu gestoría
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentos Requeridos</CardTitle>
              <CardDescription>Configurar documentos por tipo de trámite</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Define qué documentos se necesitan para cada tipo de trámite
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
