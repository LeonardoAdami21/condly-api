export interface PaginationParams {
  page: number;
  limit: number;
}

export interface Page<T> {
  items: T[];
  total: number;
}

export const skipOf = ({ page, limit }: PaginationParams) => (page - 1) * limit;
