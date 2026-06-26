type SummaryCardProps = {
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
};

export function SummaryCard({ title, onEdit, children }: SummaryCardProps) {
  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <h3 className="text-sm font-semibold">{title}</h3>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Editar
          </button>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
