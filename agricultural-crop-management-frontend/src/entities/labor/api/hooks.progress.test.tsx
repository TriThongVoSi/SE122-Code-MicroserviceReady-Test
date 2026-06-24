import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { taskKeys } from '@/entities/task';
import { laborKeys } from '../model/keys';
import { useEmployeeReportTaskProgress } from './hooks';

const httpMocks = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock('@/shared/api/http', () => ({
  default: {
    post: httpMocks.post,
  },
}));

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

describe('employee progress reporting cache updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalidates employee and farmer task/progress queries after progress report', async () => {
    httpMocks.post.mockResolvedValueOnce({
      data: {
        status: 200,
        code: 'SUCCESS',
        message: 'OK',
        result: {
          id: 9001,
          taskId: 102,
          taskTitle: 'Inspect Plot',
          seasonId: 33,
          seasonName: 'Rice - Plot A',
          employeeUserId: 8,
          employeeName: 'Worker Two',
          progressPercent: 100,
          note: 'Finished in field',
          evidenceUrl: null,
          loggedAt: '2026-06-04T09:30:00',
        },
      },
    });

    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useEmployeeReportTaskProgress(), { wrapper });

    await result.current.mutateAsync({
      taskId: 102,
      data: {
        progressPercent: 100,
        note: 'Finished in field',
      },
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: laborKeys.employeeTasksBase(),
      exact: false,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: laborKeys.employeeSeasonPlanBase(33),
      exact: false,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: laborKeys.seasonProgressBase(33),
      exact: false,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: taskKeys.listBySeason(33),
      exact: false,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: taskKeys.listWorkspace(),
      exact: false,
    });
  });
});
