export function getEnumKeyByValue<T extends { [key: string]: number }>(
    enumObj: T,
    value: number,
  ): keyof T | undefined {
    return Object.keys(enumObj).find((key) => enumObj[key] === value) as
      | keyof T
      | undefined;
  }
  