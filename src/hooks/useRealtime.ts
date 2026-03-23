import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseRealtimeProps {
  table: string;
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export function useRealtime({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete
}: UseRealtimeProps) {
  const [status, setStatus] = useState<'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR' | 'CONNECTING'>('CONNECTING');
  const supabase = createClient();

  // Guardar callbacks en refs para que no sean parte del dependency array
  // Esto evita resubscripciones innecesarias en cada render
  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);

  useEffect(() => {
    onInsertRef.current = onInsert;
    onUpdateRef.current = onUpdate;
    onDeleteRef.current = onDelete;
  });

  useEffect(() => {
    const channelName = `${table}-changes-${filter || 'all'}`;
    const channel = supabase.channel(channelName);

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.eventType === 'INSERT') {
            onInsertRef.current?.(payload.new);
          } else if (payload.eventType === 'UPDATE') {
            onUpdateRef.current?.(payload.new);
          } else if (payload.eventType === 'DELETE') {
            onDeleteRef.current?.(payload.old);
          }
        }
      )
      .subscribe((s: string) => {
        setStatus(s as any);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  // Solo re-subscribir si cambia la tabla o el filtro, no los callbacks
  }, [table, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  return { status };
}
