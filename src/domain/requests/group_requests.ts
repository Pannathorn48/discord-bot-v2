export interface CreateGroupRequest {
  projectId: string;
  guildId: string;
  groupName: string;
  groupDeadline?: string;
  groupDescription?: string;
  groupRoleName: string;
}
