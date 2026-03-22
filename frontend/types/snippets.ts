import { User } from "./auth";
import { Organization } from "./organization";

// Mirrors the Prisma Language enum exactly
export type Language =
  | "JAVASCRIPT" | "TYPESCRIPT" | "HTML" | "CSS"
  | "PYTHON" | "JAVA" | "CSHARP" | "GO" | "RUST" | "RUBY" | "PHP"
  | "KOTLIN" | "SWIFT" | "SCALA" | "ELIXIR" | "HASKELL" | "ERLANG" | "CLOJURE"
  | "C" | "CPP" | "ZIG" | "ASM"
  | "R" | "MATLAB" | "JULIA"
  | "BASH" | "POWERSHELL" | "DOCKERFILE" | "YAML" | "TOML"
  | "SQL" | "PLSQL" | "GRAPHQL"
  | "DART" | "OBJC"
  | "LUA" | "PERL" | "GROOVY" | "SOLIDITY" | "VIM";

export type CreateSnippetInput = {
  title: string;
  code: string;
  category?: string;
  language?: Language;
  summary?: string[];
};

export type UpdateSnippetInput = {
  title?: string;
  code?: string;
  category?: string;
  language?: Language;
  summary?: string[];
  tags?: string[];
};

export interface Snippet {
  id: number;
  title: string;
  language: Language | null;
  category: string | null;
  summary: string[];
  tags: string[];
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
