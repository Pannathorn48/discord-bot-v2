import { IEvent, DiscordInteraction } from "@/domain/reuse/event_interface";
import { ErrorCard, SuccessCard } from "../reuse/cards";
import {
  ChatInputCommandInteraction,
  MessageFlags,
  Role,
  SlashCommandBuilder,
} from "discord.js";

export default class DeleteRoleEvent implements IEvent {
  async handleInteraction(interaction: DiscordInteraction): Promise<void> {
    if (!interaction.isChatInputCommand()) {
      console.log("Invalid Interaction");
      return;
    }

    const chat = interaction as ChatInputCommandInteraction;

    // Ensure this is used in a guild
    if (!chat.guild) {
      await chat.reply({
        embeds: [
          ErrorCard.getErrorCard(
            "Guild required",
            "This command must be run in a server (not in DMs).",
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const role = chat.options.getRole("role", true) as Role;
    if (!role) {
      await chat.reply({
        embeds: [
          ErrorCard.getErrorCard(
            "Role not found",
            "Please provide a valid role to delete.",
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      // Attempt to delete the role
      await role.delete(`Deleted via /delete-role by ${chat.user.tag}`);

      await chat.reply({
        embeds: [
          SuccessCard.getSuccessCard("Role deleted", undefined, [
            { name: "🆔 Role ID", value: role.id, inline: true },
            { name: "📛 Role name", value: role.name, inline: true },
          ]),
        ],
        flags: MessageFlags.Ephemeral,
      });
    } catch (err) {
      console.error("Failed to delete role:", err);
      await chat.reply({
        embeds: [
          ErrorCard.getErrorCard(
            "Failed to delete role",
            "Make sure the bot has the Manage Roles permission and its role is higher than the target role.",
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("delete-role")
      .setDescription("Delete a role from the server")
      .addRoleOption((opt) =>
        opt.setName("role").setDescription("Role to delete").setRequired(true),
      );
  }
}
