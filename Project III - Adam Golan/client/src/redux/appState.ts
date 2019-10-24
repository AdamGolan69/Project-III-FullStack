import { User } from "../models/user";
import { Vacation } from "../models/vacation";
import { Follow } from "../models/follow";
export class AppState {
    public vacations: Vacation[] = [];
    public followed: Follow[] = [];
    public follows: Follow[] = [];
    public users: User[] = [];
    public user: User = new User();
}