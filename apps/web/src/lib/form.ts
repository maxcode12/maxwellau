import type { z } from "zod";

/** Convert FormData into a plain object of strings (last value wins). */
export function formDataToObject(formData: FormData): Record<string, string> {
  const object: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") object[key] = value;
  }
  return object;
}

export type ParsedForm<T> =
  | { success: true; data: T }
  | { success: false; message: string; fieldErrors: Partial<Record<string, string>> };

/** Parse FormData with a Zod schema into either data or per-field errors. */
export function parseForm<Schema extends z.ZodTypeAny>(
  schema: Schema,
  formData: FormData,
): ParsedForm<z.output<Schema>> {
  const result = schema.safeParse(formDataToObject(formData));
  if (result.success) return { success: true, data: result.data };

  const fieldErrors: Partial<Record<string, string>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return {
    success: false,
    message: "Please check the highlighted fields.",
    fieldErrors,
  };
}
