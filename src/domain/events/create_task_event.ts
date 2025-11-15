import { ICommand, IModal } from "@/domain/reuse/event_interface";
import {
  ChatInputCommandInteraction,
  LabelBuilder,
  ModalBuilder,
  ModalMessageModalSubmitInteraction,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { TaskService } from "@/domain/services/task_service";

export class CreateTaskEvent implements ICommand, IModal {
  private createTaskService: TaskService;

  constructor(service: TaskService) {
    this.createTaskService = service;
  }
  getModalID(): string {
    return "new-task";
  }
  async getModal(...args: any[]): Promise<ModalBuilder> {
    if (!args || args.length != 1) {
      throw new Error("Invalid arguments for getModal");
    }

    const modal = new ModalBuilder()
      .setCustomId(this.getModalID())
      .setTitle("Create New Task");
    const project = await this.createTaskService.getProjectsInGuild(args[0]);

    const projectSelectedInput = new LabelBuilder()
      .setLabel("Select Project")
      .setStringSelectMenuComponent(
        new StringSelectMenuBuilder()
          .setCustomId("project-selected")
          .addOptions(
            project.map((p) => {
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
          .setPlaceholder("Enter the task deadline (YYYY-MM-DD)")
          .setRequired(false)
      );

    modal.addLabelComponents(
      projectSelectedInput,
      taskNameInput,
      taskDescriptionInput,
      taskDeadlineInput
    );
    return modal;
  }

  async handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
    console.log("Handling modal submit for create task");
    await interaction.reply("Task creation is not yet implemented.");
    return;
  }
  async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.showModal(await this.getModal(interaction.guildId));
  }
  getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("new-task")
      .setDescription("Create a new task");
  }
}
