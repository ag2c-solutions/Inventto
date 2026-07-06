import { Store } from 'lucide-react';

export interface LinkedChannel {
  id: string;
  name: string;
  meta: string;
}

interface LinkedChannelsProps {
  channels: LinkedChannel[];
}

export function LinkedChannels({ channels }: LinkedChannelsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-medium">Canais vinculados</h3>
        <p className="text-xs text-muted-foreground">
          A vinculação é feita na configuração de cada canal.
        </p>
      </div>

      {channels.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum canal vinculado a este catálogo.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {channels.map((channel) => (
            <li
              key={channel.id}
              className="flex items-center gap-2 rounded-md border px-3 py-2"
            >
              <Store className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{channel.name}</span>
                <span className="text-xs text-muted-foreground">
                  {channel.meta}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
