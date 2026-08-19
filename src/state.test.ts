import { afterEach, beforeEach, expect, test } from "vitest";
import {
  appendHistory,
  createDefaultState,
  loadState,
  saveState,
  StateCorruptionError,
} from "./state.js";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

let dir: string;
let fileMissing: string;
let fileExisting: string;
let fileSaveReload: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "state-test-"));
  fileMissing = join(dir, "stateMissing.json");
  fileExisting = join(dir, "stateExisting.json");
  fileSaveReload = join(dir, "stateSaveReload.json");
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

const urlA = "https://a.s-ul.eu/x.png";
const urlB = "https://b.s-ul.eu/y.png";

test("loads missing state file", async () => {
  const state = await loadState(fileMissing);
  expect(state.lastIndex).toBe(-1);
  expect(state.history).toEqual([]);
});

test("loads existing state file", async () => {
  await writeFile(
    fileExisting,
    JSON.stringify({
      lastIndex: 2,
      history: [
        {
          url: urlA,
          changedAt: "2026-08-09T04:00:00:000Z",
        },
      ],
    }),
  );

  const state = await loadState(fileExisting);
  expect(state.lastIndex).toBe(2);
  expect(state.history).toEqual([
    { url: urlA, changedAt: "2026-08-09T04:00:00:000Z" },
  ]);
});

test("save then reload state file", async () => {
  const state = await loadState(fileSaveReload);
  appendHistory(state, urlB, "2026-08-10T04:00:00:000Z", 3);
  await saveState(fileSaveReload, state);
  const stateReloaded = await loadState(fileSaveReload);
  expect(stateReloaded.lastIndex).toBe(3);
  expect(stateReloaded.history).toEqual([
    {
      url: urlB,
      changedAt: "2026-08-10T04:00:00:000Z",
    },
  ]);
});

test("reject history missing changedAt", async () => {
  await writeFile(
    fileExisting,
    JSON.stringify({
      lastIndex: 1,
      history: [{ url: urlA }], // missing changedAt
    }),
  );

  await expect(loadState(fileExisting)).rejects.toThrow("missing changedAt");
});

test("loaded state files are independent", async () => {
  const a = loadState(join(dir, "stateA.json"));
  appendHistory(await a, urlA, "2026-08-10T04:00:00:000Z", 1);
  const b = loadState(join(dir, "stateB.json"));
  expect((await b) === (await a)).toBe(false);
  expect(await b).toEqual(createDefaultState());
});

test("corrupted state throws", async () => {
  await writeFile(
    fileExisting,
    JSON.stringify({
      lastIndex: 1,
    }),
  );
  await expect(loadState(fileExisting)).rejects.toBeInstanceOf(
    StateCorruptionError,
  );
  await expect(loadState(fileExisting)).rejects.toHaveProperty("state");
});
