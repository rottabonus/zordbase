import pino from "pino";

// Always emit plain newline-delimited JSON here - that's what production log
// aggregation expects, and it's unconditionally correct in every environment
// (NODE_ENV is never set in this project's Dockerfiles/compose/k8s config,
// so branching on it would silently pick the wrong format in "production").
// For readable local output, the `dev` npm script pipes this through
// pino-pretty on the command line instead of baking the transport in here.
export const logger = pino({
	level: process.env.LOG_LEVEL ?? "info",
});
