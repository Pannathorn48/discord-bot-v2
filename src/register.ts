import { Config } from "@/configs/config";
import { Bot } from "@/configs/bot";
import { EventHandler } from "./configs/handler";

const config: Config = Config.getInstance();
const handler = EventHandler.getInstance();
const bot: Bot = Bot.getInstance(config, handler);
await bot.registerCommands();
