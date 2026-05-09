import { zodResolver } from "@hookform/resolvers/zod";

type ZodLikeIssue = { path: (string | number)[]; message: string; code?: string };
type ZodLikeError = { errors?: ZodLikeIssue[]; issues?: ZodLikeIssue[] };
type ResolverResult = { values: Record<string, unknown>; errors: Record<string, { message: string; type: string }> };

/**
 * Azteli-style schema resolver wrapper.
 * Ensures compatibility between Zod versions in a monorepo
 * and prevents uncaught promise rejections.
 */
export const schemaResolver = (schema: Parameters<typeof zodResolver>[0]) => {
  const resolver = zodResolver(schema);

  return async (values: Record<string, unknown>, context: unknown, options: Parameters<ReturnType<typeof zodResolver>>[2]): Promise<ResolverResult> => {
    try {
      return await resolver(values, context, options) as ResolverResult;
    } catch (err: unknown) {
      const error = err as ZodLikeError;
      console.error("Azteli Resolver Caught Error:", error);

      // Manual mapping if the internal resolver explodes
      if (error.errors || error.issues) {
        const fieldErrors: Record<string, { message: string; type: string }> = {};
        const issues = error.errors ?? error.issues ?? [];

        issues.forEach((issue) => {
          const path = issue.path.join(".");
          fieldErrors[path] = {
            message: issue.message,
            type: issue.code ?? "validate",
          };
        });

        return { values: {}, errors: fieldErrors };
      }

      return {
        values: {},
        errors: {
          root: { message: "Error crítico de validación", type: "validate" }
        }
      };
    }
  };
};
