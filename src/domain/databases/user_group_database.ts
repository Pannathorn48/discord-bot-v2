import { PrismaClient, UserGroup } from "@/generated/prisma/client";

export class UserGroupDatabase {
  private client: PrismaClient;
  constructor(client: PrismaClient) {
    this.client = client;
  }

  async getUserGroupByUserIDAndGroupID(
    userId: string,
    groupId: string
  ): Promise<UserGroup> {
    const userGroup = await this.client.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupId,
        },
      },
    });
    return userGroup!;
  }

  async createUserGroup(userId: string, groupId: string): Promise<void> {
    await this.client.userGroup.create({
      data: {
        userId: userId,
        groupId: groupId,
      },
    });
  }
}
