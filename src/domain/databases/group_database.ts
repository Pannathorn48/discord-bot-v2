import { Group, PrismaClient } from "@/generated/prisma/client";

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
}
