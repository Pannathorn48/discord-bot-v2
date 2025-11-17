import { PrismaClient } from "@/generated/prisma/client";

export class TaskDatabase {
  private client: PrismaClient;
  constructor(client: PrismaClient) {
    this.client = client;
  }

  async createTask(model: {
    name: string;
    userId: string;
    description: string | null;
    deadline: Date | null;
    groupId: string;
  }): Promise<void> {
    await this.client.task.create({
      data: {
        name: model.name,
        description: model.description,
        deadline: model.deadline,
        groupId: model.groupId,
        userId: model.userId,
      },
    });
  }
}
