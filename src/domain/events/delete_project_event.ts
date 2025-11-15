import { IAutocomplete, ICommand } from "@/domain/reuse/event_interface";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { DiscordBotError } from "@/domain/reuse/discord_error";
import { ErrorCard } from "@/domain/reuse/cards";
import { ProjectService } from "@/domain/services/project_service";

export class DeleteProjectEvent implements ICommand, IAutocomplete {
  private deleteProjectService: ProjectService;
  constructor(service: ProjectService) {
    this.deleteProjectService = service;
  }
  getAutocompleteID(): string {
    return "delete-project";
  }
  async handleAutocomplete(
    interaction: AutocompleteInteraction
  ): Promise<void> {
    // `getFocused()` returns the user's current typed value (string/number/bool).
    const focused = interaction.options.getFocused();
    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.respond([]);
      return;
    }

    const query = focused ? String(focused) : "";

    const projects = await this.deleteProjectService.getProjectsInGuildAndName(
      guildId,
      query
    );

    await interaction.respond(
      projects.map((p) => {
        return {
          name: p.name,
          description: p.description || "No description",
          value: p.id as string,
        };
      })
    );
  }
  async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const projectId = interaction.options.getString("project", true);
    // await interaction.deferReply();

    try {
      await this.deleteProjectService.deleteProjectById(projectId);
      await interaction.reply({ content: `Project deleted: ${projectId}` });
    } catch (err) {
      if (err instanceof DiscordBotError) {
        await interaction.reply({
          embeds: [ErrorCard.getErrorCardFromError(err)],
        });
        return;
      } else {
        throw err;
      }
    }
  }
  getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("delete-project")
      .setDescription("Delete a project")
      .addStringOption((option) => {
        return option
          .setName("project")
          .setDescription("select project to delete")
          .setRequired(true)
          .setAutocomplete(true);
      });
  }
}
