import { ICommand, IModal } from "@/domain/reuse/event_interface";
import {
  ChatInputCommandInteraction,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { DiscordBotError } from "@/domain/reuse/discord_error";
import { GroupService } from "@/domain/services/group_service";

export class CreateGroupEvent implements ICommand, IModal {
  private createGroupService: GroupService;

  constructor(service: GroupService) {
    this.createGroupService = service;
  }
  getModalID(): string {
    return "new-group";
  }
  async getModal(...args: any[]): Promise<ModalBuilder> {
    if (args.length != 1 || !args[0]) {
      throw new Error("Invalid arguments for getModal");
    }
    const project = await this.createGroupService.getProjectsInGuild(args[0]);

    if (project.length === 0 || !project) {
      throw new DiscordBotError(
        "No Projects Found",
        "Please create a project before creating a group."
      );
    }
    const modal = new ModalBuilder()
      .setCustomId(this.getModalID())
      .setTitle("Create New Group");

    const projectSelectedInput = new LabelBuilder()
      .setLabel("Select Project")
      .setDescription("Choose a project for the group")
      .setStringSelectMenuComponent(
        new StringSelectMenuBuilder()
          .setCustomId("project-selected")
          .setRequired(true)
          .setOptions(
            project.map((p) => {
              return {
                label: p.name,
                value: p.id as string,
                description: p.description || "No description",
              };
            })
          )
      );

    const groupName = new LabelBuilder()
      .setLabel("Group Name")
      .setDescription("Enter the name of the group")
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("group-name")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("Enter group name")
          .setRequired(true)
      );

    const groupDescription = new LabelBuilder()
      .setLabel("Group Description")
      .setDescription("Enter a brief description of the group")
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("group-description")
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder("Enter group description")
          .setRequired(false)
      );

    const groupRoleName = new LabelBuilder()
      .setLabel("Group Role Name")
      .setDescription("Enter the role name for the group")
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("group-role-name")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("e.g. @Developers")
          .setRequired(false)
      );

    modal.addLabelComponents(
      projectSelectedInput,
      groupName,
      groupDescription,
      groupRoleName
    );
    return modal;
  }
  async handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
    await interaction.reply({
      content: "Group creation is not yet implemented.",
    });
  }
  async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.showModal(await this.getModal(interaction.guildId));
  }
  getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("new-group")
      .setDescription("Create a new group");
  }
}
