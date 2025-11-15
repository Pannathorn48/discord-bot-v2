import { ProjectDatabase } from "@/domain/databases/project_database";
import { DiscordBotError } from "../reuse/discord_error";

export class DeleteProjectService {
  private projectDatabase: ProjectDatabase;

  constructor(projectDatabase: ProjectDatabase) {
    this.projectDatabase = projectDatabase;
  }

  async deleteProjectById(projectId: string): Promise<void> {
    const project = await this.projectDatabase.getProjectById(projectId);
    if (!project) {
      throw new DiscordBotError(
        "Project Not Found",
        "The specified project does not exist."
      );
    }
    await this.projectDatabase.deleteProjectById(projectId);
    return;
  }
}
