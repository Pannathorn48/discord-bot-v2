import { IAutocomplete, IEvent, IModal } from "@/domain/reuse/event_interface";
import PingEvent from "@/domain/events/ping_event";
import { CreateProjectEvent } from "@/domain/events/create_project_event";
import DeleteRoleEvent from "@/domain/events/delete_role_event";
import ListProjectsEvent from "@/domain/events/list_projects_event";
import { CreateProjectService } from "@/domain/services/create_project_service";
import { PrismaClient } from "@/generated/prisma/client";
import { ProjectDatabase } from "@/domain/databases/project_database";
import { CreateTaskEvent } from "@/domain/events/create_task_event";
import { CreateTaskService } from "@/domain/services/create_task_service";
import { CreateGroupService } from "@/domain/services/create_group_service";
import { CreateGroupEvent } from "@/domain/events/create_group_event";
import { ListGroupEvent } from "@/domain/events/list_group_event";
import { ListGroupService } from "@/domain/services/list_group_service";
import { GroupDatabase } from "@/domain/databases/group_database";
import { group } from "console";

export class EventHandler {
  private static instance: EventHandler | null = null;
  public handler: Map<string, IEvent>;
  public modalHandler: Map<string, IModal> = new Map();
  public autoCompleteHandler: Map<string, IAutocomplete> = new Map();
  private constructor() {
    this.handler = new Map<string, IEvent>();

    const prismaClient = new PrismaClient();

    const pingEvent = new PingEvent();

    const projectDatabase = new ProjectDatabase(prismaClient);
    const createProjectService = new CreateProjectService(projectDatabase);
    const createProjectEvent = new CreateProjectEvent(createProjectService);

    const listProjectsEvent = new ListProjectsEvent(projectDatabase);
    const deleteRoleEvent = new DeleteRoleEvent();

    const createGroupService = new CreateGroupService(projectDatabase);
    const createGroupEvent = new CreateGroupEvent(createGroupService);

    const createTaskService = new CreateTaskService(projectDatabase);
    const createTaskEvent = new CreateTaskEvent(createTaskService);

    const groupDatabase = new GroupDatabase(prismaClient);
    const listGroupService = new ListGroupService(
      groupDatabase,
      projectDatabase
    );
    const listGroupEvent = new ListGroupEvent(listGroupService);

    this.handler.set(pingEvent.getSlashCommand().toJSON().name, pingEvent);
    this.handler.set(
      createProjectEvent.getSlashCommand().toJSON().name,
      createProjectEvent
    );
    this.handler.set(
      listProjectsEvent.getSlashCommand().toJSON().name,
      listProjectsEvent
    );
    this.handler.set(
      deleteRoleEvent.getSlashCommand().toJSON().name,
      deleteRoleEvent
    );
    this.handler.set(
      createTaskEvent.getSlashCommand().toJSON().name,
      createTaskEvent
    );

    this.handler.set(
      createGroupEvent.getSlashCommand().toJSON().name,
      createGroupEvent
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
  }

  public static getInstance(): EventHandler {
    if (!EventHandler.instance) {
      EventHandler.instance = new EventHandler();
    }
    return EventHandler.instance;
  }
}
