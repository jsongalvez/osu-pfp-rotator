import { readFile } from "node:fs/promises";

export async function readTextFile(
  filePath: string,
): Promise<string | undefined> {
  try {
    return await readFile(filePath, "utf8");
  } catch (err) {
    if (err instanceof Error && "code" in err && err.code === "ENOENT")
      return undefined;
    throw new Error(`failed to read ${filePath}`, { cause: err });
  }
}

export async function parseJSON<T>(rawJSON: string): Promise<T> {
  try {
    return JSON.parse(rawJSON);
  } catch (err) {
    throw new Error(`failed to parse JSON: ${rawJSON}`, { cause: err });
  }
}
