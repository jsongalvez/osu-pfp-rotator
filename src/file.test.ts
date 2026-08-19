import { afterEach, beforeEach, expect, test } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { parseJSON, readTextFile } from "./file.js";

let dir: string;
let fileGood: string;
let fileBad: string;
let fileMissing: string;
const json = `{"cheese":"cake","slices":12}`;
const jsonParsed = { cheese: "cake", slices: 12 };
const malformedJson = `{"cheese":"cake","slices":12`;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "file-"));
  fileGood = join(dir, "good.json");
  fileBad = join(dir, "bad.json");
  await writeFile(fileGood, json);
  await writeFile(fileBad, malformedJson);
  fileMissing = join(dir, "missing.json");
});

afterEach(async () => {
  await rm(dir, { force: true, recursive: true });
});

test("readTextFile returns string for existing file", async () => {
  expect(await readTextFile(fileGood)).toBe(json);
});

test("readTextFile returns undefined for missing file", async () => {
  expect(await readTextFile(fileMissing)).toBe(undefined);
});

test("parseJSON returns object for parsed JSON", async () => {
  const raw = await readTextFile(fileGood);
  const jsonRaw = raw ?? "{}";
  expect(await parseJSON(jsonRaw)).toStrictEqual(jsonParsed);
});

test("parseJSON throws for malformed JSON", async () => {
  const raw = await readTextFile(fileBad);
  const jsonRaw = raw ?? "{}";
  await expect(parseJSON(jsonRaw)).rejects.toThrow(
    `failed to parse JSON: ${malformedJson}`,
  );
});
