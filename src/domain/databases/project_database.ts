import { $Enums, PrismaClient, Project } from "@/generated/prisma/client";
import { CreateProjectDatabaseRequest } from "@/domain/requests/project_requests";

export class ProjectDatabase {
  private prisma: PrismaClient;
  constructor(client: PrismaClient) {
    this.prisma = client;
  }

  async getProjectFromProjectId(projectId: string): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
    return project;
  }

  async getProjectFromGuildId(
    guildId: string,
    filteredStatus?: $Enums.PrjectStatus
  ): Promise<Project[]> {
    const whereClause: { guildId: string; status?: $Enums.PrjectStatus } = {
      guildId: guildId,
    };
    if (filteredStatus) {
      whereClause.status = filteredStatus;
    }

    const project: Project[] = await this.prisma.project.findMany({
      where: whereClause,
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
        guildId: guildId,
        name: {
          contains: name,
          mode: "insensitive",
        },
      },
      include: {
        groups: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return project;
  }

  async deleteProjectById(projectId: string): Promise<void> {
    await this.prisma.project.delete({
      where: {
        id: projectId,
      },
    });
  }

  async getProjectById(projectId: string): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
    return project;
  }
}
