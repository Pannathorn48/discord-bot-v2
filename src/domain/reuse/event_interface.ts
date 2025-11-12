import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
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
