import { ICommand, IModal } from "@/domain/reuse/event_interface";
import {
  ChatInputCommandInteraction,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { ErrorCard, SuccessCard } from "@/domain/reuse/cards";
import { CreateProjectRequest } from "@/domain/requests/project_requests";
import { DiscordBotError } from "@/domain/reuse/discord_error";
import { ProjectService } from "@/domain/services/project_service";

export class CreateProjectEvent implements ICommand, IModal {
  private createProjectService: ProjectService;

  constructor(service: ProjectService) {
    this.createProjectService = service;
  }

  getModalID(): string {
    return "new-project";
  }
  async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.showModal(await this.getModal());
  }

  async handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
    if (interaction.customId !== this.getModalID()) {
      return;
    }

    // Get the values from the modal
    if (!interaction.guildId) {
      await interaction.reply({
        embeds: [
          ErrorCard.getErrorCard(
            "Guild Not Found",
            "This interaction was not sent in a guild."
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const projectName = interaction.fields.getTextInputValue("project-name");
    const projectRoleName =
      interaction.fields.getTextInputValue("project-role-name");
    const deadline = interaction.fields.getTextInputValue("deadline");
    const projectDescription = interaction.fields.getTextInputValue(
      "project-description"
    );

    const req: CreateProjectRequest = {
      guildId: interaction.guildId!,
      projectName: projectName,
      projectDescription: projectDescription,
      projectRoleName: projectRoleName,
      deadline: deadline,
    };

    try {
      await this.createProjectService.createProject(req);
    } catch (e) {
      if (e instanceof DiscordBotError) {
        await interaction.reply({
          embeds: [ErrorCard.getErrorCardFromError(e)],
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      await interaction.reply({
        embeds: [
          ErrorCard.getErrorCard(
            "Error Creating Project",
            "An unknown error occurred."
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.reply({
      embeds: [
        SuccessCard.getSuccessCard(
          "Project Created",
          `**Name:** ${projectName}\n**Role:** ${projectRoleName}\n**Deadline:** ${deadline}`
        ),
      ],
    });
  }
  getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("new-project")
      .setDescription("Create a new project (opens a modal)");
  }

  async getModal(): Promise<ModalBuilder> {
    const modal = new ModalBuilder()
      .setCustomId(this.getModalID())
      .setTitle("Create New Project");

    const projectName = new TextInputBuilder()
      .setCustomId("project-name")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("e.g. Apollo")
      .setRequired(true);

    const projectNameLabel = new LabelBuilder()
      .setLabel("Project name")
      .setTextInputComponent(projectName);

    const projectDescription = new TextInputBuilder()
      .setCustomId("project-description")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Brief description of the project")
      .setRequired(false);

    const projectDescriptionLabel = new LabelBuilder()
      .setLabel("Project description")
      .setTextInputComponent(projectDescription);

    const projectRole = new TextInputBuilder()
      .setCustomId("project-role-name")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("e.g. @Apollo Team")
      .setRequired(true);
    const projectRoleLabel = new LabelBuilder()
      .setLabel("Role name")
      .setTextInputComponent(projectRole);

    const deadline = new TextInputBuilder()
      .setCustomId("deadline")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("DD/MM/YYYY")
      .setRequired(true);

    const deadlineLabel = new LabelBuilder()
      .setLabel("Deadline (DD/MM/YYYY) in CE")
      .setTextInputComponent(deadline);

    modal.addLabelComponents(
      projectNameLabel,
      projectDescriptionLabel,
      projectRoleLabel,
      deadlineLabel
    );

    return modal;
  }
}
