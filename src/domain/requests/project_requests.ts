import dayjs from "dayjs";

export interface CreateProjectRequest{
    guildId : string;
    projectName : string;
    projectDescription? : string;
    projectRoleName : string;
    deadline : string;
}
