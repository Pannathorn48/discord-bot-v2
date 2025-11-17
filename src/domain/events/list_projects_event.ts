import { IAutocomplete, ICommand } from "@/domain/reuse/event_interface";
import { InfoCard, ErrorCard } from "@/domain/reuse/cards";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  MessageFlags,
  RESTPostAPIApplicationCommandsJSONBody,
  SlashCommandBuilder,
} from "discord.js";
import dayjs from "dayjs";
import { ProjectService } from "@/domain/services/project_service";
import { DiscordBotError } from "@/domain/reuse/discord_error";

export default class ListProjectsEvent implements ICommand, IAutocomplete {
  private projectService: ProjectService;

  constructor(projectDb: ProjectService) {
    this.projectService = projectDb;
  }
  getAutocompleteID(): string {
    return "list-projects";
  }

  async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
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
            "This command must be run in a server (not in DMs)."
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const statusFilter = chat.options.getString("status") ?? undefined;
    try {
      const projects = await this.projectService.getProjectsInGuild(
        chat.guildId,
        statusFilter
      );

      if (!projects || projects.length === 0) {
        await chat.reply({
          embeds: [
            InfoCard.getInfoCard(
              "No projects found",
              "There are no projects registered for this server."
            ),
          ],
        });
        return;
      }

      // Build a description listing projects
      const lines = projects.map((p) => {
        const dl = p.deadline ? dayjs(p.deadline).format("DD/MM/YYYY") : "-";
        const desc = p.description ? ` — ${p.description}` : "";
        return `**${p.name}** (Role: <@&${p.roleId}>) — Deadline: ${dl}${desc}`;
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
            {
              name: `Projects (${projects.length})`,
              value: chunks[0] ?? "",
              inline: false,
            },
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
      if (err instanceof DiscordBotError) {
        await chat.reply({
          embeds: [ErrorCard.getErrorCardFromError(err)],
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      console.error("Failed to list projects:", err);
      await chat.reply({
        embeds: [
          ErrorCard.getErrorCard(
            "Failed to list projects",
            "Check server logs for details."
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  getSlashCommand(): RESTPostAPIApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName("list-projects")
      .setDescription("List all projects for this server")
      .addStringOption((option) => {
        return option
          .setName("status")
          .setDescription("Optional status filter for project status")
          .setRequired(false)
          .setAutocomplete(true);
      })
      .toJSON();
  }

  async handleAutocomplete(
    interaction: AutocompleteInteraction
  ): Promise<void> {
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name === "status") {
      const statuses = ["ALL", "OPEN", "CLOSED", "DONE"];
      const filtered = statuses.filter((status) =>
        status.startsWith(focusedOption.value.toUpperCase())
      );

      await interaction.respond(
        filtered.map((status) => ({
          name: status,
          value: status,
        }))
      );
    }
  }
}
