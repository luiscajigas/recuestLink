import { ConnectionStatus } from "./ConnectionStatus";

export function Header() {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-8">
      <p className="text-sm text-slate-500">Demostración académica con datos ficticios</p>
      <ConnectionStatus />
    </header>
  );
}
