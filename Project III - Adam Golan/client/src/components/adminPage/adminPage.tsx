import React, { Component } from 'react';
import "./adminPage.css";
import { User } from "../../models/user";
import { Vacation } from "../../models/vacation";
import { store } from "../../redux/store";
import { ActionType } from "../../redux/actionType";
import { Unsubscribe } from "redux";
import io from "socket.io-client";
import { NavLink } from 'react-router-dom';
import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import { AddVacation } from '../addVacation/addVacation';
import { Chart } from '../chart/chart';
import { Follow } from '../../models/follow';
let socket: any;
interface AdminPageState {
    vacation: Vacation;
    vacations: Vacation[];
    user: User;
    editable: boolean;
    modifiable: boolean;
    modifiers: {
        from: any;
        to: any;
    };
    disabledDates: any[];
    follows: Follow[];
}
export class AdminPage extends Component<any, AdminPageState> {
    unsubscribeStore: Unsubscribe;
    public constructor(props: any) {
        super(props);
        this.state = {
            vacation: new Vacation(),
            vacations: store.getState().vacations,
            user: store.getState().user,
            editable: false,
            modifiable: true,
            modifiers: {
                from: undefined,
                to: undefined
            },
            disabledDates: store.getState().vacations.map((v: Vacation) => { return { id: v.id, disabled: undefined } }),
            follows: store.getState().follows
        }
        this.unsubscribeStore = store.subscribe(() => this.setState({ user: store.getState().user, vacations: store.getState().vacations, disabledDates: store.getState().vacations.map((v: Vacation) => { return { id: v.id, disabled: undefined } }), follows: store.getState().follows }));
    }
    componentWillUnmount() {
        this.setState({ user: new User() });
        this.unsubscribeStore();
    }
    componentDidMount(): void {
        socket = io(`http://localhost:3002`);
        if (store.getState().user.id === 0) {
            fetch(`http://localhost:3001/api/users/ADMIN`)
                .then(response => response.json())
                .then(user => {
                    const action = { type: ActionType.getOneUser, payload: user[0] };
                    store.dispatch(action);
                    if (this.state.user === undefined) {
                        alert("User Does Not Exists");
                        this.props.history.push(`/register`);
                    }
                    else if (this.state.user.connected === "false") {
                        this.props.history.push(`/login`);
                    }
                    else {
                        socket.emit("connected", store.getState().user);
                        const div = document.getElementsByClassName("layout");
                        div[0].animate([{ backgroundColor: "transparent" }, { backgroundColor: "rgba(0, 0, 0, .4)" }], { duration: 400, fill: "forwards", easing: "ease-in-out" });
                        // Bad Practice User Side
                        setTimeout(() => {
                            const user = { ...this.state.user };
                            user.connected = "true";
                            this.setState({ user });
                            fetch(`http://localhost:3001/api/users`, {
                                method: "PATCH",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Accept": "application/json"
                                },
                                body: JSON.stringify(this.state.user)
                            })
                                .catch(() => alert("Failed Reconnecting to Server"));
                        }, 1200);
                    }
                })
                .catch(err => {
                    alert(err);
                    this.props.history.push(`/login`);
                });
        }
        else {
            socket.emit("connected", store.getState().user);
            const div = document.getElementsByClassName("layout");
            div[0].animate([{ backgroundColor: "transparent" }, { backgroundColor: "rgba(0, 0, 0, .4)" }], { duration: 400, fill: "forwards", easing: "ease-in-out" });
        }
        socket.on("all-vacations", (vacations: Vacation[]) => {
            const action = { type: ActionType.getAllVacations, payload: vacations };
            store.dispatch(action);
        });
        if (this.state.follows.length === 0) {
            socket.emit("give-all-follows");
        }
        socket.on("admin-follows", (follows: Follow[]) => {
            const action = { type: ActionType.getAllFollows, payload: follows };
            store.dispatch(action);
        });
    }
    // Checking Component's Updates
    shouldComponentUpdate(nextProps: any, nextState: any): boolean {
        return (nextState !== this.state);
    }
    // Updating Component
    componentDidUpdate() {
        socket.on("update-user", (vacations: Vacation[]) => {
            const action = { type: ActionType.getAllVacations, payload: vacations };
            store.dispatch(action);
        });
        socket.on("admin-follows", (follows: Follow[]) => {
            const action = { type: ActionType.getAllFollows, payload: follows };
            store.dispatch(action);
        });
    }
    // Search Bar
    private clearSearch = (e: any): void => {
        e.target.parentElement.children[0].value = "";
        this.searchBar("");
    }
    private searchBar(e: any) {
        const cards = Object.values(document.getElementsByClassName("card"));
        if (e.target) {
            if (e.target.value.length > 0) {
                const value = e.target.value.toLowerCase();
                const hide = cards.filter((c: any) => c.children[3].innerHTML.indexOf(value) < 0);
                const show = cards.filter((c: any) => c.children[3].innerHTML.indexOf(value) >= 0);
                for (let item of hide) {
                    item.classList.add("hide");
                    item.classList.add("removed");
                }
                for (let item of show) {
                    item.classList.remove("removed");
                    item.classList.remove("hide");
                }
            }
            else {
                for (let item of cards) {
                    item.classList.remove("removed");
                    item.classList.remove("hide");
                }
            }
        }
        else {
            for (let item of cards) {
                item.classList.remove("removed");
                item.classList.remove("hide");
            }
        }
    }
    // Editing Content Without Dates
    private editable = (e: any): void => {
        const id = +e.target.id;
        const div: any = e.target.parentElement.parentElement;
        div.toggleAttribute("contentEditable");
        div.children[0].setAttribute("contentEditable", "false");
        div.children[1].setAttribute("contentEditable", "false");
        div.children[2].setAttribute("contentEditable", "false");
        div.children[4].setAttribute("contentEditable", "false");
        div.children[5].children[0].children[0].setAttribute("contentEditable", "false");
        div.children[6].setAttribute("contentEditable", "false");
        div.children[7].setAttribute("contentEditable", "false");
        div.children[8].setAttribute("contentEditable", "false");
        if (div.getAttribute("contentEditable") === null) {
            div.children[1].style.display = "none";
            const vacation: any = this.state.vacations.find((v: Vacation) => v.id === id);
            vacation.destination = this.escapeSqlChars(div.children[3].innerHTML);
            const index = div.children[5].children[0].children[1].innerHTML.indexOf("$");
            vacation.price = div.children[5].children[0].children[1].innerHTML.slice(0, index);
            vacation.description = this.escapeSqlChars(div.children[5].children[1].innerHTML);
            socket.emit("update-all", vacation);
        }
        else {
            div.children[1].style.display = "inline-block";
        }
    }
    // Snitizng SQL
    private escapeSqlChars(text:string):any{
        text = text.replace(`'`, `\'`);
        text = text.replace(`"`, `\"`);
        text = text.replace(`/`, `\\`);
        return text;
    }
    // Day Picker Functions
    // // Activating Calendar Edit
    private activateCalendar(e: any): void {
        const id = +e.target.parentElement.children[2].children[0].id;
        let disabledDatesObj = this.state.disabledDates.find((d: any) => d.id === id);
        let disabledDates = this.state.disabledDates;
        if (e.target.innerHTML === "change dates") {
            this.setState({ modifiable: false });
            e.target.innerHTML = "save changes";
            if (disabledDatesObj !== undefined) {
                const vacation = this.state.vacations.find((v: Vacation) => v.id === id);
                if (vacation !== undefined) {
                    const vacations = this.state.vacations;
                    const index = vacations.indexOf(vacation);
                    vacation.sDate = this.state.modifiers.from;
                    vacation.eDate = this.state.modifiers.to;
                    vacations[index] = vacation;
                    this.setState({ vacations });
                }
                if (disabledDatesObj.disabled === undefined) {
                    const index = disabledDates.indexOf(disabledDatesObj);
                    disabledDatesObj = { id, disabled: new Date() };
                    disabledDates[index] = disabledDatesObj;
                    this.setState({ disabledDates });
                }
            }
        }
        else {
            e.target.innerHTML = "change dates";
            if (disabledDatesObj !== undefined) {
                if (disabledDatesObj.disabled !== undefined) {
                    const vacation = this.state.vacations.find((v: Vacation) => v.id === id);
                    const index = disabledDates.indexOf(disabledDatesObj);
                    disabledDatesObj = { id, disabled: undefined };
                    disabledDates[index] = disabledDatesObj;
                    this.setState({ disabledDates });
                    this.setState({ modifiers: { from: undefined, to: undefined } });
                    socket.emit("update-all", vacation);
                }
            }
        }
    }
    // // Handling Calendar Picking
    private handleDayClick = (day: any, modifiers: any, e: any): void => {
        const button = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[6];
        const id = +e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[2].children[0].id;
        const vacation = this.state.vacations.find((v: Vacation) => v.id === id);
        if (button.innerHTML === "save changes") {
            if (vacation !== undefined) {
                const vacations = this.state.vacations;
                const index = vacations.indexOf(vacation);
                if (this.state.modifiers.from === undefined) {
                    const modifiers = { ...this.state.modifiers };
                    modifiers.from = vacation.sDate;
                    this.setState({ modifiers });
                    const range = DateUtils.addDayToRange(day, this.state.modifiers);
                    this.setState({ modifiers: range });
                    vacation.sDate = range.from;
                    vacation.eDate = range.to;
                    vacations[index] = vacation;
                    this.setState({ vacations });
                }
                if (this.state.modifiers.from !== undefined && this.state.modifiers.to === undefined) {
                    const modifiers = { ...this.state.modifiers };
                    modifiers.to = vacation.eDate;
                    this.setState({ modifiers });
                    const range = DateUtils.addDayToRange(day, this.state.modifiers);
                    this.setState({ modifiers: range });
                    vacation.sDate = range.from;
                    vacation.eDate = range.to;
                    vacations[index] = vacation;
                    this.setState({ vacations });
                    this.setState({ modifiers: { from: undefined, to: undefined } });
                    this.setState({ modifiable: true });
                }
            }
        }
    }
    // // Manipulating The Disabled... Dates
    private disabledDates(id: any): any {
        let disabledDatesObj = this.state.disabledDates.find((d: any) => d.id === +id);
        if (disabledDatesObj !== undefined) {
            if (Object.values(disabledDatesObj)[1] === undefined) {
                return { daysOfWeek: [0, 1, 2, 3, 4, 5, 6] };
            }
            else {
                return { daysOfWeek: [], before: Object.values(disabledDatesObj)[1] };
            }
        }
    }
    // Logout
    private logOut(): void {
        const div = document.getElementsByClassName("layout");
        div[0].animate([{ backgroundColor: "rgba(0, 0, 0, .4)" }, { backgroundColor: "transparent" }], { duration: 400, fill: "forwards", easing: "ease-in-out" });
        store.dispatch({ type: ActionType.getOneUser, payload: new User() });
        store.dispatch({ type: ActionType.getAllFollows, payload: [] });
        store.dispatch({ type: ActionType.getAllVacations, payload: [] });
        socket.emit("disconnected");
    }
    // Show Dates Button
    private showDates(e: any): void {
        const tmpElement = e.target.parentNode;
        if (tmpElement.className === "show-dates") {
            if (tmpElement.firstChild.getAttribute("data-value") === "dates") {
                tmpElement.firstChild.setAttribute("data-value", "back");
                tmpElement.firstChild.setAttribute("class", "fa fa-step-backward");
            }
            else {
                tmpElement.firstChild.setAttribute("data-value", "dates");
                tmpElement.firstChild.setAttribute("class", "fa fa-calendar-alt");
            }
            tmpElement.parentNode.classList.toggle("blurred");
            tmpElement.parentNode.children[6].classList.toggle("show");
            tmpElement.parentNode.children[7].classList.toggle("show");
            tmpElement.parentNode.children[8].classList.toggle("show");
        }
        else if (tmpElement.className === "show-dates show") {
            if (tmpElement.firstChild.getAttribute("data-value") === "dates") {
                tmpElement.firstChild.setAttribute("data-value", "back");
                tmpElement.firstChild.setAttribute("class", "fa fa-step-backward");
            }
            else {
                tmpElement.firstChild.setAttribute("data-value", "dates");
                tmpElement.firstChild.setAttribute("class", "fa fa-calendar-alt");
            }
            tmpElement.parentNode.classList.toggle("blurred");
            tmpElement.parentNode.children[6].classList.toggle("show");
            tmpElement.parentNode.children[7].classList.toggle("show");
            tmpElement.parentNode.children[8].classList.toggle("show");
        }
        else {
            if (tmpElement.children[7].firstChild.getAttribute("data-value") === "dates") {
                tmpElement.children[7].firstChild.setAttribute("data-value", "back");
                tmpElement.children[7].firstChild.setAttribute("class", "fa fa-step-backward");
            }
            else {
                tmpElement.children[7].firstChild.setAttribute("data-value", "dates");
                tmpElement.children[7].firstChild.setAttribute("class", "fa fa-calendar-alt");
            }
            tmpElement.classList.toggle("blurred");
            tmpElement.children[6].classList.toggle("show");
            tmpElement.children[7].classList.toggle("show");
            tmpElement.children[8].classList.toggle("show");
        }
    }
    // Remove Vacation
    private removeVacation(e: any): void {
        if (window.confirm("Are you sure you want to delete?")) {
            const id = +e.target.parentElement.children[2].children[0].id;
            const destination = e.target.parentElement.children[3].innerHTML;
            socket.emit("delete-vacation", id);
            setTimeout(() => {
                const sameDestination = this.state.vacations.filter((v: Vacation) => v.destination === destination);
                if (sameDestination.length === 0) {
                    fetch("http://localhost:3001/upload-image", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ destination: this.cityName(destination) })
                    })
                        .catch(err => console.log(err));
                }
            }, 1000);
        }
    }
    // Toggle Elements
    private toggleElement(e: any): void {
        if (e.target.innerHTML === "add vacation") {
            const div = document.getElementsByClassName("addVacation")[0];
            div.classList.add("show");
            div.children[0].classList.add("show");
        }
        if (e.target.classList.value === "fa fa-times vacation") {
            const div = document.getElementsByClassName("addVacation")[0];
            div.classList.remove("show");
            div.children[0].classList.remove("show");
        }
        if (e.target.innerHTML === "show follows") {
            const div = document.getElementsByClassName("chart")[0];
            div.classList.add("show");
        }
        if (e.target.classList.value === "fa fa-times endChart") {
            const div = document.getElementsByClassName("chart")[0];
            div.classList.remove("show");
        }
        if (e.target.classList.value === "addVacation show") {
            e.target.children[0].classList.toggle("show");
            e.target.classList.toggle("show");
        }
        if (e.target.classList.value === "chart show") {
            e.target.classList.toggle("show");
        }
    }
    // Toggle Search - Small Screens
    private toggleSearch = (e: any): void => {
        const header = e.target.parentElement.parentElement;
        header.classList.toggle("searchMode");
        for (const item of header.children) {
            item.classList.toggle("searchMode");
        }
    }
    // City Name Manipulation
    private cityName = (dest: string): string => {
        const index = dest.indexOf(",");
        let city = dest.slice(0, index);
        city = city.replace(/\s/g, "");
        city = city.slice(0, city.length);
        return city.toLowerCase();
    }
    public render(): JSX.Element {
        return (
            <div className="adminPage">
                <AddVacation toggleElements={this.toggleElement} socket={socket} vacationsNames={this.state.vacations.map((f: any) => this.cityName(f.destination))} cityName={this.cityName} escapeSqlChars={this.escapeSqlChars}/>
                <Chart follows={this.state.follows} vacations={this.state.vacations} toggleElements={this.toggleElement} />
                <header>
                    <p>welcome {this.state.user.user}<i className="fa fa-search-location" onClick={this.toggleSearch}></i></p>
                    <NavLink to="/" onClick={this.logOut}>logout</NavLink>
                    <div className="search">
                        <input type="text" autoFocus onChange={this.searchBar} placeholder="search location" />
                        <button type="button" onClick={this.clearSearch}>clear</button>
                        <button onClick={this.toggleElement}>add vacation</button>
                        <button onClick={this.toggleElement}>show follows</button>
                        <i className="fas fa-level-up-alt" onClick={this.toggleSearch}></i>
                    </div>
                </header>
                <div className="container">
                    {this.state.vacations.map((v: Vacation) => {
                        const { from, to } = { from: v.sDate === undefined ? new Date() : new Date(v.sDate), to: v.sDate === undefined ? new Date() : new Date(v.eDate) };
                        const modifiers = { start: from, end: to };
                        const disabledDates = this.disabledDates(v.id);
                        return <div className='card' key={v.id}>
                            <i className="fa fa-times" onClick={this.removeVacation.bind(this)}></i>
                            <p>edit content mode</p>
                            <label className="edit">
                                <input type="checkbox" onClick={this.editable} id={JSON.stringify(v.id)} />
                                <i title="Toggle Edit" className="fa fa-edit"></i>
                            </label>
                            <h3>{v.destination}</h3>
                            <div className="image">
                                <img src={`http://localhost:3001/assets/vacationsImg/${this.cityName(v.destination)}.jpg`} alt={v.destination} />
                            </div>
                            <div className="card-content">
                                <p><span>Price:</span><span>{v.price}$</span></p>
                                <p>{v.description}</p>
                            </div>
                            <button id="activate" disabled={!this.state.modifiable} onClick={this.activateCalendar.bind(this)}>change dates</button>
                            <label className="show-dates" onClick={this.showDates}><i className="fa fa-calendar-alt" data-value="dates"></i></label>
                            <DayPicker className="Selectable" onDayClick={this.handleDayClick} showOutsideDays month={from} modifiers={modifiers} selectedDays={[from, { from, to }]} disabledDays={disabledDates} />
                        </div>
                    })}
                </div>
            </div>
        )
    }
}