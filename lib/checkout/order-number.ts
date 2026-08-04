export function orderNumberFromRef(externalReference: string): string {
  const short = externalReference.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `SA-${short}`;
}
