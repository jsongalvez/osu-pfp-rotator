import { rename, writeFile } from "node:fs/promises";
import { parseJSON, readTextFile } from "./file.js";

export interface State {
  lastIndex: number;
  history: HistoryEntry[];
}

interface HistoryEntry {
  url: string;
  changedAt: string;
}

export async function loadState(path: string): Promise<State> {
  const defaultState: State = createDefaultState();

  const raw = await readTextFile(path);
  if (raw === undefined) return defaultState;
  const parsed: unknown = await parseJSON(raw);

  let state: State;
  if (isState(parsed)) state = parsed;
  else throw new StateCorruptionError(parsed);

  requireState(state);
  return state;
}

export function createDefaultState(): State {
  return { lastIndex: -1, history: [] };
}

function requireState(state: State) {
  if (typeof state.lastIndex !== "number")
    throw new Error(`state.lastIndex number is missing`);
  if (!Array.isArray(state.history))
    throw new Error(`state.history array is missing`);
  if (state.history.some((e) => typeof e.url !== "string"))
    throw new Error(`state.history is missing url`);
  if (state.history.some((e) => typeof e.changedAt !== "string"))
    throw new Error(`state.history is missing changedAt`);
}

function isState(value: unknown): value is State {
  return !(
    typeof value !== "object" ||
    value === null ||
    !("lastIndex" in value) ||
    !(typeof value.lastIndex === "number") ||
    !("history" in value) ||
    !Array.isArray(value.history)
  );
}

export async function saveState(path: string, state: State) {
  const tmpPath = `${path}.tmp`;
  await writeFile(tmpPath, JSON.stringify(state));
  await rename(tmpPath, path);
}

/** changedAt should be `new Date().toISOString()` */
export function appendHistory(
  state: State,
  url: string,
  changedAt: string,
  poolIndex: number,
) {
  state.lastIndex = poolIndex;
  state.history.push({ url, changedAt });
}

export class StateCorruptionError extends Error {
  readonly state: unknown;
  constructor(state: unknown) {
    super(`state is corrupted: ${state}`);
    this.name = "StateCorruptionError";
    this.state = state;
  }
}
