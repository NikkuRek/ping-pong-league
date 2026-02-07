
import DataRenewalClient from "@/components/DataRenewalClient";

export const metadata = {
  title: "Renovar Datos | Ping Pong League",
  description: "Actualiza tu información y contraseña para la liga.",
};

export default function DataRenewalPage() {
  return (
    <div className="container mx-auto">
      <DataRenewalClient />
    </div>
  );
}
