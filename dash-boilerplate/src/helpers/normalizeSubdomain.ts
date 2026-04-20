export const normalizeSubdomain = (input: string): string => {
  return input
    .normalize("NFD") // separa tildes
    .replace(/[\u0300-\u036f]/g, "") // remueve tildes
    .replace(/[\u{1F600}-\u{1F6FF}]/gu, "") // elimina emojis
    .replace(/[^\w]/g, "") // elimina todo menos letras y números
    .toLowerCase(); // pasa todo a minúsculas
};
