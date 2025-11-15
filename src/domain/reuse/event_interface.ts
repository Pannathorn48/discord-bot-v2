import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";

export interface ICommand {
  handleCommand(interaction: ChatInputCommandInteraction): Promise<void>;
  getSlashCommand(): RESTPostAPIApplicationCommandsJSONBody;
}

export interface IModal {
  getModalID(): string;
  getModal(...args: string[]): Promise<ModalBuilder>;
  handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void>;
}

export interface IAutocomplete {
  getAutocompleteID(): string;
  handleAutocomplete(interaction: AutocompleteInteraction): Promise<void>;
}
