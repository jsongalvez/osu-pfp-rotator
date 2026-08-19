export function randomPicker<T>(
  imagePool: T[],
  currentImage: T,
  options?: RandomPickerOptions<T>,
): T | undefined {
  const isSame = options?.isSame ?? ((a, b) => a === b);
  const random = options?.random ?? Math.random;
  const candidates: T[] = imagePool.filter(
    (image) => !isSame(image, currentImage),
  );
  return candidates.at(Math.floor(random() * candidates.length)); // [].at(0) is undefined
}

type RandomPickerOptions<T> = {
  isSame?: (a: T, b: T) => boolean;
  random?: () => number;
};
