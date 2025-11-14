import { EmbedBuilder, EmbedField } from "discord.js";
import { DiscordBotError } from "./discord_error";

export class ErrorCard {
  static getErrorCard(title: string, description: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle("❌ " + title)
      .setDescription(description)
      .setColor(0xff3b30) // Red color
      .setTimestamp()
      .setFooter({
        text: "Please retry again • Error occurred",
      });

    return embed;
  }

  static getErrorCardFromError(error: DiscordBotError): EmbedBuilder {
    return this.getErrorCard(error.title, error.message);
  }
}

export class SuccessCard {
  static getSuccessCard(
    title: string,
    description?: string,
    fields?: EmbedField[],
  ): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle("✅ " + title)
      .setColor(0x34c759) // Green color
      .setTimestamp()
      .setFooter({
        text: "Operation completed successfully",
      });

    if (description) {
      embed.setDescription(description);
    }

    if (fields && fields.length > 0) {
      embed.addFields(fields);
    }

    return embed;
  }
}

export class InfoCard {
  static getInfoCard(
    title: string,
    description?: string,
    fields?: EmbedField[],
  ): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle("ℹ️ " + title)
      .setColor(0x007aff) // Blue color
      .setTimestamp()
      .setFooter({
        text: "Information",
      });

    if (description) {
      embed.setDescription(description);
    }

    if (fields && fields.length > 0) {
      embed.addFields(fields);
    }

    return embed;
  }
}

export class WarningCard {
  static getWarningCard(title: string, description: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle("⚠️ " + title)
      .setDescription(description)
      .setColor(0xffcc00) // Yellow/Orange color
      .setTimestamp()
      .setFooter({
        text: "Warning • Please review",
      });

    return embed;
  }
}
