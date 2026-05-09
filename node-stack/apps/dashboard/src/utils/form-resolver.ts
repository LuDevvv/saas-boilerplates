import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver, FieldValues, FieldErrors } from "react-hook-form";

type ZodLikeIssue = { path: (string | number)[]; message: string; code?: string };
type ZodLikeError = { errors?: ZodLikeIssue[]; issues?: ZodLikeIssue[] };

/**
 * Azteli-style robust resolver creator.
 * Wraps the standard zodResolver with a safety layer to prevent
 * "Uncaught (in promise) ZodError" and ensures errors reach the UI.
 */
export const createResolver = <T extends FieldValues>(schema: Parameters<typeof zodResolver>[0]): Resolver<T> => {
  const standardResolver = zodResolver(schema);

  return async (values, context, options) => {
    try {
      return await standardResolver(values, context, options);
    } catch (err: unknown) {
      const error = err as ZodLikeError;
      console.error("Validation Shield Caught Error:", error);

      // Manual fallback if zodResolver crashes
      if (error.errors || error.issues) {
        const issues = error.errors ?? error.issues ?? [];
        const fieldErrors: FieldErrors<T> = {};

        issues.forEach((issue) => {
          const path = issue.path.join(".");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (fieldErrors as Record<string, any>)[path] = {
            message: issue.message,
            type: issue.code ?? "validate",
          };
        });

        return { values: {} as T, errors: fieldErrors };
      }

      return {
        values: {} as T,
        errors: {
          root: { message: "Error de validación inesperado", type: "validate" }
        } as FieldErrors<T>
      };
    }
  };
};
