import { Client, Role } from "discord.js";

export class DiscordDatabase {
  private client: Client;
  constructor(client: Client) {
    this.client = client;
  }

  async getRoleById(guildId: string, roleId: string): Promise<Role | null> {
    const guild = await this.client.guilds.fetch(guildId);
    const guildFetched = await guild.fetch();
    const role = await guildFetched.roles.fetch(roleId);
    if (role) {
      return role;
    }
    return null;
  }

  async deleteRoleById(guildId: string, roleId: string): Promise<void> {
    const guild = await this.client.guilds.fetch(guildId);
    const guildFetched = await guild.fetch();
    const role = await guildFetched.roles.fetch(roleId);
    if (role) {
      await role.delete();
    }
    return;
  }

  async createRoleInGuild(guildId: string, roleName: string): Promise<Role> {
    const guild = await this.client.guilds.fetch(guildId);
    const guildFetched = await guild.fetch();
    const role = await guildFetched.roles.create({ name: roleName });
    return role;
  }
}
