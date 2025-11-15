import {
  ChatInputCommandInteraction,
  IAutocomplete,
  ICommand,
} from "@/domain/reuse/event_interface";
import { ListGroupService } from "@/domain/services/list_group_service";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";

export class ListGroupEvent implements ICommand, IAutocomplete {
  private listGroupService: ListGroupService;
  constructor(service: ListGroupService) {
    this.listGroupService = service;
  }
  getAutocompleteID(): string {
    return "list-groups";
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
  async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    if (interaction.isChatInputCommand()) {
      const chat = interaction as ChatInputCommandInteraction;

      const projectId = chat.options.getString("project", true);
      const groups = await this.listGroupService.getGroupsInProject(projectId);

      const groupLines = groups.map((g) => `• ${g.name}`);

      let description =
        groupLines.length > 0
          ? groupLines.join("\n")
          : "_No groups found in this project._";

      if (description.length > 4096) {
        description = description.slice(0, 4093) + "...";
      }

      const embed = new EmbedBuilder()
        .setTitle("Groups in Project")
        .setDescription(description)
        .setColor(0x00ae86)
        .setTimestamp()
        .setFooter({ text: `Total groups: ${groups.length}` });

      await chat.reply({ embeds: [embed] });

      return;
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
