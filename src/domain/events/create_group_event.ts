import { ICommand, IModal } from "@/domain/reuse/event_interface";
import {
  ChatInputCommandInteraction,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  ModalSubmitInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { DiscordBotError } from "@/domain/reuse/discord_error";
import { GroupService } from "@/domain/services/group_service";
import { ErrorCard, SuccessCard } from "@/domain/reuse/cards";
import { CreateGroupRequest } from "@/domain/requests/group_requests";

export class CreateGroupEvent implements ICommand, IModal {
  private groupService: GroupService;

  constructor(service: GroupService) {
    this.groupService = service;
  }
  getModalID(): string {
    return "new-group";
  }
  async getModal(...args: string[]): Promise<ModalBuilder> {
    if (args.length != 1 || !args[0]) {
      throw new Error("Invalid arguments for getModal");
    }
    const project = await this.groupService.getProjectsInGuild(args[0]);

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

    const groupDeadline = new LabelBuilder()
      .setLabel("Group Sub Deadline")
      .setDescription("Enter the deadline for the group (DD/MM/YYYY) in CE")
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("group-sub-deadline")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("e.g. 31/12/2026")
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
          .setRequired(true)
      );

    modal.addLabelComponents(
      projectSelectedInput,
      groupName,
      groupDescription,
      groupDeadline,
      groupRoleName
    );
    return modal;
  }
  async handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
    if (interaction.customId !== this.getModalID()) {
      return;
    }
    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.reply({
        embeds: [
          ErrorCard.getErrorCard(
            "Guild ID is required",
            "Please run this command in a server."
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const req: CreateGroupRequest = {
      guildId: guildId,
      projectId:
        interaction.fields.getStringSelectValues("project-selected")[0] ?? "",
      groupName: interaction.fields.getTextInputValue("group-name"),
      groupDescription:
        interaction.fields.getTextInputValue("group-description"),
      groupDeadline: interaction.fields.getTextInputValue("group-sub-deadline"),
      groupRoleName: interaction.fields.getTextInputValue("group-role-name"),
    };

    try {
      await this.groupService.createGroupInProject(req);
    } catch (error) {
      if (error instanceof DiscordBotError) {
        await interaction.reply({
          embeds: [ErrorCard.getErrorCardFromError(error)],
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      throw error;
    }

    await interaction.reply({
      embeds: [
        SuccessCard.getSuccessCard(
          "Group Created",
          `The group **${req.groupName}** has been successfully created.`
        ),
      ],
    });
  }
  async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    if (interaction.guildId) {
      try {
        await interaction.showModal(await this.getModal(interaction.guildId));
        return;
      } catch (error) {
        if (error instanceof DiscordBotError) {
          await interaction.reply({
            embeds: [ErrorCard.getErrorCardFromError(error)],
            flags: MessageFlags.Ephemeral,
          });
        } else {
          throw error;
        }
      }
      return;
    } else {
      await interaction.reply({
        embeds: [
          ErrorCard.getErrorCard(
            "Guild ID is required",
            "Please run this command in a server."
          ),
        ],
      });
      return;
    }
  }
  getSlashCommand(): RESTPostAPIApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName("new-group")
      .setDescription("Create a new group")
      .toJSON();
  }
}
