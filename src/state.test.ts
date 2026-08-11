import { afterEach, beforeEach, expect, test } from "vitest";
import { appendHistory, loadState, saveState } from "./state.js";
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
          url: "https://a.s-ul.eu/x.png",
          changedAt: "2026-08-09T04:00:00:000Z",
        },
      ],
    }),
  );

  const state = await loadState(fileExisting);
  expect(state.lastIndex).toBe(2);
  expect(state.history).toEqual([
    { url: "https://a.s-ul.eu/x.png", changedAt: "2026-08-09T04:00:00:000Z" },
  ]);
});

test("save then reload state file", async () => {
  const state = await loadState(fileSaveReload);
  appendHistory(
    state,
    "https://b.s-ul.eu/y.png",
    "2026-08-10T04:00:00:000Z",
    3,
  );
  await saveState(fileSaveReload, state);
  const stateReloaded = await loadState(fileSaveReload);
  expect(stateReloaded.lastIndex).toBe(3);
  expect(stateReloaded.history).toEqual([
    {
      url: "https://b.s-ul.eu/y.png",
      changedAt: "2026-08-10T04:00:00:000Z",
    },
  ]);
});
