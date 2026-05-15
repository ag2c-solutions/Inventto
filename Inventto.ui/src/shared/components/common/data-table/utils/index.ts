import type { Row } from '@tanstack/react-table';

export const dateRangeFilter = (
  row: Row<unknown>,
  columnId: string,
  value: { from?: Date; to?: Date } | null | undefined
) => {
  const dateValue = row.getValue(columnId);
  const { from, to } = value || {};

  if (!from && !to) return true;
  if (!dateValue) return false;

  const rowDate = new Date(dateValue as string | number);

  if (from && to) {
    return rowDate >= from && rowDate <= to;
  }

  if (from) {
    return rowDate >= from;
  }

  if (to) {
    return rowDate <= to;
  }
};
