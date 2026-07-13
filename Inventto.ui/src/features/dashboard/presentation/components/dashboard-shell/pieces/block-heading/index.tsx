interface BlockHeadingProps {
  title: string;
  rf: string;
}

export function BlockHeading({ title, rf }: BlockHeadingProps) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <span className="font-mono text-[11px] text-muted-foreground">{rf}</span>
    </div>
  );
}
