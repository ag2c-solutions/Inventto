import { Skeleton } from '@/shared/components/ui/skeleton';

const COLUMN_COUNT = 4;
const CARDS_PER_COLUMN = 2;

function OrderCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-2.5 gap-y-2 p-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-14 justify-self-end rounded-md" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-20 justify-self-end rounded-full" />
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-12 justify-self-end" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16 justify-self-end" />
      </div>
      <div className="flex items-center gap-2 border-t p-2.5">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
      </div>
    </div>
  );
}

function BoardColumnSkeleton() {
  return (
    <div className="flex bg-sidebar min-w-0 flex-col overflow-hidden rounded-xl border lg:w-[320px] lg:flex-none">
      <div className="flex items-center gap-2 border-b px-3.5 py-3">
        <Skeleton className="h-2 w-2 rounded-full" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="ml-auto h-4 w-6 rounded-full" />
      </div>
      <div className="flex flex-col gap-2.5 p-3">
        {Array.from({ length: CARDS_PER_COLUMN }).map((_, index) => (
          <OrderCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

// RF034/RF035: skeleton de Kanban enquanto o painel carrega — espelha as 4
// colunas do board de verdade (wireframe "Carregando", st-loading).
export function OrdersBoardSkeleton() {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:gap-3.5">
      {Array.from({ length: COLUMN_COUNT }).map((_, index) => (
        <BoardColumnSkeleton key={index} />
      ))}
    </div>
  );
}
