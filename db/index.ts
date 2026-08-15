import { env } from "./env";

export function getDb() {
  return env.DB;
}
