import { IAutocomplete, ICommand } from "@/domain/reuse/event_interface";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Embed,
  EmbedBuilder,
  MessageFlags,
  RESTPostAPIApplicationCommandsJSONBody,
  SlashCommandBuilder,
} from "discord.js";
import { ProjectService } from "@/domain/services/project_service";
import { DiscordBotError } from "../reuse/discord_error";
import { ErrorCard } from "../reuse/cards";

export class AssignProjectEvent implements ICommand, IAutocomplete {
  private projectService: ProjectService;

  constructor(projectService: ProjectService) {
    this.projectService = projectService;
  }
  getAutocompleteID(): string {
    return "assign-project";
  }
  async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const projectId = interaction.options.getString("project", true);
    const user = interaction.options.getUser("user", true);

    try {
      const project = await this.projectService.assignProjectToUser(
        projectId,
        user.id
      );
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("✅ Project Assigned")
            .setDescription(
              `The project **${project.name}** has been assigned to <@${user.id}>.`
            )
            .setColor(0x57f287)
            .setAuthor({
              name: `Assigned by ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL() || "",
            })
            .addFields(
              { name: "Project ", value: String(project.name), inline: true },
              { name: "Assignee", value: `<@${user.id}>`, inline: true },
              ...(project.description
                ? [{ name: "Description", value: String(project.description) }]
                : [])
            )
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: "Project Manager" }),
        ],
      });
    } catch (error) {
      if (error instanceof DiscordBotError) {
        await interaction.reply({
          embeds: [ErrorCard.getErrorCardFromError(error)],
          flags: MessageFlags.Ephemeral,
        });
      }
      throw error;
    }
  }
  getSlashCommand(): RESTPostAPIApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName("assign-project")
      .setDescription("Assign a project to users")
      .addStringOption((option) =>
        option
          .setName("project")
          .setDescription("The ID of the project to assign")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The user to assign the project to")
          .setRequired(true)
      )
      .toJSON();
  }
  async handleAutocomplete(
    interaction: AutocompleteInteraction
  ): Promise<void> {
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name === "project") {
       
    }
  }
}
