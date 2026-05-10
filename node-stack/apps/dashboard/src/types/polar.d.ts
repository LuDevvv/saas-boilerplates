export {};

declare global {
  interface Window {
    polar: {
      checkout: {
        open: (url: string) => void;
      };
    };
  }
}
