import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";

/**
 * Azteli-style robust resolver creator.
 * Wraps the standard zodResolver with a safety layer to prevent
 * "Uncaught (in promise) ZodError" and ensures errors reach the UI.
 */
export const createResolver = <T extends Record<string, any>>(schema: any): Resolver<T> => {
  const standardResolver = zodResolver(schema as any);

  return async (values, context, options) => {
    try {
      return await standardResolver(values, context, options);
    } catch (error: any) {
      console.error("Validation Shield Caught Error:", error);
      
      // Manual fallback if zodResolver crashes
      if (error.errors || error.issues) {
        const issues = error.errors || error.issues;
        const fieldErrors: any = {};
        
        issues.forEach((issue: any) => {
          const path = issue.path.join(".");
          fieldErrors[path] = {
            message: issue.message,
            type: issue.code,
          };
        });
        
        return { values: {}, errors: fieldErrors };
      }

      return {
        values: {},
        errors: {
          root: { message: "Error de validación inesperado" }
        } as any
      };
    }
  };
};
