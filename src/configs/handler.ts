import { IEvent } from "@/domain/reuse/event_interface";
import PingEvent from "@/domain/events/ping_event";
import { CreateProjectEvent } from "@/domain/events/create_project_event";
import DeleteRoleEvent from "@/domain/events/delete_role_event";
import ListProjectsEvent from "@/domain/events/list_projects_event";
import { IModal } from "@/domain/reuse/modal_interface";
import { CreateProjectService } from "@/domain/services/create_project_service";
import { PrismaClient } from "@/generated/prisma/client";
import { ProjectDatabase } from "@/domain/databases/project_database";

export class EventHandler {
  private static instance: EventHandler | null = null;
  public handler: Map<string, IEvent>;
  public modalHandlers: Map<string, IModal>;
  private constructor() {
    this.handler = new Map<string, IEvent>();
    this.modalHandlers = new Map<string, IModal>();

    const prismaClient = new PrismaClient();

    const pingEvent = new PingEvent();

    const projectDatabase = new ProjectDatabase(prismaClient);
    const createProjectService = new CreateProjectService(projectDatabase);
    const createProjectEvent = new CreateProjectEvent(createProjectService);

    const listProjectsEvent = new ListProjectsEvent(projectDatabase);
    const deleteRoleEvent = new DeleteRoleEvent();
    // Use the command JSON name to key the handler map so lookups by interaction.commandName work
    this.handler.set(pingEvent.getSlashCommand().toJSON().name, pingEvent);
    this.handler.set(
      createProjectEvent.getSlashCommand().toJSON().name,
      createProjectEvent,
    );
    this.handler.set(listProjectsEvent.getSlashCommand().toJSON().name, listProjectsEvent);
    this.handler.set(deleteRoleEvent.getSlashCommand().toJSON().name, deleteRoleEvent);

    // Register modal handlers
    this.modalHandlers.set(createProjectEvent.getModalID(), createProjectEvent);
  }

  public static getInstance(): EventHandler {
    if (!EventHandler.instance) {
      EventHandler.instance = new EventHandler();
    }
    return EventHandler.instance;
  }
}
