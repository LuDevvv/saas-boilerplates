export const isUrlActive = async (url: string): Promise<boolean> => {
  try {
    // Usamos sin caché y seguimos redirecciones
    // Nota: Esto podría ser bloqueado por CORS si el dominio de destino no lo permite.
    // Para muchos casos de uso, se prefiere una solicitud HEAD para ahorrar ancho de banda.
    const absoluteUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Intentamos un fetch con tiempo límite
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    await fetch(absoluteUrl, {
      method: "HEAD", // HEAD es más rápido/ligero
      mode: "no-cors", // no-cors permite ver si el destino es alcanzable sin headers CORS
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // En modo no-cors, la respuesta es opaca y el ok es falso, pero no lanza excepción si llegó al destino.
    return true; 
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError' && !error.message.includes('Failed to fetch')) {
        console.warn('[URL Validator] URL check failed:', error.message);
    }
    return false;
  }
};
