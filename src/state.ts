import { readFile, rename, writeFile } from "node:fs/promises";

interface State {
  lastIndex: number;
  history: HistoryEntry[];
}

interface HistoryEntry {
  url: string;
  changedAt: string;
}

export async function loadState(path: string): Promise<State> {
  let state: State;
  try {
    state = JSON.parse(await readFile(path, "utf8"));
  } catch (err) {
    if (err instanceof Error && "code" in err && err.code === "ENOENT") {
      return { lastIndex: -1, history: [] };
    }
    throw new Error(`failed to load state file at ${path}`, { cause: err });
  }

  requireState(state);

  return state;

  function requireState(state: State) {
    if (typeof state.lastIndex !== "number")
      throw new Error(`state.lastIndex number is missing`);
    if (!Array.isArray(state.history))
      throw new Error(`state.history array is missing`);
    if (state.history.some((e) => typeof e.url !== "string"))
      throw new Error(`state.history is missing url`);
  }
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
