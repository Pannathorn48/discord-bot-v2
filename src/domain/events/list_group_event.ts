import {
  DiscordInteraction,
  IAutocomplete,
  IEvent,
} from "@/domain/reuse/event_interface";
import { ListGroupService } from "@/domain/services/list_group_service";
import { AutocompleteInteraction, SlashCommandBuilder } from "discord.js";

export class ListGroupEvent implements IEvent, IAutocomplete {
  private listGroupService: ListGroupService;
  constructor(service: ListGroupService) {
    this.listGroupService = service;
  }
  getAutocompleteID(): string {
    return this.getSlashCommand().toJSON().name;
  }
  async handleAutocomplete(
    interaction: AutocompleteInteraction
  ): Promise<void> {
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name === "project") {
      const projects = await this.listGroupService.getProjectsInGuildFiltered(
        interaction.guildId as string,
        focusedOption.value
      );

      await interaction.respond(
        projects.map((project) => ({
          name: project.name,
          description: project.description || "No description",
          value: project.id as string,
        }))
      );

      return;
    }
  }
  async handleInteraction(interaction: DiscordInteraction): Promise<void> {
    if (interaction.isChatInputCommand()) {
    }
  }
  getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("list-groups")
      .setDescription("List all groups in projects")
      .addStringOption((option) =>
        option
          .setName("project")
          .setDescription("Project name")
          .setRequired(true)
          .setAutocomplete(true)
      );
  }
}
