import { EmergencyForm } from "@/components/EmergencyForm";

export default function NewEmergencyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-blue-950">Registrar emergencia</h1>
        <p className="mt-1 text-sm text-slate-600">
          Usa datos ficticios. La emergencia quedará en estado «Reportada» hasta que le asignes una ambulancia.
        </p>
      </div>
      <EmergencyForm />
    </div>
  );
}
