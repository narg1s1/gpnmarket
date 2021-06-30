export function formatSum(sum?: number) {
  if (!sum) {
    sum = 0;
  }

  return Number(sum).toFixed(2);
}
