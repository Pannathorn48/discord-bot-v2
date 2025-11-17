import { Client, HexColorString, Role } from "discord.js";

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

  async deleteRoleById(guildId: string, roleId: string): Promise<boolean> {
    const guild = await this.client.guilds.fetch(guildId);
    const guildFetched = await guild.fetch();
    const role = await guildFetched.roles.fetch(roleId);
    if (role) {
      await role.delete();
      return true;
    }
    return false;
  }

  async createRoleInGuild(
    guildId: string,
    roleName: string,
    color?: HexColorString
  ): Promise<Role> {
    const guild = await this.client.guilds.fetch(guildId);
    const guildFetched = await guild.fetch();
    const role = await guildFetched.roles.create({
      name: roleName,
      colors: { primaryColor: color ? color : "Random" },
    });
    return role;
  }

  async getRoleByName(guildId: string, roleName: string): Promise<Role | null> {
    const guild = await this.client.guilds.fetch(guildId);
    const guildFetched = await guild.fetch();
    // Ensure roles cache is populated
    await guildFetched.roles.fetch();
    const role = guildFetched.roles.cache.find((r) => r.name === roleName);
    return role ?? null;
  }
}
