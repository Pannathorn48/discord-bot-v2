import { ModalBuilder, ModalSubmitInteraction } from "discord.js";

export interface IModal {
    getModalID() : string;
    getModal(...args : any[]) : Promise<ModalBuilder>;
    handleModalSubmit(interaction: ModalSubmitInteraction) : Promise<void>;
}