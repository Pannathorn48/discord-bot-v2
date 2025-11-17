import { ProjectDatabase } from "@/domain/databases/project_database";
import { DiscordBotError } from "@/domain/reuse/discord_error";
import { CreateProjectRequest } from "@/domain/requests/project_requests";
import { DiscordService } from "@/domain/services/discord_service";
import { CreateDate } from "@/utils/date_utils";
import { $Enums, Project } from "@/generated/prisma/client";
import { isValidProjectStatus } from "@/utils/enum_utils";

export class ProjectService {
  private projectDatabase: ProjectDatabase;
  private discordService: DiscordService;

  constructor(
    projectDatabase: ProjectDatabase,
    discordService: DiscordService
  ) {
    this.projectDatabase = projectDatabase;
    this.discordService = discordService;
  }

  async deleteProjectById(projectId: string): Promise<string> {
    const project = await this.projectDatabase.getProjectById(projectId);
    if (!project) {
      throw new DiscordBotError(
        "Project Not Found",
        "The specified project does not exist."
      );
    }
    await this.projectDatabase.deleteProjectById(projectId);
    await this.discordService.deleteRoleInGuild(
      project.guildId,
      project.roleId
    );

    return project.name;
  }

  async getProjectsInGuildAndName(
    guildId: string,
    name: string
  ): Promise<Project[]> {
    return await this.projectDatabase.getProjectFileredByGuildeID(
      guildId,
      name
    );
  }

  async getProjectsInGuild(
    guildId: string,
    status?: string
  ): Promise<Project[]> {
    if (status && status !== "ALL" && !isValidProjectStatus(status)) {
      throw new DiscordBotError(
        "Invalid Status",
        `The status '${status}' is not valid. Valid statuses are: OPEN, CLOSED, DONE, ALL.`
      );
    }

    return await this.projectDatabase.getProjectFromGuildId(
      guildId,
      status === "ALL" ? undefined : (status as $Enums.PrjectStatus)
    );
  }

  async createProject(req: CreateProjectRequest): Promise<void> {
    const deadline = await CreateDate(req.deadline);
    const role = await this.discordService.createRoleInGuild(
      req.guildId,
      req.projectRoleName,
      req.projectRoleColor
    );
    await this.projectDatabase.createProject({
      name: req.projectName,
      guildId: req.guildId,
      roleId: role.id,
      description: req.projectDescription || null,
      deadline: deadline,
    });
  }
}
