import {
  ICommand,
  ChatInputCommandInteraction,
} from "@/domain/reuse/event_interface";
import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { ErrorCard } from "../reuse/cards";

export default class PingEvent implements ICommand {
  async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.isChatInputCommand()) {
      console.log("Invalid Interaction");
      return;
    }

    interaction = interaction as ChatInputCommandInteraction;

    const message = interaction.options.getString("message");
    if (!message) {
      await interaction.reply({
        embeds: [
          ErrorCard.getErrorCard(
            "No message provided",
            "Please provide a message to ping."
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    await interaction.reply({
      content: "Pong!" + (message ? ` You said: ${message}` : ""),
    });
  }
  getSlashCommand(): any {
    return new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Replies with Pong!")
      .addStringOption((option) =>
        option
          .setName("message")
          .setDescription("Enter a message")
          .setRequired(false)
      );
  }
}
