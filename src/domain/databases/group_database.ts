import { Group, PrismaClient, UserGroup } from "@/generated/prisma/client";

export class GroupDatabase {
  private prisma: PrismaClient;
  constructor(client: PrismaClient) {
    this.prisma = client;
  }

  public async getGroupsFromProjectId(projectId: string): Promise<Group[]> {
    const groups: Group[] = await this.prisma.group.findMany({
      where: {
        projectId: projectId,
      },
    });
    return groups;
  }

  public async createGroup(req: {
    name: string;
    projectId: string;
    roleId: string;
    description?: string | undefined;
    deadline?: Date | undefined;
  }): Promise<Group> {
    const group = await this.prisma.group.create({
      data: {
        name: req.name,
        projectId: req.projectId,
        roleId: req.roleId,
        description: req.description || null,
        deadline: req.deadline || null,
      },
    });
    return group;
  }

  public async getGroupByProjectID(projectId: string): Promise<Group[]> {
    const groups: Group[] = await this.prisma.group.findMany({
      where: {
        projectId: projectId,
      },
    });
    return groups;
  }

  public async getGroupByID(groupId: string): Promise<Group | null> {
    const group: Group | null = await this.prisma.group.findUnique({
      where: {
        id: groupId,
      },
    });
    return group;
  }

  public async getGroupByUserID(userId: string): Promise<Group[]> {
    const groups = await this.prisma.group.findMany({
      where: {
        userGroups: {
          some: { userId },
        },
      },
    });
    return groups;
  }
}
