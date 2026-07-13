interface BlockHeadingProps {
  title: string;
  rf: string;
}

export function BlockHeading({ title, rf }: BlockHeadingProps) {
  return (
    <div className="flex items-baseline gap-2.5">
      <h2 className="text-[13px] font-bold tracking-wide uppercase">{title}</h2>
      <span className="font-mono text-[10px] text-muted-foreground">{rf}</span>
    </div>
  );
}
