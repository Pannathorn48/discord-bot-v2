import { DiscordDatabase } from "@/domain/databases/discord_database";
import { DiscordBotError } from "../reuse/discord_error";
import { Role } from "discord.js";

export class DiscordService {
  private discordDatabase: DiscordDatabase;
  constructor(discordDatabase: DiscordDatabase) {
    this.discordDatabase = discordDatabase;
  }

  async createRoleInGuild(guildId: string, roleName: string): Promise<Role> {
    const exist = await this.discordDatabase.getRoleById(guildId, roleName);
    if (exist) {
      throw new DiscordBotError(
        "Role is Exist",
        "The role already exists. Please choose a different name."
      );
    }
    const role = await this.discordDatabase.createRoleInGuild(
      guildId,
      roleName
    );
    return role;
  }

  async deleteRoleInGuild(guildId: string, roleId: string): Promise<void> {
    const role = await this.discordDatabase.getRoleById(guildId, roleId);
    if (!role) {
      throw new DiscordBotError(
        "Role Not Found",
        "The specified role does not exist in the guild."
      );
    }
    await this.discordDatabase.deleteRoleById(guildId, roleId);
    return;
  }
}
