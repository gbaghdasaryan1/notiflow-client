import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { metaService } from './services';
import type { MetaDmsPage, MetaPlatform } from './types';

// ── Connect (OAuth redirect) ──────────────────────────────────────────────────
export const useConnectMeta = () =>
  useMutation({
    mutationFn: async (platform: MetaPlatform) => {
      const { data } = await metaService.getAuthUrl(platform);
      window.location.href = data.url;
    },
  });

// ── OAuth callback ────────────────────────────────────────────────────────────
export const useMetaCallback = () =>
  useMutation({
    mutationFn: ({ code, state }: { code: string; state: string }) =>
      metaService.handleCallback(code, state).then((r) => r.data),
  });

// ── Connection status ─────────────────────────────────────────────────────────
export const useMetaStatus = (platform: MetaPlatform) =>
  useQuery({
    queryKey:  ['meta', 'status', platform],
    queryFn:   () => metaService.fetchStatus(platform).then((r) => r.data),
    retry:     false,
    staleTime: 30_000,
  });

// ── Paginated DMs ─────────────────────────────────────────────────────────────
export const useMetaDms = (platform: MetaPlatform) =>
  useInfiniteQuery({
    queryKey:         ['meta', 'dms', platform],
    queryFn:          ({ pageParam }) =>
      metaService.fetchDms(platform, pageParam).then((r) => r.data),
    getNextPageParam: (lastPage: MetaDmsPage) =>
      lastPage.nextCursor ?? lastPage.cursors?.after ?? null,
    initialPageParam: undefined as string | undefined,
    retry:            false,
    staleTime:        30_000,
  });
