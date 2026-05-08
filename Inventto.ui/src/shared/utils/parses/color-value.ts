export const parseColorValue = (value: string) => {
  if (value.includes('|')) {
    const [name, hex] = value.split('|');
    return { name, hex };
  }
  return { name: value, hex: value };
};
