import { Transform, TransformOptions } from 'class-transformer';

/**
 * Custom transform decorator factory that converts single values to arrays
 * @param options Additional transform options
 * @returns Property decorator
 */
export function TransformToArray(options?: TransformOptions) {
  return Transform(
    ({ value }) => (Array.isArray(value) ? value : value ? [value] : []),
    options,
  );
}

/**
 * Custom transform decorator factory that converts string values to numbers in arrays
 * @param options Additional transform options
 * @returns Property decorator
 */
export function TransformToNumberArray(options?: TransformOptions) {
  return Transform(({ value }) => {
    if (Array.isArray(value)) return value.map((v) => parseInt(v, 10));
    if (value === undefined || value === null) return [];
    return [parseInt(value, 10)];
  }, options);
}
