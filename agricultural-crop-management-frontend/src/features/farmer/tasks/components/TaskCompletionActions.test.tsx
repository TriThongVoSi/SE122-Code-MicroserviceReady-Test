import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListView } from './ListView';
import { TaskCard } from './TaskCard';
import type { Task } from '../types';

vi.mock('@/hooks/useI18n', () => ({
  useI18n: () => ({
    locale: 'en-US',
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

vi.mock('react-dnd', () => ({
  useDrag: () => [{ isDragging: false }, vi.fn()],
}));

vi.mock('@/shared/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => (
    <div role="menu">{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    disabled,
    onClick,
    className,
  }: {
    children: ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
  }) => (
    <button type="button" disabled={disabled} onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

const baseTask: Task = {
  id: '102',
  title: 'Inspect Plot',
  type: 'scouting',
  crop: 'Rice',
  plot: 'Plot A',
  seasonId: 33,
  assignee: 'Worker Two',
  assigneeInitials: 'WT',
  dueDate: '2026-06-04',
  status: 'in-progress',
  notes: '',
  attachments: 0,
  priority: 'medium',
};

const clickCompleteAction = async () => {
  fireEvent.click(await screen.findByText('tasks.actions.complete'));
};

describe('task completion actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onComplete from the list row action menu', async () => {
    const onComplete = vi.fn();

    render(
      <ListView
        tasks={[baseTask]}
        selectedTasks={[]}
        onSelectAll={vi.fn()}
        onSelectTask={vi.fn()}
        onDelete={vi.fn()}
        onComplete={onComplete}
      />
    );

    await clickCompleteAction();

    expect(onComplete).toHaveBeenCalledWith('102');
  });

  it('calls onComplete from the board card action menu', async () => {
    const onComplete = vi.fn();

    render(<TaskCard task={baseTask} onDelete={vi.fn()} onComplete={onComplete} />);

    await clickCompleteAction();

    expect(onComplete).toHaveBeenCalledWith('102');
  });

  it('does not render complete action for completed tasks', () => {
    render(
      <TaskCard
        task={{ ...baseTask, status: 'completed' }}
        onDelete={vi.fn()}
        onComplete={vi.fn()}
      />
    );

    expect(screen.queryByText('tasks.actions.complete')).not.toBeInTheDocument();
  });
});
