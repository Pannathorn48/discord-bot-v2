import {
  DiscordInteraction,
  IEvent,
  IModal,
} from "@/domain/reuse/event_interface";
import {
  ChatInputCommandInteraction,
  LabelBuilder,
  ModalBuilder,
  ModalMessageModalSubmitInteraction,
  ModalSubmitInteraction,
  SelectMenuBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { CreateTaskService } from "../services/create_task_service";

export class CreateTaskEvent implements IEvent, IModal {
  private createTaskService: CreateTaskService;

  constructor(service: CreateTaskService) {
    this.createTaskService = service;
  }
  getModalID(): string {
    return "createTaskModal";
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
          .setOptions(
            project.map((p) => {
              return {
                label: p.name,
                value: p.id as string,
                description: p.description || "No description",
              };
            }),
          )
          .setPlaceholder("Select a project for the task"),
      );

    const taskNameInput = new LabelBuilder()
      .setLabel("Task Name")
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("task-name")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("Enter the task name")
          .setRequired(true),
      );

    const taskDescriptionInput = new LabelBuilder()
      .setLabel("Task Description")
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("task-description")
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder("Enter the task description")
          .setRequired(false),
      );

    const taskDeadlineInput = new LabelBuilder()
      .setLabel("Task Deadline")
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("task-deadline")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("Enter the task deadline (YYYY-MM-DD)")
          .setRequired(false),
      );

    modal.addLabelComponents(
      projectSelectedInput,
      taskNameInput,
      taskDescriptionInput,
      taskDeadlineInput,
    );
    return modal;
  }

  async handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
    console.log("Handling modal submit for create task");
    await interaction.reply("Task creation is not yet implemented.");
    return;
  }
  async handleInteraction(interaction: DiscordInteraction): Promise<void> {
    if (interaction.isChatInputCommand()) {
      const chat = interaction as ChatInputCommandInteraction;
      await chat.showModal(await this.getModal(interaction.guildId));
    }

    if (interaction.isModalSubmit()) {
      await this.handleModalSubmit(interaction as ModalSubmitInteraction);
      return;
    }

    console.log("Invalid Interaction");
    return;
  }
  getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("create-task")
      .setDescription("Create a new task");
  }
}
