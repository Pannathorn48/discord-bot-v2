import { IAutocomplete, ICommand } from "@/domain/reuse/event_interface";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  MessageFlags,
  RESTPostAPIApplicationCommandsJSONBody,
  SlashCommandBuilder,
} from "discord.js";
import { DiscordBotError } from "@/domain/reuse/discord_error";
import { ErrorCard, SuccessCard } from "@/domain/reuse/cards";
import { ProjectService } from "@/domain/services/project_service";
import { projectAutocompleteOptions } from "../reuse/autocomplete";

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
    await projectAutocompleteOptions(this.deleteProjectService, interaction);
  }
  async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const projectId = interaction.options.getString("project", true);
    // await interaction.deferReply();

    try {
      const projectName =
        await this.deleteProjectService.deleteProjectById(projectId);
      await interaction.reply({
        embeds: [
          SuccessCard.getSuccessCard(
            "Project Deleted",
            `The project **${projectName}** has been successfully deleted.`
          ),
        ],
      });
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
  getSlashCommand(): RESTPostAPIApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName("delete-project")
      .setDescription("Delete a project")
      .addStringOption((option) => {
        return option
          .setName("project")
          .setDescription("select project to delete")
          .setRequired(true)
          .setAutocomplete(true);
      })
      .toJSON();
  }
}
