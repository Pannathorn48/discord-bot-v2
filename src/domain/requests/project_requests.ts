import dayjs from "dayjs";

export interface CreateProjectRequest {
  guildId: string;
  projectName: string;
  projectDescription?: string;
  projectRoleName: string;
  deadline: string;
}

export interface CreateProjectDatabaseRequest {
  guildId: string;
  name: string;
  description: string | null;
  roleId: string;
  deadline: Date;
}
