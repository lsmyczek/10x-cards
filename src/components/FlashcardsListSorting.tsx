import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortField = 'created_at' | 'updated_at';
export type SortOrder = 'desc' | 'asc';

interface FlashcardsListSortingProps {
  onSortChange: (field: SortField, order: SortOrder) => void;
  currentSort: {
    field: SortField;
    order: SortOrder;
  };
}

export function FlashcardsListSorting({ onSortChange, currentSort }: FlashcardsListSortingProps) {
  const sortOptions = [
    { value: 'created_at-desc', label: 'Newest first' },
    { value: 'created_at-asc', label: 'Oldest first' },
    { value: 'updated_at-desc', label: 'Recently updated' },
    { value: 'updated_at-asc', label: 'Least recently updated' },
  ];

  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-') as [SortField, SortOrder];
    onSortChange(field, order);
  };

  const currentValue = `${currentSort.field}-${currentSort.order}`;

  return (
    <Select
      value={currentValue}
      onValueChange={handleSortChange}
    >
      <SelectTrigger className="w-[180px] bg-white font-medium">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 