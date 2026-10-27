import { Page, PaginationParams } from '../domain/pagination';

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export function paginate<T>(
  { items, total }: Page<T>,
  { page, limit }: PaginationParams,
): Paginated<T> {
  return {
    data: items,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  };
}

export function emptyPage<T>(params: PaginationParams): Paginated<T> {
  return paginate({ items: [], total: 0 }, params);
}

export function mapPaginated<T, R>(
  result: Paginated<T>,
  fn: (item: T) => R,
): Paginated<R> {
  return { data: result.data.map(fn), meta: result.meta };
}
