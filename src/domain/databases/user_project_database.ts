import { PrismaClient, UserProject } from "@/generated/prisma/client";

export class UserProjectDatabase {
  private client: PrismaClient;
  constructor(client: PrismaClient) {
    this.client = client;
  }

  public async createUserProject(req: {
    userId: string;
    projectId: string;
  }): Promise<void> {
    await this.client.userProject.create({
      data: {
        userId: req.userId,
        projectId: req.projectId,
      },
    });
  }

  public async getUserProjectsByUserIDAndProjectID(
    userId: string,
    projectId: string
  ): Promise<UserProject | null> {
    return await this.client.userProject.findUnique({
      where: {
        userId_projectId: {
          userId: userId,
          projectId: projectId,
        },
      },
    });
  }
}
