import { CreateProjectRequest } from "@/domain/requests/project_requests";
import { Bot } from "@/configs/bot";
import { Guild, PermissionFlagsBits, Role } from "discord.js";
import { DiscordBotError } from "@/domain/reuse/discord_error";
import { DateFromString } from "@/utils/date_utils";
import { ProjectDatabase } from "@/domain/databases/project_database";

export class CreateProjectService {
    private projectDatabase: ProjectDatabase;
    constructor(projectDatabase: ProjectDatabase) {
        this.projectDatabase = projectDatabase;
    }
    async createProject(req: CreateProjectRequest): Promise<void> {
        try{
            const deadline = await this.createDate(req.deadline);
            await this.createRoleInGuild(req.guildId, req.projectRoleName);
            await this.projectDatabase.createProject({
                name: req.projectName,
                guild_id: req.guildId,
                role_name: req.projectRoleName,
                description: req.projectDescription || null,
                deadline: deadline,
            })
            
        }catch(e){
            if (e instanceof DiscordBotError) {
                throw e;
            }
            console.error("Error creating project role:", e);
        }

        return;

    }

    private async createRoleInGuild(guildId : string, roleName : string) : Promise<Role> {
          const client = Bot.getClientInstance();
        if (!client) {
            throw new Error("Discord client not initialized");
        }

        try {
            const guild: Guild = await client.guilds.fetch(guildId);
            let existing = guild.roles.cache.find((r) => r.name === roleName);
            if (!existing) {
                const created = await guild.roles.create({
                    name: roleName,
                    reason: `Project role for ${roleName}`,
                    mentionable: true,
                    permissions: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                    ]
                });

                return created;
            }

            throw new DiscordBotError("Role Already Exists",`The role with name ${roleName} already exists in the guild.`);
        } catch (err) {
            console.error("Failed to create or fetch role:", err);
            throw err;
        }
    }

    private async createDate(deadlineStr : string) : Promise<Date>{
        const deadlineDate = DateFromString(deadlineStr);
        if (!deadlineDate) {
            throw new DiscordBotError("Invalid date format","Please use DD/MM/YYYY.");
        }

        if (deadlineDate.isBefore(Date.now())){
            throw new DiscordBotError("Invalid deadline","The deadline must be a future date.");
        };   
        return deadlineDate.toDate();
    }
}

