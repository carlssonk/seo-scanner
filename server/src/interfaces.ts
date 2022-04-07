export interface Entry {
  approved: boolean;
  elementContent: string;
  tagStart: string;
  tagEnd: string;
  text: string;
  error: string | { text: string; elements: any[] };
}

export interface scriptsInterface {
  id: string;
  src: string;
  content: string;
}
