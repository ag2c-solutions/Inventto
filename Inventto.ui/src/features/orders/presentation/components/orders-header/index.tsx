interface OrdersHeaderProps {
  inProgressCount: number;
}

// Cabeçalho do Painel (RF034): contador = pool + em atendimento.
export function OrdersHeader({ inProgressCount }: OrdersHeaderProps) {
  return (
    <header className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl leading-tight font-semibold text-foreground">
          Pedidos
        </h1>
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-sidebar px-2.5 py-1 text-xs font-semibold text-sidebar-foreground">
          <span className="size-[7px] rounded-full bg-amber-500" />
          {inProgressCount} em andamento
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        Visibilidade em tempo real dos pedidos da vitrine online. Assuma do pool
        e conduza a entrega pela esteira de fulfillment.
      </p>
    </header>
  );
}
