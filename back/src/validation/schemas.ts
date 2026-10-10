// Re-exports the shared zod schemas so the rest of `back/` can keep
// importing from "./validation/schemas.ts" as before. The schemas
// themselves live in /shared so back/ and front/ never drift apart.
export * from "../../../shared/schemas.ts";
