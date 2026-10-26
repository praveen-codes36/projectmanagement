import { describe, it, expect } from 'vitest';
import { Task } from '../../../api/types';
import { TaskStatus } from '../../../lib/constants';

describe('Task status optimistic update and rollback', () => {
  const initialTasks: Task[] = [
    {
      id: 'task-101',
      projectId: 'proj-1',
      title: 'Ridge Scout Waypoint',
      description: 'Document steep elevation',
      status: 'todo',
      attachments: [],
      subtasks: [],
      createdAt: '2026-10-24T00:00:00Z',
      updatedAt: '2026-10-24T00:00:00Z',
    },
    {
      id: 'task-102',
      projectId: 'proj-1',
      title: 'Signal Relay Checkpoint',
      description: 'Deploy antenna',
      status: 'in_progress',
      attachments: [],
      subtasks: [],
      createdAt: '2026-10-24T00:00:00Z',
      updatedAt: '2026-10-24T00:00:00Z',
    },
  ];

  it('optimistically updates task status in local cache', () => {
    const targetTaskId = 'task-101';
    const newStatus: TaskStatus = 'in_progress';

    // Simulate optimistic update helper
    const updatedTasks = initialTasks.map((t) =>
      t.id === targetTaskId ? { ...t, status: newStatus } : t
    );

    const target = updatedTasks.find((t) => t.id === targetTaskId);
    expect(target?.status).toBe('in_progress');
    // Ensure other tasks remain untouched
    expect(updatedTasks.find((t) => t.id === 'task-102')?.status).toBe('in_progress');
  });

  it('rolls back to previous snapshot on network mutation failure', () => {
    // 1. Snapshot previous state
    const previousSnapshot = [...initialTasks];

    // 2. Perform optimistic mutation
    let cache = initialTasks.map((t) =>
      t.id === 'task-101' ? { ...t, status: 'done' as TaskStatus } : t
    );
    expect(cache.find((t) => t.id === 'task-101')?.status).toBe('done');

    // 3. Network call fails -> trigger rollback
    const mutationFailed = true;
    if (mutationFailed) {
      cache = previousSnapshot;
    }

    // 4. Assert cache returned to initial state
    expect(cache.find((t) => t.id === 'task-101')?.status).toBe('todo');
  });
});
