import {
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
  type RealtimeChannel,
  type RealtimePostgresChangesPayload
} from '@supabase/supabase-js';

import { supabase } from '@/infra/supabase';

export interface TableChangeSubscription<T extends Record<string, unknown>> {
  table: string;
  schema?: string;
  filter?: string;
  event?: `${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT}`;
  onChange: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: T | null;
    old: Partial<T> | null;
  }) => void;
}

/**
 * Wrapper sobre o Supabase Realtime. As features não devem falar com
 * supabase.channel diretamente — passam por aqui, de modo que trocar o
 * provedor de tempo real no futuro fique contido nesta camada.
 */
export function subscribeToTableChanges<T extends Record<string, unknown>>(
  channelName: string,
  {
    table,
    schema = 'public',
    filter,
    event = REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.ALL,
    onChange
  }: TableChangeSubscription<T>
): () => void {
  const channel: RealtimeChannel = supabase
    .channel(channelName)
    .on(
      REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { event, schema, table, ...(filter ? { filter } : {}) } as any,
      (payload: RealtimePostgresChangesPayload<T>) => {
        onChange({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: (payload.new as T) ?? null,
          old: (payload.old as Partial<T>) ?? null
        });
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
