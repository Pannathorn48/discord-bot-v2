import { ModalBuilder, ModalSubmitInteraction } from "discord.js";

export interface IModal {
    getModalID() : string;
    getModal() : ModalBuilder
    handleModalSubmit(interaction: ModalSubmitInteraction) : Promise<void>;
}