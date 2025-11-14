import { ProjectDatabase } from "@/domain/databases/project_database";

export class CreateGroupService {
  private projectDatabase: ProjectDatabase;
  constructor(projectDatabase: ProjectDatabase) {
    this.projectDatabase = projectDatabase;
  }

  public async getProjectsInGuild(guildId: string) {
    return await this.projectDatabase.getProjectFromGuildId(guildId);
  }
}
