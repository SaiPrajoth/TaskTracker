import { Task } from "@/models/user.model";

export default interface ApiResponse{
    success:boolean,
    message:string,
    premiumTaken?:boolean,
    tasks?:Task[]
}