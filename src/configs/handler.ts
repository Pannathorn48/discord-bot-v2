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
import { DeleteProjectEvent } from "@/domain/events/delete_project_event";
import { ProjectService } from "@/domain/services/project_service";
import { DiscordDatabase } from "@/domain/databases/discord_database";
import { DiscordService } from "@/domain/services/discord_service";
import { GroupService } from "@/domain/services/group_service";
import { TaskService } from "@/domain/services/task_service";
import { Client } from "discord.js";
import { TaskDatabase } from "@/domain/databases/task_database";
import { UserProjectDatabase } from "@/domain/databases/user_project_database";
import { AssignProjectEvent } from "@/domain/events/assign_project_event";

export class EventHandler {
  private static instance: EventHandler | null = null;
  public commandHandler: Map<string, ICommand>;
  public modalHandler = new Map<string, IModal>();
  public autoCompleteHandler = new Map<string, IAutocomplete>();
  private constructor(client: Client) {
    this.commandHandler = new Map<string, ICommand>();
    // infrastructure setup
    const prismaClient = new PrismaClient();

    // For Databases
    const groupDatabase = new GroupDatabase(prismaClient);
    const projectDatabase = new ProjectDatabase(prismaClient);
    const taskDatabase = new TaskDatabase(prismaClient);
    const discordDatabase = new DiscordDatabase(client);
    const userProjectDatabase = new UserProjectDatabase(prismaClient);

    // For Services
    const discordService = new DiscordService(discordDatabase);
    const projectService = new ProjectService(
      projectDatabase,
      discordService,
      userProjectDatabase
    );
    const groupService = new GroupService(
      groupDatabase,
      projectDatabase,
      discordService
    );
    const taskService = new TaskService(
      projectDatabase,
      groupDatabase,
      taskDatabase
    );

    // For Events
    const pingEvent = new PingEvent();
    const createProjectEvent = new CreateProjectEvent(projectService);
    const listProjectsEvent = new ListProjectsEvent(projectService);
    const deleteRoleEvent = new DeleteRoleEvent();
    const createGroupEvent = new CreateGroupEvent(groupService);
    const createTaskEvent = new CreateTaskEvent(taskService, projectService);
    const deleteProjectEvent = new DeleteProjectEvent(projectService);
    const listGroupEvent = new ListGroupEvent(groupService, projectService);
    const assignProjectEvent = new AssignProjectEvent(projectService);

    this.commandHandler.set(pingEvent.getSlashCommand().name, pingEvent);
    this.commandHandler.set(
      createProjectEvent.getSlashCommand().name,
      createProjectEvent
    );
    this.commandHandler.set(
      listProjectsEvent.getSlashCommand().name,
      listProjectsEvent
    );
    this.commandHandler.set(
      deleteRoleEvent.getSlashCommand().name,
      deleteRoleEvent
    );
    this.commandHandler.set(
      createTaskEvent.getSlashCommand().name,
      createTaskEvent
    );

    this.commandHandler.set(
      createGroupEvent.getSlashCommand().name,
      createGroupEvent
    );

    this.commandHandler.set(
      deleteProjectEvent.getSlashCommand().name,
      deleteProjectEvent
    );

    this.commandHandler.set(
      listGroupEvent.getSlashCommand().name,
      listGroupEvent
    );

    this.commandHandler.set(
      assignProjectEvent.getSlashCommand().name,
      assignProjectEvent
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

    this.autoCompleteHandler.set(
      listProjectsEvent.getAutocompleteID(),
      listProjectsEvent
    );

    this.autoCompleteHandler.set(
      createTaskEvent.getAutocompleteID(),
      createTaskEvent
    );

    this.autoCompleteHandler.set(
      assignProjectEvent.getAutocompleteID(),
      assignProjectEvent
    );
  }

  public static getInstance(client: Client): EventHandler {
    if (!EventHandler.instance) {
      EventHandler.instance = new EventHandler(client);
    }
    return EventHandler.instance;
  }
}
