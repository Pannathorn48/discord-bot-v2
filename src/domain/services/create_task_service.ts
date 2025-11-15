import { ProjectDatabase } from "@/domain/databases/project_database";
import { Project } from "@/generated/prisma/client";

export class CreateTaskService {
  private projectDatabase: ProjectDatabase;
  constructor(projectDatabase: ProjectDatabase) {
    this.projectDatabase = projectDatabase;
  }

  async getProjectsInGuild(guildId: string): Promise<Project[]> {
    return await this.projectDatabase.getProjectFromGuildId(guildId);
  }
}
