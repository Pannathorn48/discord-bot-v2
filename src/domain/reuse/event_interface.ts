import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";

export type DiscordInteraction =
  | AutocompleteInteraction
  | ChatInputCommandInteraction
  | ModalSubmitInteraction;

export interface IEvent {
  handleInteraction(interaction: DiscordInteraction): Promise<void>;
  getSlashCommand(): any;
}

export interface IModal {
  getModalID(): string;
  getModal(...args: any[]): Promise<ModalBuilder>;
  handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void>;
}

export interface IAutocomplete {
  getAutocompleteID(): string;
  handleAutocomplete(interaction: AutocompleteInteraction): Promise<void>;
}
