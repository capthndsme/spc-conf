import * as React from "react"
import { cn } from "../../lib/utils"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@radix-ui/react-select"
import { ChevronDown, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { Button } from "./button"
import { PaginationBase, SortingParamsBasic } from "../../types/AdonisPaginator"



function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}







 
/**
 * Defines the structure for a column in the table.
 * @template T - The type of the data objects in each row.
 */
export interface Column<T> {
  header: string; // Text to display in the column header.
  accessorKey: keyof T; // Key to access the data for this column in a row object.
  columnPrefix?: string; // Optional prefix for the cell content.
  columnSuffix?: string; // Optional suffix for the cell content.
  nullFallback?: string; // Content to display if the accessorKey yields null/undefined.
  cell?: (row: T, rowIndex: number) => React.ReactNode; // Custom cell renderer function.
  sortable?: boolean; // Whether this column can be sorted. Defaults to true.
  size?: number; // Width of the column.
}

 
/**
 * Metadata structure for server-side pagination.
 */
export interface BasePaginationMeta {
  total: number; // Total number of items across all pages.
  perPage: number; // Number of items per page (limit).
  currentPage: number; // Current page number.
  lastPage: number; // Total number of pages.
  firstPage: number; // Usually 1.
  // You might also include current sort info from the server here if available:
  // sortColumn?: string;
  // sortDirection?: "asc" | "desc";
}

/**
 * Props for the ReusableTable component.
 * @template T - The type of the data objects in each row.
 */
export interface TableProps<T extends Record<string, any>> {
  data: T[]; // Array of data objects to display.
  columns: Column<T>[]; // Configuration for table columns.
  
  containerClassName?: string; // CSS class for the main container div.
  className?: React.ComponentProps<'table'>['className']; // CSS class for the <table> element.

  // Server-side pagination & sorting props
  paginator?: React.Dispatch<React.SetStateAction<Partial<PaginationBase<any>>>>; // Function to update pagination/sorting state for server.
  baseMeta?: BasePaginationMeta; // Metadata from the server regarding pagination.
  currentServerSort?: SortingParamsBasic<string>; // Current sort state if controlled by server, for UI indication.

  // Client-side pagination options (used if server-side props are not provided)
  defaultItemsPerPage?: number; // Default number of items per page for client-side.
  itemsPerPageOptions?: number[]; // Array of options for items per page (e.g., [10, 25, 50]).
  showItemsPerPageChanger?: boolean; // Whether to show the "items per page" dropdown.
  
  updating?: boolean
}

// --- PAGINATION SUB-COMPONENT ---

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  canPreviousPage: boolean;
  canNextPage: boolean;

  itemsPerPage?: number;
  onItemsPerPageChange?: (value: number) => void;
  itemsPerPageOptions?: number[];
  showItemsPerPageChanger?: boolean;

  totalItems: number;
  itemsFrom: number; // 1-based index of the first item on the current page
  itemsTo: number; // 1-based index of the last item on the current page
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  canPreviousPage,
  canNextPage,
  itemsPerPage,
  onItemsPerPageChange,
  itemsPerPageOptions = [1, 10, 20, 30, 40, 50],
  showItemsPerPageChanger = false,
  totalItems,
  itemsFrom,
  itemsTo,
}) => {
  if (totalPages <= 0 && totalItems <=0) { // Don't render if no data or only one page and no explicit need
      return null;
  }
  
  const pageNumbers = [];
  const maxVisiblePages = 5; // Max page numbers to show (e.g., 1 ... 3 4 5 ... 10)
  
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    pageNumbers.push(1);
    let startPage = Math.max(2, currentPage - Math.floor((maxVisiblePages - 3) / 2));
    let endPage = Math.min(totalPages - 1, currentPage + Math.floor((maxVisiblePages - 3) / 2));

    if (currentPage <= Math.ceil(maxVisiblePages / 2) -1 ) {
        endPage = maxVisiblePages - 2;
    }
    if (currentPage > totalPages - (Math.ceil(maxVisiblePages / 2)-1) ) {
        startPage = totalPages - (maxVisiblePages - 3);
    }
    
    if (startPage > 2) {
      pageNumbers.push(-1); // Ellipsis placeholder
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages - 1) {
      pageNumbers.push(-1); // Ellipsis placeholder
    }
    pageNumbers.push(totalPages);
  }


  return (
    <div className="flex items-center justify-between px-2">
      
      <div className="flex-1 text-sm text-white text-opacity-50">
        {totalItems > 0 ? `Showing ${itemsFrom} to ${itemsTo} of ${totalItems} entries` : 'No entries'}
      </div>
      <div className="flex items-center space-x-2">
        {showItemsPerPageChanger && onItemsPerPageChange && itemsPerPage && (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium hidden sm:inline-block">Rows per page</p>
            <Select
              value={String(itemsPerPage)}
              
              onValueChange={(value) => onItemsPerPageChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px] flex items-center justify-around bg-[#000000] bg-opacity-30 rounded-sm text-white">
               {String(itemsPerPage) }
               <ChevronDown size={16}/>
              </SelectTrigger>
              <SelectContent side="bottom" className="bg-[#000000] bg-opacity-30 rounded-sm text-white z-10 w-20 p-2"> 
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={String(option)} className="px-2 transition-all py-1 rounded-[8px] hover:bg-white cursor-pointer hover:text-black">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="text-sm font-medium px-2 hidden md:inline-block">
          Page {currentPage} of {totalPages > 0 ? totalPages : 1}
        </div>
        <div className="flex items-center space-x-1">
            <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(1)}
            disabled={!canPreviousPage}
            aria-label="Go to first page"
            >
            <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canPreviousPage}
            aria-label="Go to previous page"
            >
            <ChevronLeft className="h-4 w-4" />
            </Button>
            {/* Dynamic Page Numbers (Optional - can be complex to make perfect) */}
            {/* For simplicity, keeping it to main controls. Could add page number buttons here. */}
            {pageNumbers.map((page, index) => 
                page === -1 ? (
                    <span key={`ellipsis-${index}`} className="text-sm p-2">...</span>
                ) : (
                    <Button
                        key={page}
                    variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => onPageChange(page)}
                        disabled={currentPage === page}
                    >
                        {page}
                    </Button>
                )
            )}
            <Button
             variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canNextPage}
            aria-label="Go to next page"
            >
            <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
             variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(totalPages)}
            disabled={!canNextPage}
            aria-label="Go to last page"
            >
            <ChevronsRight className="h-4 w-4" />
            </Button>
        </div>
      </div>
    </div>
  );
};




