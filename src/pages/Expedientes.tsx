import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Expedientes() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Expedientes</h1>
            <p className="text-muted-foreground">Gestión de expedientes</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Expediente
          </Button>
        </div>

        <div className="bg-card rounded-lg shadow p-8 text-center text-muted-foreground">
          No hay expedientes registrados
        </div>
      </div>
    </MainLayout>
  );
}
