import { ProjectDatabase } from "@/domain/databases/project_database";
import { Group, Project } from "@/generated/prisma/client";
import { GroupDatabase } from "@/domain/databases/group_database";
import { CreateTaskRequest } from "@/domain/requests/task_request";
import { CreateDate } from "@/utils/date_utils";
import { TaskDatabase } from "@/domain/databases/task_database";
import { DiscordBotError } from "../reuse/discord_error";
import { group } from "console";

export class TaskService {
  private projectDatabase: ProjectDatabase;
  private groupDatabase: GroupDatabase;
  private taskDatabase: TaskDatabase;
  constructor(
    projectDatabase: ProjectDatabase,
    groupDatabase: GroupDatabase,
    taskDatabase: TaskDatabase
  ) {
    this.projectDatabase = projectDatabase;
    this.groupDatabase = groupDatabase;
    this.taskDatabase = taskDatabase;
  }

  async createTask(req: CreateTaskRequest): Promise<string> {
    const groupExists = await this.groupDatabase.getGroupByID(req.groupId);
    if (!groupExists) {
      throw new DiscordBotError(
        "Selected Group Not Found",
        "Please select a valid group."
      );
    }

    const model = {
      name: req.taskName,
      description: req.taskDescription || null,
      deadline: req.taskDeadline ? await CreateDate(req.taskDeadline) : null,
      groupId: req.groupId,
      userId: req.userId,
    };
    await this.taskDatabase.createTask(model);
    return groupExists.name;
  }

  async getGroupByProjectID(projectId: string): Promise<Group[]> {
    return await this.groupDatabase.getGroupByProjectID(projectId);
  }
}
