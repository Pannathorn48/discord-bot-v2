import { PrismaClient, Project } from "@/generated/prisma/client";
import {
  CreateProjectDatabaseRequest,
  CreateProjectRequest,
} from "../requests/project_requests";

export class ProjectDatabase {
  private prisma: PrismaClient;
  constructor(client: PrismaClient) {
    this.prisma = client;
  }

  async getProjectFromGuildId(guildId: string): Promise<Project[]> {
    const project: Project[] = await this.prisma.project.findMany({
      where: {
        guildId: guildId,
      },
    });

    return project;
  }

  async createProject(req: CreateProjectDatabaseRequest) {
    const project = await this.prisma.project.create({
      data: {
        name: req.name,
        guildId: req.guildId,
        roleId: req.roleId,
        description: req.description || null,
        deadline: req.deadline,
      },
    });

    return project;
  }

  async getProjectFileredByGuildeID(
    guildId: string,
    name: string
  ): Promise<Project[]> {
    const project: Project[] = await this.prisma.project.findMany({
      where: {
        AND: [{ guildId: guildId }, { name: { contains: name } }],
      },
    });
    return project;
  }
}
