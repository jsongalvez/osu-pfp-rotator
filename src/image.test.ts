import { afterEach, expect, test, vi } from "vitest";
import {
  fetchImageFromUrl,
  ImageDownloadError,
  ImageFetchError,
} from "./image.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

const fakeImageUrl = "https://fake.s-ul.eu/a";

test("200 response returns image bytes", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("fake-image")),
  );
  await expect(fetchImageFromUrl(fakeImageUrl)).resolves.toEqual(
    Buffer.from("fake-image"),
  );
});

test("404 status throws", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("fake-image", { status: 404 })),
  );
  const imagePromise = fetchImageFromUrl(fakeImageUrl);
  await expect(imagePromise).rejects.toBeInstanceOf(ImageFetchError);
  await expect(imagePromise).rejects.toMatchObject({
    url: fakeImageUrl,
    status: 404,
  });
});

test("network failure throws", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new TypeError("Offline");
    }),
  );

  const imagePromise = fetchImageFromUrl(fakeImageUrl);
  await expect(imagePromise).rejects.toBeInstanceOf(ImageFetchError);
  await expect(imagePromise).rejects.toMatchObject({
    url: fakeImageUrl,
    status: undefined,
  });
});

test("download failure throws", async () => {
  const response = new Response("fake-image");
  vi.spyOn(response, "arrayBuffer").mockRejectedValue(new TypeError("Offline"));
  vi.stubGlobal("fetch", async () => response);
  const imagePromise = fetchImageFromUrl(fakeImageUrl);
  await expect(imagePromise).rejects.toBeInstanceOf(ImageDownloadError);
  await expect(imagePromise).rejects.toMatchObject({
    url: fakeImageUrl,
  });
});
