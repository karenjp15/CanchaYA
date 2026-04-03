import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export default function PerfilPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mi perfil</h1>
        <p className="mt-2 text-muted-foreground">
          Datos personales y medios de pago — próximo módulo.
        </p>
      </div>
      <form action={signOut}>
        <Button type="submit" variant="outline">
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}
