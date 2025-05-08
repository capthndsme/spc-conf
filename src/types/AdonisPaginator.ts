/**
 * Basic paginate
 */

export type PaginationParamsBasic = {
  page?: number
  limit?: number

}


export type SortingParamsBasic<S = string> = {
  sortDirection?: "asc" | "desc",
  sortColumn?: S
}


/**
 * Simple extensible pagination and param base.
 * @param {S} - The Sort columns
 */
export type PaginationBase<S = string> = PaginationParamsBasic & SortingParamsBasic<S>