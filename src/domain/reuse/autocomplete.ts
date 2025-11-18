import { AutocompleteInteraction } from "discord.js";
import { ProjectService } from "@/domain/services/project_service";

export async function projectAutocompleteOptions(
  projectService: ProjectService,
  interaction: AutocompleteInteraction
) {
  const focused = interaction.options.getFocused();
  const guildId = interaction.guildId;

  if (!guildId) {
    await interaction.respond([]);
    return;
  }

  const query = focused ? String(focused) : "";

  const projects = await projectService.getProjectsInGuildAndName(
    guildId,
    query
  );

  const choices = projects.map((project) => {
    return {
      name: project.name,
      value: project.id as string,
      description: project.description || "No description",
    };
  });

  await interaction.respond(choices.slice(0, 25));
}
