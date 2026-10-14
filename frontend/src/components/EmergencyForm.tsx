"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PRIORITY_LABELS, PRIORITY_ORDER } from "@/lib/format";
import { createEmergency, getErrorMessage } from "@/services/api";
import type { Priority } from "@/types/emergency";
import { ErrorBanner } from "./ErrorBanner";

const MIN_DESCRIPTION_LENGTH = 5;
const MIN_LOCATION_LENGTH = 3;
const INPUT_CLASS =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900";

const PRIORITY_OPTION_STYLES: Record<Priority, string> = {
  LOW: "has-[:checked]:border-blue-900 has-[:checked]:bg-blue-50 has-[:checked]:ring-1 has-[:checked]:ring-blue-900",
  MEDIUM: "has-[:checked]:border-blue-900 has-[:checked]:bg-blue-50 has-[:checked]:ring-1 has-[:checked]:ring-blue-900",
  HIGH: "has-[:checked]:border-red-600 has-[:checked]:bg-red-50 has-[:checked]:text-red-700 has-[:checked]:ring-1 has-[:checked]:ring-red-600",
};

interface FormErrors {
  description?: string;
  location?: string;
}

function validate(description: string, location: string): FormErrors {
  const errors: FormErrors = {};
  if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
    errors.description = `Describe la emergencia con al menos ${MIN_DESCRIPTION_LENGTH} caracteres.`;
  }
  if (location.trim().length < MIN_LOCATION_LENGTH) {
    errors.location = `Indica una ubicación de al menos ${MIN_LOCATION_LENGTH} caracteres.`;
  }
  return errors;
}

export function EmergencyForm() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validate(description, location);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await createEmergency({ description: description.trim(), location: location.trim(), priority });
      router.push("/emergencias");
    } catch (error) {
      setServerError(getErrorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
      {serverError && <ErrorBanner message={serverError} />}

      <div>
        <label htmlFor="description" className="text-sm font-medium text-slate-700">
          Descripción
        </label>
        <textarea
          id="description"
          rows={3}
          maxLength={300}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          aria-invalid={Boolean(errors.description)}
          placeholder="Ej: Paciente con dificultad para respirar"
          className={INPUT_CLASS}
        />
        {errors.description && <p className="mt-1 text-sm text-red-700">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="location" className="text-sm font-medium text-slate-700">
          Ubicación ficticia
        </label>
        <input
          id="location"
          type="text"
          maxLength={120}
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          aria-invalid={Boolean(errors.location)}
          placeholder="Ej: Calle 10 con carrera 5, zona centro"
          className={INPUT_CLASS}
        />
        {errors.location && <p className="mt-1 text-sm text-red-700">{errors.location}</p>}
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Prioridad</legend>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {PRIORITY_ORDER.map((option) => (
            <label
              key={option}
              className={`cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-medium has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-900 ${PRIORITY_OPTION_STYLES[option]}`}
            >
              <input
                type="radio"
                name="priority"
                value={option}
                checked={priority === option}
                onChange={() => setPriority(option)}
                className="sr-only"
              />
              {PRIORITY_LABELS[option]}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-blue-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-900 disabled:opacity-60"
      >
        {submitting ? "Registrando..." : "Registrar emergencia"}
      </button>
    </form>
  );
}
