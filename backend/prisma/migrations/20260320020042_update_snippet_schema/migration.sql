/*
  Warnings:

  - The `language` column on the `Snippet` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('JAVASCRIPT', 'TYPESCRIPT', 'HTML', 'CSS', 'PYTHON', 'JAVA', 'CSHARP', 'GO', 'RUST', 'RUBY', 'PHP', 'KOTLIN', 'SWIFT', 'SCALA', 'ELIXIR', 'HASKELL', 'ERLANG', 'CLOJURE', 'C', 'CPP', 'ZIG', 'ASM', 'R', 'MATLAB', 'JULIA', 'BASH', 'POWERSHELL', 'DOCKERFILE', 'YAML', 'TOML', 'SQL', 'PLSQL', 'GRAPHQL', 'DART', 'OBJC', 'LUA', 'PERL', 'GROOVY', 'SOLIDITY', 'VIM');

-- AlterTable
ALTER TABLE "Snippet" ADD COLUMN     "tags" TEXT[],
DROP COLUMN "language",
ADD COLUMN     "language" "Language";
