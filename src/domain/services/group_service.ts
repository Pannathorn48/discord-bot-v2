import { ProjectDatabase } from "@/domain/databases/project_database";
import { GroupDatabase } from "@/domain/databases/group_database";
import { Group } from "@/generated/prisma/client";
import { CreateGroupRequest } from "@/domain/requests/group_requests";
import { DiscordBotError } from "@/domain/reuse/discord_error";
import { CreateDate } from "@/utils/date_utils";
import { DiscordService } from "@/domain/services/discord_service";

export class GroupService {
  private groupDatabase: GroupDatabase;
  private projectDatabase: ProjectDatabase;
  private discordService: DiscordService;
  constructor(
    groupDatabase: GroupDatabase,
    projectDatabase: ProjectDatabase,
    discordService: DiscordService
  ) {
    this.groupDatabase = groupDatabase;
    this.discordService = discordService;
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

  public async createGroupInProject(req: CreateGroupRequest) {
    const project = await this.projectDatabase.getProjectFromProjectId(
      req.projectId
    );
    if (!project) {
      throw new DiscordBotError(
        "Project Not Found",
        "project is not found, please select another project"
      );
    }

    const role = await this.discordService.createRoleInGuild(
      req.guildId,
      req.groupRoleName
    );

    return await this.groupDatabase.createGroup({
      name: req.groupName,
      projectId: req.projectId,
      roleId: role.id,
      description: req.groupDescription,
      deadline: req.groupDeadline
        ? await CreateDate(req.groupDeadline)
        : undefined,
    });
  }
}
