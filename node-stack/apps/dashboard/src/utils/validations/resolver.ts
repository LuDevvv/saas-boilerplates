import { zodResolver } from "@hookform/resolvers/zod";

/**
 * Azteli-style schema resolver wrapper.
 * Ensures compatibility between Zod versions in a monorepo
 * and prevents uncaught promise rejections.
 */
export const schemaResolver = (schema: any) => {
  const resolver = zodResolver(schema as any);
  
  return async (values: any, context: any, options: any) => {
    try {
      return await resolver(values, context, options);
    } catch (error: any) {
      console.error("Azteli Resolver Caught Error:", error);
      
      // Manual mapping if the internal resolver explodes
      if (error.errors || error.issues) {
        const fieldErrors: any = {};
        const issues = error.errors || error.issues;
        
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
          root: { message: "Error crítico de validación" } 
        } 
      };
    }
  };
};
