
export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface Message {
  role: Role;
  text: string;
  sources?: WebSource[];
}
