export class Vacation {
    constructor(
        public id: number = 0,
        public destination: string = "",
        public description: string = "",
        public sDate: Date = new Date(),
        public eDate: Date = new Date(),
        public price: string = "") { }
}