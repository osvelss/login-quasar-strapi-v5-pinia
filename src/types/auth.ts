export interface Auth {
  jwt: string;
  user: User;
}

export interface User {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  role: Role;
  profile: null;
}

export interface Role {
  id: number;
  documentId: string;
  name: string;
  description: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  locale: null;
}
