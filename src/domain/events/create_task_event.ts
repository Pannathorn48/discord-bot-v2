import {
  IAutocomplete,
  ICommand,
  IModal,
} from "@/domain/reuse/event_interface";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  EmbedBuilder,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  ModalSubmitInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { TaskService } from "@/domain/services/task_service";
import { DiscordBotError } from "@/domain/reuse/discord_error";
import { ErrorCard } from "@/domain/reuse/cards";
import { projectAutocompleteOptions } from "@/domain/reuse/autocomplete";
import { ProjectService } from "@/domain/services/project_service";

export class CreateTaskEvent implements ICommand, IModal, IAutocomplete {
  private taskService: TaskService;
  private projectService: ProjectService;

  constructor(service: TaskService, projectService: ProjectService) {
    this.taskService = service;
    this.projectService = projectService;
  }
  getAutocompleteID(): string {
    return "new-task";
  }
  async handleAutocomplete(
    interaction: AutocompleteInteraction
  ): Promise<void> {
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name === "project") {
      projectAutocompleteOptions(this.projectService, interaction);
    }
  }
  getModalID(): string {
    return "new-task";
  }
  async getModal(...args: string[]): Promise<ModalBuilder> {
    if (!args || args.length != 1 || !args[0]) {
      throw new Error("Invalid arguments for getModal");
    }

    const modal = new ModalBuilder()
      .setCustomId(this.getModalID())
      .setTitle("Create New Task");

    const groups = await this.taskService.getGroupByProjectID(args[0]);
    if (!groups || groups.length === 0) {
      throw new DiscordBotError(
        "No Groups in this project",
        "Please create a group before adding tasks."
      );
    }

    const groupSelected = new LabelBuilder()
      .setLabel("Select Group")
      .setStringSelectMenuComponent(
        new StringSelectMenuBuilder().setCustomId("group-selected").addOptions(
          groups.map((p) => {
            return new StringSelectMenuOptionBuilder()
              .setLabel(p.name)
              .setValue(p.id as string)
              .setDescription(p.description || "No description");
          })
        )
      );

    const taskNameInput = new LabelBuilder()
      .setLabel("Task Name")
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("task-name")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("Enter the task name")
          .setRequired(true)
      );

    const taskDescriptionInput = new LabelBuilder()
      .setLabel("Task Description")
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("task-description")
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder("Enter the task description")
          .setRequired(false)
      );

    const taskDeadlineInput = new LabelBuilder()
      .setLabel("Task Deadline")
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("task-deadline")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("Enter the task deadline (DD/MM/YYYY)")
          .setRequired(false)
      );

    modal.addLabelComponents(
      groupSelected,
      taskNameInput,
      taskDescriptionInput,
      taskDeadlineInput
    );
    return modal;
  }

  async handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
    const groupId = interaction.fields.getStringSelectValues("group-selected");
    if (groupId.length === 0 || !groupId[0] || !groupId) {
      await interaction.reply({
        embeds: [
          ErrorCard.getErrorCardFromError(
            new DiscordBotError(
              "No Group Selected",
              "Please select a valid group to create the task in."
            )
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const taskName = interaction.fields.getTextInputValue("task-name");
    const taskDescription =
      interaction.fields.getTextInputValue("task-description");
    const taskDeadline = interaction.fields.getTextInputValue("task-deadline");
    try {
      const group = await this.taskService.createTask({
        groupId: groupId[0],
        taskName: taskName,
        taskDescription: taskDescription,
        taskDeadline: taskDeadline,
        userId: interaction.user.id,
      });

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🆕 Task Created — Success")
            .setDescription("Your task has been created successfully. 🎉")
            .setColor(0x57f287)
            .addFields([
              { name: "Task", value: `**${taskName}**`, inline: true },
              { name: "Group", value: `\`${group}\``, inline: true },
              {
                name: "Deadline",
                value:
                  taskDeadline && taskDeadline.trim().length > 0
                    ? `📅 ${taskDeadline}`
                    : "No deadline",
                inline: true,
              },
              {
                name: "Description",
                value:
                  taskDescription && taskDescription.trim().length > 0
                    ? taskDescription
                    : "No description provided",
              },
              {
                name: "Created by",
                value: `<@${interaction.user.id}>`,
                inline: true,
              },
            ])
            .setTimestamp(new Date())
            .setFooter({
              text: "Task Manager",
              iconURL: interaction.user.displayAvatarURL?.() ?? undefined,
            }),
        ],
      });
    } catch (error) {
      if (error instanceof DiscordBotError) {
        await interaction.reply({
          embeds: [ErrorCard.getErrorCardFromError(error)],
          flags: MessageFlags.Ephemeral,
        });
        return;
      } else {
        throw error;
      }
    }
  }
  async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const projectId = interaction.options.getString("project", true);
    await interaction.showModal(await this.getModal(projectId));
  }
  getSlashCommand(): RESTPostAPIApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName("new-task")
      .setDescription("Create a new task")
      .addStringOption((option) => {
        return option
          .setName("project")
          .setDescription("Project ID")
          .setRequired(true)
          .setAutocomplete(true);
      })
      .toJSON();
  }
}
