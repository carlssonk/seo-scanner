export type Error = string | { auditType: string; text: string; helpText: string; elements: any[] };

export interface Entry {
  approved: boolean;
  outerHTML: string;
  fallbackHTML: string;
  uid: string;
  // elementContent: string;
  // tagStart: string;
  // tagEnd: string;
  text: string;
  error: Error;
}

export interface scriptsInterface {
  id: string;
  src: string;
  content: string;
}
