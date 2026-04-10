import type { Task, TaskStatus } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { KANBAN_COLUMNS } from '../constants';

interface BoardViewProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  disableMutations?: boolean;
}

export function BoardView({
  tasks,
  onTaskMove,
  onDelete,
  disableMutations = false,
}: BoardViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {KANBAN_COLUMNS.map((column) => (
        <KanbanColumn
          key={column.status}
          status={column.status}
          title={column.title}
          color={column.color}
          tasks={tasks.filter((task) => task.status === column.status)}
          onTaskMove={onTaskMove}
          onDelete={onDelete}
          disableMutations={disableMutations}
        />
      ))}
    </div>
  );
}