/**
 * Reusable Table, fully typed by TypeScript.
 * 
 * The Ultimate reusable table with Server side and client side pagination.
 * Wow, very wow.
 * Low complexity enough.
 * 
 * 
 * @template T the Data structure, automatically inferred by [data]
 */
const ReusableTable = <T extends Record<string, any>>({
  data,
  columns,
  containerClassName,
  className,
  paginator,
  baseMeta,
  currentServerSort,
  defaultItemsPerPage = 10,
  itemsPerPageOptions = [10, 20, 30, 50, 100],
  showItemsPerPageChanger = true,
  updating
}: TableProps<T>) => {
  // Determine if pagination/sorting is server-side or client-side
  const isServerSide = !!paginator && !!baseMeta;

  // --- Client-side State ---
  const [clientCurrentPage, setClientCurrentPage] = React.useState(1);
  const [clientItemsPerPage, setClientItemsPerPage] = React.useState(defaultItemsPerPage);
  const [clientSortConfig, setClientSortConfig] = React.useState<{
    key: keyof T | null;
    direction: "asc" | "desc";
  } | null>(null);

  // --- Sorting Logic ---
  const handleSort = React.useCallback((key: keyof T) => {
    if (isServerSide) {
      if (paginator && typeof key === 'string') { // Server sort keys are expected to be strings
        paginator(prevFilters => ({
          ...prevFilters,
          sortColumn: key,
          sortDirection:
            currentServerSort?.sortColumn === key && currentServerSort?.sortDirection === 'asc'
              ? 'desc'
              : 'asc',
          page: 1, // Reset to first page on sort
        }));
      } else if (typeof key !== 'string') {
        console.error("ReusableTable: Server-side sorting requires string accessorKeys.");
      }
    } else {
      // Client-side sorting
      setClientSortConfig(prevConfig => {
        const newDirection =
          prevConfig?.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc';
        return { key, direction: newDirection };
      });
      setClientCurrentPage(1); // Reset to first page on sort
    }
  }, [isServerSide, paginator, currentServerSort, setClientSortConfig, setClientCurrentPage]);

  // --- Data Processing (Sorting & Pagination for Client-Side) ---
  const processedData = React.useMemo(() => {
    if (isServerSide) {
      return data; // Server provides already sorted/paginated data
    }

    let itemsToProcess = [...data];

    // Client-side sorting
    if (clientSortConfig?.key) {
      itemsToProcess.sort((a, b) => {
        const valA = a[clientSortConfig.key!];
        const valB = b[clientSortConfig.key!];
        
        // Basic comparison, extend if specific type handling is needed (e.g., dates, numbers)
        if (valA === null || valA === undefined) return 1; // Nulls/undefined last
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
            return clientSortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }
        if (typeof valA === 'string' && typeof valB === 'string') {
            return clientSortConfig.direction === 'asc' 
                ? valA.localeCompare(valB) 
                : valB.localeCompare(valA);
        }
        // Fallback for other types or mixed types
        if (valA < valB) return clientSortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return clientSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Client-side pagination
    const startIndex = (clientCurrentPage - 1) * clientItemsPerPage;
    const endIndex = startIndex + clientItemsPerPage;
    return itemsToProcess.slice(startIndex, endIndex);
  }, [
    data,
    isServerSide,
    clientSortConfig,
    clientCurrentPage,
    clientItemsPerPage,
  ]);

  // --- Pagination Logic & Values ---
  const clientTotalItems = data.length;
  const clientTotalPages = Math.ceil(clientTotalItems / clientItemsPerPage);

  const currentPage = isServerSide ? baseMeta!.currentPage : clientCurrentPage;
  const totalPages = isServerSide ? baseMeta!.lastPage : clientTotalPages;
  const currentItemsPerPage = isServerSide ? baseMeta!.perPage : clientItemsPerPage;
  const totalItems = isServerSide ? baseMeta!.total : clientTotalItems;

  const canPreviousPage = currentPage > 1;
  const canNextPage = currentPage < totalPages;

  const itemsFrom = totalItems === 0 ? 0 : (currentPage - 1) * currentItemsPerPage + 1;
  const itemsTo = totalItems === 0 ? 0 : Math.min(currentPage * currentItemsPerPage, totalItems);


  const handlePageChange = React.useCallback((page: number) => {
    if (isServerSide) {
      paginator?.(prevFilters => ({ ...prevFilters, page }));
    } else {
      setClientCurrentPage(page);
    }
  }, [isServerSide, paginator, setClientCurrentPage]);

  const handleItemsPerPageChange = React.useCallback((newLimit: number) => {
    if (isServerSide) {
      paginator?.(prevFilters => ({ ...prevFilters, limit: newLimit, page: 1 }));
    } else {
      setClientItemsPerPage(newLimit);
      setClientCurrentPage(1); // Reset to first page
    }
  }, [isServerSide, paginator, setClientItemsPerPage, setClientCurrentPage]);

  // --- Render ---
  if (!columns || columns.length === 0) {
    return <div className={containerClassName}>No column definition provided.</div>;
  }

  return (
    <div className={containerClassName} style={{
      opacity: updating ? 0.5 : 1,
      pointerEvents: updating ? 'none' : 'auto',
      cursor: updating ? 'progress' : 'default',
    }}>
      <div className="rounded-md "> {/* Added border similar to shadcn examples */}
        <Table className={className}>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead
                  key={String(column.accessorKey) + "_HEAD_" + index}
                  className={column.sortable !== false ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
                  onClick={column.sortable !== false ? () => handleSort(column.accessorKey) : undefined}
                  title={column.sortable !== false ? `Sort by ${column.header}` : undefined}
                
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable !== false && (
                      <span className="ml-2 w-4 h-4">
                        {isServerSide ? (
                          currentServerSort?.sortColumn === column.accessorKey ? (
                            currentServerSort?.sortDirection === 'asc' ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="h-4 w-4 " />
                          )
                        ) : clientSortConfig?.key === column.accessorKey ? (
                          clientSortConfig?.direction === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4  " />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedData.length > 0 ? (
              processedData.map((row, rowIndex) => (
                <TableRow key={`row-${rowIndex}`}> {/* Consider using a unique ID from `row` if available */}
                  {columns.map((column, colIndex) => (
                    <TableCell style={{width: column.size}} key={`cell-${rowIndex}-${String(column.accessorKey)}-${colIndex}`}>
                      {column.cell
                        ? column.cell(row, rowIndex)
                        : row[column.accessorKey] !== null && row[column.accessorKey] !== undefined
                        ? (
                          <>
                            {column.columnPrefix}
                            {String(row[column.accessorKey])} {/* Ensure value is stringified */}
                            {column.columnSuffix}
                          </>
                        )
                        : column.nullFallback ?? ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {(isServerSide || clientTotalItems > 0) && (totalPages > 1 || showItemsPerPageChanger) && (
         <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            canPreviousPage={canPreviousPage}
            canNextPage={canNextPage}
            itemsPerPage={currentItemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPageOptions={itemsPerPageOptions}
            showItemsPerPageChanger={showItemsPerPageChanger && (isServerSide || clientTotalItems > (itemsPerPageOptions[0] || defaultItemsPerPage))}
            totalItems={totalItems}
            itemsFrom={itemsFrom}
            itemsTo={itemsTo}
        />
      )}
    </div>
  );
};

 
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  ReusableTable,
  TableCaption,
}
