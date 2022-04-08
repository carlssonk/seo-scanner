export {};

declare global {
  interface Window {
    getSelector: any; // 👈️ turn off type checking
  }
}
