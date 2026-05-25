import type { Task } from '../context/TaskContext';

export const isOverdue = (task: Task): boolean => {
  if (task.completed || !task.dueDate) return false;
  
  const now = new Date();
  const [year, month, day] = task.dueDate.split('-').map(Number);
  let hours = 23;
  let minutes = 59;
  
  if (task.dueTime) {
    [hours, minutes] = task.dueTime.split(':').map(Number);
  }
  
  // Create date using local timezone
  const taskDate = new Date(year, month - 1, day, hours, minutes);
  return taskDate < now;
};
