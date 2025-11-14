import {
  DiscordInteraction,
  IEvent,
  IModal,
} from "@/domain/reuse/event_interface";
import { ModalBuilder, ModalSubmitInteraction } from "discord.js";

export class CreateGroupEvent implements IEvent, IModal {
  getModalID(): string {
    return "createGroupModal";
  }
  getModal(...args: any[]): Promise<ModalBuilder> {
    throw new Error("Method not implemented.");
  }
  handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
    throw new Error("Method not implemented.");
  }
  handleInteraction(interaction: DiscordInteraction): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getSlashCommand() {
    throw new Error("Method not implemented.");
  }
}
