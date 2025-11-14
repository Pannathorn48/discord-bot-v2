import { ProjectDatabase } from "@/domain/databases/project_database";

export class CreateTaskService {
    private projectDatabase : ProjectDatabase;  
    constructor(projectDatabase : ProjectDatabase){
        this.projectDatabase = projectDatabase;
    }

    async getProjectsInGuild(guildId : string){
        return await this.projectDatabase.getProjectFromGuildId(guildId);
    }
}