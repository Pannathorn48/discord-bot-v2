import { KnownNetworkErrorCodes } from "discord.js";
import dotenv from "dotenv";

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export class Config {
  private static instance: Config | null = null;

  public PG_HOST: string;
  public PG_DATABASE: string;
  public PG_USER: string;
  public PG_PASSWORD: string;
  public PG_PORT: number;
  public TOKEN: string;
  public APP_ID: string;

  private constructor() {
    dotenv.config();

    const host: string | undefined = process.env.PG_HOST;
    if (!host) {
      throw new ConfigError("PG_HOST is not defined");
    }
    const database: string | undefined = process.env.PG_DATABASE;
    if (!database) {
      throw new ConfigError("PG_DATABASE is not defined");
    }
    const user: string | undefined = process.env.PG_USER;
    if (!user) {
      throw new ConfigError("PG_USER is not defined");
    }
    const password: string | undefined = process.env.PG_PASSWORD;
    if (!password) {
      throw new ConfigError("PG_PASSWORD is not defined");
    }
    const port: number | undefined = process.env.PG_PORT
      ? parseInt(process.env.PG_PORT)
      : undefined;
    if (!port) {
      throw new ConfigError("PG_PORT is not defined or invalid");
    }

    const token: string | undefined = process.env.TOKEN;
    if (!token) {
      throw new ConfigError("TOKEN is not defined");
    }

    const appId: string | undefined = process.env.APP_ID;
    if (!appId) {
      throw new ConfigError("APP_ID is not defined");
    }

    this.PG_HOST = host;
    this.PG_DATABASE = database;
    this.PG_USER = user;
    this.PG_PASSWORD = password;
    this.PG_PORT = port;
    this.TOKEN = token;
    this.APP_ID = appId;
  }
  public static getInstance(): Config {
    if (Config.instance === null) {
      Config.instance = new Config();
    }
    return Config.instance;
  }
}
