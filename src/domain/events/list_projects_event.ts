import { IEvent, DiscordInteraction } from "@/domain/reuse/event_interface";
import { InfoCard, ErrorCard } from "../reuse/cards";
import { ProjectDatabase } from "@/domain/databases/project_database";
import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import dayjs from "dayjs";

export default class ListProjectsEvent implements IEvent {
  private projectDb: ProjectDatabase;

  constructor(projectDb: ProjectDatabase) {
    this.projectDb = projectDb;
  }

  async handleInteraction(interaction: DiscordInteraction): Promise<void> {
    if (!interaction.isChatInputCommand()) {
      console.log("Invalid Interaction");
      return;
    }

    const chat = interaction as ChatInputCommandInteraction;

    if (!chat.guildId) {
      await chat.reply({
        embeds: [
          ErrorCard.getErrorCard(
            "Guild required",
            "This command must be run in a server (not in DMs).",
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      const projects = await this.projectDb.getProjectFromGuildId(chat.guildId);

      if (!projects || projects.length === 0) {
        await chat.reply({
          embeds: [InfoCard.getInfoCard("No projects found", "There are no projects registered for this server.")],
        });
        return;
      }

      // Build a description listing projects
      const lines = projects.map((p) => {
        const dl = p.deadline ? dayjs(p.deadline).format("DD/MM/YYYY") : "-";
        const desc = p.description ? ` — ${p.description}` : "";
        return `**${p.name}** (Role: <@&${p.role_id}>) — Deadline: ${dl}${desc}`;
      });

      const chunkSize = 10; // avoid exceeding embed limits; group into chunks if many
      const chunks: string[] = [];
      for (let i = 0; i < lines.length; i += chunkSize) {
        chunks.push(lines.slice(i, i + chunkSize).join("\n\n"));
      }

      // If multiple chunks, reply with the first chunk and followups for the rest
      await chat.reply({
        embeds: [
          InfoCard.getInfoCard("Projects in this server", undefined, [
            { name: `Projects (${projects.length})`, value: chunks[0] ?? "", inline: false },
          ]),
        ],
      });

      // Send additional follow-ups if there are more chunks
      for (let i = 1; i < chunks.length; i++) {
        await chat.followUp({
          embeds: [
            InfoCard.getInfoCard(`Projects (cont.)`, undefined, [
              { name: `More projects`, value: chunks[i] ?? "", inline: false },
            ]),
          ],
        });
      }
    } catch (err) {
      console.error("Failed to list projects:", err);
      await chat.reply({
        embeds: [ErrorCard.getErrorCard("Failed to list projects", "Check server logs for details.")],
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  getSlashCommand() {
    return new SlashCommandBuilder().setName("list-projects").setDescription("List all projects for this server");
  }
}
