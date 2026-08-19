import { expect, test } from "vitest";
import { randomPicker } from "./randomPicker.js";

const imgA = "https://a.s-ul.eu/x.png";
const imgB = "https://b.s-ul.eu/y.png";
const imgC = "https://c.s-ul.eu/z.png";

test("randomPicker selects final candidate", () => {
  expect(randomPicker([imgA, imgB, imgC], imgB, { random: () => 0.99 })).toBe(
    imgC,
  );
});

test("randomPicker returns image for one entry if not same entry", () => {
  expect(randomPicker([imgA], imgB)).toBe(imgA);
});

test("randomPicker returns undefined for one entry", () => {
  expect(randomPicker([imgB], imgB)).toBeUndefined();
});

test("randomPicker returns undefined for missing entries", () => {
  expect(randomPicker([], imgB)).toBeUndefined();
});

test("randomPicker A->B->A allowed", () => {
  expect(randomPicker([imgA], imgB)).toBe(imgA);
  expect(randomPicker([imgB], imgA)).toBe(imgB);
  expect(randomPicker([imgA], imgB)).toBe(imgA);
});

test("randomPicker A->A returns undefined", () => {
  expect(randomPicker([imgA], imgA)).toBeUndefined();
});
