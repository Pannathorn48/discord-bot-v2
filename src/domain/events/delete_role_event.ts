import { IEvent, DiscordInteraction } from "@/domain/reuse/event_interface";
import { ErrorCard, SuccessCard } from "../reuse/cards";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
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

    if (!chat.guild) {
      await chat.reply({
        embeds: [
          ErrorCard.getErrorCard(
            "Guild required",
            "This command must be run in a server (not in DMs).",
          ),
        ],
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
      });
      return;
    }

    // Build confirmation buttons
    const confirmButton = new ButtonBuilder()
      .setCustomId("confirm_delete")
      .setLabel("Confirm Delete")
      .setStyle(ButtonStyle.Danger);

    const cancelButton = new ButtonBuilder()
      .setCustomId("cancel_delete")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      confirmButton,
      cancelButton,
    );

    await chat.reply({
      embeds: [
        SuccessCard.getSuccessCard(
          "Confirm role deletion",
          `Are you sure you want to delete the role **${role.name}**?`,
          [
            { name: "🆔 Role ID", value: role.id, inline: true },
            { name: "📛 Role name", value: role.name, inline: true },
          ],
        ),
      ],
      components: [row],
    });

    // Fetch the reply so we can await a button interaction on it
    const replyMsg = await chat.fetchReply();

    // Wait for the button click from the same user
    try {
      const buttonInteraction = await replyMsg.awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 15000,
        filter: (i: any) => i.user.id === chat.user.id,
      });

      // Acknowledge button interaction
      await buttonInteraction.deferUpdate();

      if (buttonInteraction.customId === "confirm_delete") {
        try {
          await role.delete(`Deleted via /delete-role by ${chat.user.tag}`);

          const disabledRow =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              confirmButton.setDisabled(true),
              cancelButton.setDisabled(true),
            );

          await chat.editReply({
            embeds: [
              SuccessCard.getSuccessCard("Role deleted", undefined, [
                { name: "🆔 Role ID", value: role.id, inline: true },
                { name: "📛 Role name", value: role.name, inline: true },
              ]),
            ],
            components: [disabledRow],
          });
        } catch (err) {
          console.error("Failed to delete role:", err);
          const disabledRow =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              confirmButton.setDisabled(true),
              cancelButton.setDisabled(true),
            );
          await chat.editReply({
            embeds: [
              ErrorCard.getErrorCard(
                "Failed to delete role",
                "Make sure the bot has the Manage Roles permission and its role is higher than the target role.",
              ),
            ],
            components: [disabledRow],
          });
        }
      } else {
        // Cancelled by user
        const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          confirmButton.setDisabled(true),
          cancelButton.setDisabled(true),
        );
        await chat.editReply({
          embeds: [
            ErrorCard.getErrorCard("Cancelled", "Role deletion cancelled."),
          ],
          components: [disabledRow],
        });
      }
    } catch (err) {
      // Timeout or other error waiting for interaction
      const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        confirmButton.setDisabled(true),
        cancelButton.setDisabled(true),
      );
      await chat.editReply({
        embeds: [
          ErrorCard.getErrorCard(
            "Timed out",
            "No confirmation received — action cancelled.",
          ),
        ],
        components: [disabledRow],
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
