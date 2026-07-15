type NumberConstraints = {
  fallback: number;
  min?: number;
  max?: number;
};

/** Converts a number-input value into a finite value within the supplied range. */
export function readNumberInput(value: string, { fallback, min, max }: NumberConstraints) {
  const parsed = value.trim() === "" ? Number.NaN : Number(value);
  const safeValue = Number.isFinite(parsed) ? parsed : fallback;
  const lowerBounded = min === undefined ? safeValue : Math.max(min, safeValue);

  return max === undefined ? lowerBounded : Math.min(max, lowerBounded);
}

/** Reads a number input that represents a count, such as board squares or seconds. */
export function readIntegerInput(value: string, constraints: NumberConstraints) {
  return Math.round(readNumberInput(value, constraints));
}
