import { ICommand } from "@/domain/reuse/event_interface";
import {
  ChatInputCommandInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
  SlashCommandBuilder,
} from "discord.js";

export class ListProjectAssigneeEvent implements ICommand {
  handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getSlashCommand(): RESTPostAPIApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName("list-project-assignee")
      .setDescription("List all assignees of a project")
      .addStringOption((option) => {
        return option
          .setName("project")
          .setDescription("Select a project")
          .setRequired(true)
          .setAutocomplete(true);
      })
      .toJSON();
  }
}
