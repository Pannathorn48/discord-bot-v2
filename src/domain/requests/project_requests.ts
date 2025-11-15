import { HexColorString } from "discord.js";

export interface CreateProjectRequest {
  guildId: string;
  projectName: string;
  projectDescription?: string;
  projectRoleName: string;
  projectRoleColor?: HexColorString;
  deadline: string;
}

export interface CreateProjectDatabaseRequest {
  guildId: string;
  name: string;
  description: string | null;
  roleId: string;
  deadline: Date;
}
