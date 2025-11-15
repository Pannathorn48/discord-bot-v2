import {
  Client,
  Events,
  GatewayIntentBits,
  ModalSubmitInteraction,
  REST,
  Routes,
} from "discord.js";
import { DiscordBotError } from "@/domain/reuse/discord_error";
import { Config } from "@/configs/config";
import { EventHandler } from "@/configs/handler";

export class Bot {
  private static instance: Bot | null = null;
  private client: Client;
  private cfg: Config;
  private handler: EventHandler;

  private constructor(cfg: Config, handler: EventHandler) {
    this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
    this.cfg = cfg;
    this.handler = handler;
  }

  public static getClientInstance(): Client | null {
    return Bot.instance ? Bot.instance.client : null;
  }

  public getClient(): Client {
    return this.client;
  }

  public static getInstance(cfg: Config, handler: EventHandler): Bot {
    if (!Bot.instance) {
      Bot.instance = new Bot(cfg, handler);
    }
    return Bot.instance;
  }

  public async startBot() {
    this.client.on(Events.InteractionCreate, async (interaction) => {
      try {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
          const ev = this.handler.handler.get(interaction.commandName);
          if (!ev) return;
          await ev.handleCommand(interaction as any);
          return;
        }

        if (interaction.isModalSubmit()) {
          const ev = this.handler.modalHandler.get(interaction.customId);
          if (!ev) return;
          await ev.handleModalSubmit(interaction as ModalSubmitInteraction);
          return;
        }

        if (interaction.isAutocomplete()) {
          const ev = this.handler.autoCompleteHandler.get(
            interaction.commandName
          );
          if (!ev) return;
          await ev.handleAutocomplete(interaction);
          return;
        }
      } catch (err: any) {
        if (err instanceof DiscordBotError) {
          console.warn(
            `Handled DiscordBotError: ${err.title} - ${err.message}`
          );
        } else {
          console.error("Error handling interaction:", err);
        }
        try {
          if (interaction.isRepliable()) {
            if (interaction.replied || interaction.deferred) {
              await interaction.followUp({
                content: "There was an error while executing this command.",
              });
            } else {
              await interaction.reply({
                content: "There was an error while executing this command.",
              });
            }
          }
        } catch (e) {
          console.error("Failed to notify user of error:", e);
        }
      }
    });

    this.client.once(Events.ClientReady, () => {
      console.log(`Logged in as ${this.client.user?.tag}!`);
    });

    await this.client.login(this.cfg.TOKEN);
  }

  async registerCommands() {
    const definitions: any[] = [];

    this.handler.handler.forEach((value, key) => {
      definitions.push(value.getSlashCommand().toJSON());
      console.log(`Registered command: /${key}`);
    });

    const rest = new REST({ version: "10" }).setToken(this.cfg.TOKEN);
    await rest.put(Routes.applicationCommands(this.cfg.APP_ID), {
      body: definitions,
    });

    console.log("Registered all command");
  }
}
