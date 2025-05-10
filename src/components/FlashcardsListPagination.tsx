import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { PaginationMetaDto } from "@/types";

interface FlashcardsListPaginationProps {
  meta: PaginationMetaDto;
  onPageChange: (page: number) => void;
}

export function FlashcardsListPagination({ meta, onPageChange }: FlashcardsListPaginationProps) {
  const { page, pages } = meta;

  // Don't show pagination if there's only one page
  if (pages <= 1) {
    return null;
  }

  // Calculate the range of pages to show
  const getPageRange = () => {
    const range: (number | "ellipsis")[] = [];
    const maxVisiblePages = 5;

    if (pages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to maxVisiblePages
      return Array.from({ length: pages }, (_, i) => i + 1);
    }

    // Always show first page
    range.push(1);

    if (page <= 3) {
      // Near the start
      range.push(2, 3, 4, "ellipsis");
    } else if (page >= pages - 2) {
      // Near the end
      range.push("ellipsis", pages - 3, pages - 2, pages - 1);
    } else {
      // Middle
      range.push("ellipsis", page - 1, page, page + 1, "ellipsis");
    }

    // Always show last page
    range.push(pages);

    return range;
  };

  const pageRange = getPageRange();

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) onPageChange(page - 1);
            }}
            className={page <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {pageRange.map((pageNum, idx) =>
          pageNum === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={pageNum}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(pageNum);
                }}
                isActive={pageNum === page}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page < pages) onPageChange(page + 1);
            }}
            className={page >= pages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
