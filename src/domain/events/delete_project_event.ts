import { IAutocomplete, ICommand } from "@/domain/reuse/event_interface";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { DeleteProjectService } from "../services/delete_project_service";
import { DiscordBotError } from "../reuse/discord_error";
import { ErrorCard } from "../reuse/cards";

export class DeleteProjectEvent implements ICommand, IAutocomplete {
  private deleteProjectService: DeleteProjectService;
  constructor(service: DeleteProjectService) {
    this.deleteProjectService = service;
  }
  getAutocompleteID(): string {
    return "delete-project";
  }
  handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const projectId = interaction.options.getString("project-id", true);

    try {
      await this.deleteProjectService.deleteProjectById(projectId);
    } catch (err) {
      if (err instanceof DiscordBotError) {
        await interaction.reply({
          embeds: [ErrorCard.getErrorCardFromError(err)],
          flags: MessageFlags.Ephemeral,
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
          .setName("project-id")
          .setDescription("ID of the project to delete")
          .setRequired(true)
          .setAutocomplete(true);
      });
  }
}
