import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';

import { Input } from '@/shared/components/ui/input';

import { useUser } from '@/features/users';

import { useOrganizationMembersQuery } from '../../hooks/use-queries';
import { AddMember } from '../actions/add-member';

import { MemberCard } from './pieces/card';
import { MembersCardListSkeleton } from './pieces/skeleton';

const PAGE_SIZE = 8;

export function MembersCardList() {
  const { isLoading: isLoadingOrg } = useUser();
  const { data: members = [], isLoading: isLoadingMembers } =
    useOrganizationMembersQuery();

  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return members;
    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term)
    );
  }, [members, search]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search]);

  const visibleMembers = filteredMembers.slice(0, visibleCount);
  const hasMore = visibleCount < filteredMembers.length;

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) => count + PAGE_SIZE);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  if (isLoadingOrg || isLoadingMembers) {
    return <MembersCardListSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
        <AddMember iconOnly />
      </div>

      {visibleMembers.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {search
            ? `Nenhum membro encontrado para "${search}".`
            : 'Nenhum membro encontrado.'}
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {visibleMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>

          {hasMore && <div ref={sentinelRef} className="h-1" />}

          <p className="pt-2 text-center text-xs text-muted-foreground">
            Toque num membro para alterar função ou status.
          </p>
        </>
      )}
    </div>
  );
}
