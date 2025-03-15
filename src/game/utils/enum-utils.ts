export function getEnumKeyByValue<T>(
  enumObject: { [key: string]: T | string },
  value: T,
): keyof typeof enumObject | undefined {
  // Filter out the reverse mappings (where the key is a number)
  const keys = Object.keys(enumObject).filter((key) =>
    Number.isNaN(Number(key)),
  );

  // Find the key that matches our value
  const key = keys.find((key) => enumObject[key] === value);

  // Return the key with the correct type
  return key as keyof typeof enumObject | undefined;
}
