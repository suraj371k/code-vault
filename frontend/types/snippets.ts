import { User } from "./auth";
import { Organization } from "./organization";

export type CreateSnippetInput = {
  title: string;
  code: string;
  category: string;
  language: string;
  summary?: string;
};

export interface Snippet {
  id: number;
  title: string;
  language: string;
  category: string;
  summary: string;
  created_at: string;
  code: string;
  author: User;
  organization: Organization;
}

export interface SnippetResponse {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: Snippet[];
}
