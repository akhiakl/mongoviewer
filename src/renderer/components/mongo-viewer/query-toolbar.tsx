import { Button } from '@/renderer/components/ui/button';
import { Input } from '@/renderer/components/ui/input';
import { Textarea } from '@/renderer/components/ui/textarea';
import type { SortDirection } from '@/renderer/components/mongo-viewer/sort-utils';

type QueryToolbarProps = {
  queryDraft: string;
  quickFilter: string;
  sortField: string;
  sortDirection: SortDirection;
  availableSortFields: string[];
  onQueryDraftChange: (value: string) => void;
  onQuickFilterChange: (value: string) => void;
  onSortFieldChange: (value: string) => void;
  onSortDirectionChange: (value: SortDirection) => void;
  onApplyQuery: () => void;
  onSavePreset: () => void;
  onResetQuery: () => void;
};

export function QueryToolbar({
  queryDraft,
  quickFilter,
  sortField,
  sortDirection,
  availableSortFields,
  onQueryDraftChange,
  onQuickFilterChange,
  onSortFieldChange,
  onSortDirectionChange,
  onApplyQuery,
  onSavePreset,
  onResetQuery,
}: QueryToolbarProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <Input
        aria-label="Quick filter"
        value={quickFilter}
        onChange={(event) => onQuickFilterChange(event.target.value)}
        placeholder="Quick filter"
      />

      <Textarea
        aria-label="Mongo query"
        value={queryDraft}
        onChange={(event) => onQueryDraftChange(event.target.value)}
        placeholder="Mongo query JSON"
      />

      <div className="flex items-center gap-2">
        <label htmlFor="sort-field" className="text-xs text-muted-foreground">Sort field</label>
        <select
          id="sort-field"
          aria-label="Sort field"
          value={sortField}
          onChange={(event) => onSortFieldChange(event.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="">None</option>
          {availableSortFields.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>

        <Button
          size="sm"
          variant={sortDirection === 'asc' ? 'secondary' : 'ghost'}
          onClick={() => onSortDirectionChange('asc')}
        >
          Ascending
        </Button>
        <Button
          size="sm"
          variant={sortDirection === 'desc' ? 'secondary' : 'ghost'}
          onClick={() => onSortDirectionChange('desc')}
        >
          Descending
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onApplyQuery}>Apply Query</Button>
        <Button size="sm" variant="outline" onClick={onSavePreset}>Save Preset</Button>
        <Button size="sm" variant="ghost" onClick={onResetQuery}>Reset Query</Button>
      </div>
    </div>
  );
}
