// Re-exports the shared zod schemas so the rest of `front/` can keep
// importing from "./validation/schemas" as before. The schemas
// themselves live in /shared so back/ and front/ never drift apart.
export * from "../../../shared/schemas";
