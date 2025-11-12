import { DiscordInteraction, IEvent } from "@/domain/reuse/event_interface";
import { IModal } from "@/domain/reuse/modal_interface";
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
import {ErrorCard, SuccessCard} from "../reuse/cards";
import { CreateProjectRequest } from "../requests/project_requests";
import { CreateProjectService } from "../services/create_project_service";
import { DiscordBotError } from "../reuse/discord_error";

export class CreateProjectEvent implements IEvent , IModal {
  private createProjectService : CreateProjectService;

  constructor(service : CreateProjectService){
    this.createProjectService = service;
  }

  getModalID(): string {
    return "createProjectModal";
  }
  async handleInteraction(interaction: DiscordInteraction): Promise<void> {
    if (interaction.isChatInputCommand()) {
      const chat = interaction as ChatInputCommandInteraction;
      await chat.showModal(this.getModal());
      return;
    }

    if (interaction.isModalSubmit()) {
      await this.handleModalSubmit(interaction as ModalSubmitInteraction);
      return;
    }

    console.log("Invalid Interaction");
  }

  async handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
    if (interaction.customId !== this.getModalID()) {
      return;
    }

    // Get the values from the modal
    if (!interaction.guildId) {
      await interaction.reply({
        embeds: [ErrorCard.getErrorCard("Guild Not Found","This interaction was not sent in a guild.")],
        flags : MessageFlags.Ephemeral
      });
      return;
    }
    const projectName = interaction.fields.getTextInputValue("project-name");
    const projectRoleName = interaction.fields.getTextInputValue("project-role-name");
    const deadline = interaction.fields.getTextInputValue("deadline");
    const projectDescription = interaction.fields.getTextInputValue("project-description");


    const req : CreateProjectRequest = {
        guildId : interaction.guildId!,
        projectName : projectName,
        projectDescription : projectDescription,
        projectRoleName : projectRoleName,
        deadline : deadline
    }

    try{
      await this.createProjectService.createProject(req);
    }catch(e){
      if (e instanceof DiscordBotError){
        await interaction.reply({
          embeds: [ErrorCard.getErrorCardFromError(e)],
          flags : MessageFlags.Ephemeral
        });
        return;
      }
      await interaction.reply({
        embeds: [ErrorCard.getErrorCard("Error Creating Project","An unknown error occurred.")],
        flags : MessageFlags.Ephemeral
      });
      return;
    }




    await interaction.reply({
      embeds: [SuccessCard.getSuccessCard("Project Created",`**Name:** ${projectName}\n**Role:** ${projectRoleName}\n**Deadline:** ${deadline}`)],
      flags : MessageFlags.Ephemeral
    });
  }
  getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("new-project")
      .setDescription("Create a new project (opens a modal)");
  }

  getModal() : ModalBuilder{
    const modal = new ModalBuilder()
      .setCustomId(this.getModalID())
      .setTitle("Create New Project");

    const projectName = new TextInputBuilder()
      .setCustomId("project-name")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("e.g. Apollo")
      .setRequired(true);
    
    const projectNameLabel = new LabelBuilder().setLabel("Project name").setTextInputComponent(projectName)

    const projectDescription = new TextInputBuilder().setCustomId("project-description").setStyle(TextInputStyle.Paragraph).setPlaceholder("Brief description of the project").setRequired(false);
    
    const projectDescriptionLabel = new LabelBuilder().setLabel("Project description").setTextInputComponent(projectDescription)

    const projectRole = new TextInputBuilder()
      .setCustomId("project-role-name")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("e.g. @Apollo Team")
      .setRequired(true);
    const projectRoleLabel = new LabelBuilder().setLabel("Role name").setTextInputComponent(projectRole)

    const deadline = new TextInputBuilder()
      .setCustomId("deadline")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("DD/MM/YYYY")
      .setRequired(true);
    
    const deadlineLabel = new LabelBuilder().setLabel("Deadline (DD/MM/YYYY) in CE").setTextInputComponent(deadline)


    modal.addLabelComponents(projectNameLabel, projectDescriptionLabel, projectRoleLabel, deadlineLabel);

    return modal;
  }
}
