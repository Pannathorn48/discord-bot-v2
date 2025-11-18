import { IAutocomplete, ICommand } from "@/domain/reuse/event_interface";
import { GroupService } from "@/domain/services/group_service";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";
import { projectAutocompleteOptions } from "../reuse/autocomplete";
import { ProjectService } from "../services/project_service";

export class ListGroupEvent implements ICommand, IAutocomplete {
  private projectService: ProjectService;
  private groupService: GroupService;
  constructor(groupService: GroupService, projectService: ProjectService) {
    this.groupService = groupService;
    this.projectService = projectService;
  }
  getAutocompleteID(): string {
    return "list-groups";
  }
  async handleAutocomplete(
    interaction: AutocompleteInteraction
  ): Promise<void> {
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name === "project") {
      await projectAutocompleteOptions(this.projectService, interaction);
    }
  }
  async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    if (interaction.isChatInputCommand()) {
      const chat = interaction as ChatInputCommandInteraction;

      const projectId = chat.options.getString("project", true);
      const groups = await this.groupService.getGroupsInProject(projectId);

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
  getSlashCommand(): RESTPostAPIApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName("list-groups")
      .setDescription("List all groups in projects")
      .addStringOption((option) =>
        option
          .setName("project")
          .setDescription("Project name")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .toJSON();
  }
}
