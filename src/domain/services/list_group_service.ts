import { GroupDatabase } from "@/domain/databases/group_database";
import { Group } from "@/generated/prisma/client";
import { ProjectDatabase } from "../databases/project_database";

export class ListGroupService {
  private groupDatabase: GroupDatabase;
  private projectDatabase: ProjectDatabase;
  constructor(groupDatabase: GroupDatabase, projectDatabase: ProjectDatabase) {
    this.groupDatabase = groupDatabase;
    this.projectDatabase = projectDatabase;
  }

  public async getGroupsInProject(projectId: string): Promise<Group[]> {
    return await this.groupDatabase.getGroupsFromProjectId(projectId);
  }

  public async getProjectsInGuild(guildId: string) {
    return await this.projectDatabase.getProjectFromGuildId(guildId);
  }

  public async getProjectsInGuildFiltered(guildId: string, name: string) {
    return await this.projectDatabase.getProjectFileredByGuildeID(
      guildId,
      name
    );
  }
}
