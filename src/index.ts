import { Config } from "@/configs/config";
import { Bot } from "@/configs/bot";
import { EventHandler } from "./configs/handler";
import { Client, GatewayIntentBits } from "discord.js";

const config: Config = Config.getInstance();
const client: Client = new Client({ intents: [GatewayIntentBits.Guilds] });
const handler: EventHandler = EventHandler.getInstance(client);
const bot: Bot = Bot.getInstance(client, config, handler);
bot.startBot();
