import { PrismaClient } from "@/generated/prisma/client";
import { CreateProjectRequest } from "../requests/project_requests";

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

    async createProject(req : Project){
        const project = await this.prisma.project.create({
            data: {
                name: req.name,
                guild_id: req.guild_id,
                role_name: req.role_name,
                description: req.description,
                deadline: req.deadline
            }
        });

        return project;
    }

}