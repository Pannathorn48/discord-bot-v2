import { PrismaClient } from "@/generated/prisma/client";
import { CreateProjectDatabaseRequest, CreateProjectRequest } from "../requests/project_requests";

export interface Project {
    id?: string;
    name: string;
    guild_id: string;
    role_name: string;
    description : string | null;
    deadline: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export class ProjectDatabase {
    private prisma: PrismaClient; 
    constructor(client : PrismaClient) {
        this.prisma = client;
    }


    async getProjectFromGuildId(guildId : string) : Promise<Project[]>{
        const project : Project[] = await  this.prisma.project.findMany({
            where: {
                guild_id: guildId
            }
        });

        return project;
    }

    async createProject(req : CreateProjectDatabaseRequest){
        const project = await this.prisma.project.create({
            data: {
                name: req.name,
                guild_id: req.guildId,
                role_name: req.roleName,
                description: req.description || null,
                deadline: req.deadline
            }
        });

        return project;
    }

}