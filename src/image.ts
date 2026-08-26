export async function fetchImageFromUrl(url: string): Promise<Buffer> {
  const response = await fetchFromUrl(url);

  if (response === null || response.status !== 200) {
    throw new ImageFetchError(url, response?.status);
  }

  return downloadImage(response, url);
}

async function fetchFromUrl(url: string): Promise<Response> {
  try {
    return await fetch(url);
  } catch {
    throw new ImageFetchError(url);
  }
}

async function downloadImage(response: Response, url: string): Promise<Buffer> {
  try {
    return Buffer.from(await response.arrayBuffer());
  } catch {
    throw new ImageDownloadError(url);
  }
}

export class ImageFetchError extends Error {
  readonly url: string;
  readonly status: number | undefined;

  constructor(url: string, status?: number) {
    super(`failed to fetch url: ${url} ${status}`);
    this.name = "ImageFetchError";
    this.url = url;
    this.status = status;
  }
}

export class ImageDownloadError extends Error {
  readonly url;

  constructor(url: string) {
    super(`failed to download image from ${url}`);
    this.name = "ImageDownloadError";
    this.url = url;
  }
}
