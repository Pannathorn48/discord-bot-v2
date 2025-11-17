export interface CreateTaskRequest {
  userId: string;
  groupId: string;
  taskName: string;
  taskDeadline?: string;
  taskDescription?: string;
}
