export const isNotNull = <T>(value: T): value is Exclude<T, null> =>
  value !== null;
