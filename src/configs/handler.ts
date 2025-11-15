import {
  IAutocomplete,
  ICommand,
  IModal,
} from "@/domain/reuse/event_interface";
import PingEvent from "@/domain/events/ping_event";
import { CreateProjectEvent } from "@/domain/events/create_project_event";
import DeleteRoleEvent from "@/domain/events/delete_role_event";
import ListProjectsEvent from "@/domain/events/list_projects_event";
import { PrismaClient } from "@/generated/prisma/client";
import { ProjectDatabase } from "@/domain/databases/project_database";
import { CreateTaskEvent } from "@/domain/events/create_task_event";
import { CreateGroupEvent } from "@/domain/events/create_group_event";
import { ListGroupEvent } from "@/domain/events/list_group_event";
import { GroupDatabase } from "@/domain/databases/group_database";
import { group } from "console";
import { DeleteProjectEvent } from "@/domain/events/delete_project_event";
import { ProjectService } from "@/domain/services/project_service";
import { Bot } from "./bot";
import { DiscordDatabase } from "@/domain/databases/discord_database";
import { DiscordService } from "@/domain/services/discord_service";
import { GroupService } from "@/domain/services/group_service";
import { TaskService } from "@/domain/services/task_service";
import { Client, GatewayIntentBits } from "discord.js";

export class EventHandler {
  private static instance: EventHandler | null = null;
  public commandHandler: Map<string, ICommand>;
  public modalHandler: Map<string, IModal> = new Map();
  public autoCompleteHandler: Map<string, IAutocomplete> = new Map();
  private constructor(client: Client) {
    this.commandHandler = new Map<string, ICommand>();
    // infrastructure setup
    const prismaClient = new PrismaClient();

    // For Databases
    const groupDatabase = new GroupDatabase(prismaClient);
    const projectDatabase = new ProjectDatabase(prismaClient);
    const discordDatabase = new DiscordDatabase(client);

    // For Services
    const discordService = new DiscordService(discordDatabase);
    const projectService = new ProjectService(projectDatabase, discordService);
    const groupService = new GroupService(groupDatabase, projectDatabase);
    const taskService = new TaskService(projectDatabase);

    // For Events
    const pingEvent = new PingEvent();
    const createProjectEvent = new CreateProjectEvent(projectService);
    const listProjectsEvent = new ListProjectsEvent(projectService);
    const deleteRoleEvent = new DeleteRoleEvent();
    const createGroupEvent = new CreateGroupEvent(groupService);
    const createTaskEvent = new CreateTaskEvent(taskService);
    const deleteProjectEvent = new DeleteProjectEvent(projectService);
    const listGroupEvent = new ListGroupEvent(groupService);

    this.commandHandler.set(
      pingEvent.getSlashCommand().toJSON().name,
      pingEvent
    );
    this.commandHandler.set(
      createProjectEvent.getSlashCommand().toJSON().name,
      createProjectEvent
    );
    this.commandHandler.set(
      listProjectsEvent.getSlashCommand().toJSON().name,
      listProjectsEvent
    );
    this.commandHandler.set(
      deleteRoleEvent.getSlashCommand().toJSON().name,
      deleteRoleEvent
    );
    this.commandHandler.set(
      createTaskEvent.getSlashCommand().toJSON().name,
      createTaskEvent
    );

    this.commandHandler.set(
      createGroupEvent.getSlashCommand().toJSON().name,
      createGroupEvent
    );

    this.commandHandler.set(
      deleteProjectEvent.getSlashCommand().toJSON().name,
      deleteProjectEvent
    );

    // for modal handlers
    this.modalHandler.set(createProjectEvent.getModalID(), createProjectEvent);
    this.modalHandler.set(createTaskEvent.getModalID(), createTaskEvent);
    this.modalHandler.set(createGroupEvent.getModalID(), createGroupEvent);

    // for autocomplete handlers
    this.autoCompleteHandler.set(
      listGroupEvent.getAutocompleteID(),
      listGroupEvent
    );

    this.autoCompleteHandler.set(
      deleteProjectEvent.getAutocompleteID(),
      deleteProjectEvent
    );
  }

  public static getInstance(client: Client): EventHandler {
    if (!EventHandler.instance) {
      EventHandler.instance = new EventHandler(client);
    }
    return EventHandler.instance;
  }
}
