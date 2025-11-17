import {
  IAutocomplete,
  ICommand,
  IModal,
} from "@/domain/reuse/event_interface";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  LabelBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

export default class PingEvent implements ICommand {
  handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    console.log("Ping command received with Body:", interaction);
    await interaction.reply({
      content: "Pong!",
    });
  }
  getSlashCommand(): RESTPostAPIApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Replies with Pong!")
      .toJSON();
  }
}
