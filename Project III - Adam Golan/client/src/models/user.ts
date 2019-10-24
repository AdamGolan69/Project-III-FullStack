export class User {
    constructor(
        public id: number = 0,
        public type: string = "",
        public firstName: string = "",
        public lastName: string = "",
        public user: string = "",
        public pass: string = "",
        public connected: string | boolean  = "",
        public socket: string = "") { }
}