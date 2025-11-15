import { ICommand } from "@/domain/reuse/event_interface";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default class PingEvent implements ICommand {
  async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    console.log("Ping command received with Body:", interaction);
    await interaction.reply({
      content: "Pong!",
    });
  }
  getSlashCommand(): any {
    return new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Replies with Pong!");
  }
}
