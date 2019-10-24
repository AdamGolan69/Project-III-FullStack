import React, { Component } from 'react';
import "./userPage.css";
import { User } from "../../models/user";
import { Vacation } from "../../models/vacation";
import { store } from "../../redux/store";
import { ActionType } from "../../redux/actionType";
import { Unsubscribe } from "redux";
import io from 'socket.io-client';
import { NavLink } from 'react-router-dom';
import 'react-day-picker/lib/style.css';
import { Follow } from '../../models/follow';
import { Followed } from '../followed/followed';
import { NotFollowed } from '../notFollowed/notFollowed';
let socket: any;
interface UserPageState {
    user: User;
    vacations: Vacation[]
    follow: Follow
    followed: Follow[]
}
export class UserPage extends Component<any, UserPageState> {
    unsubscribeStore: Unsubscribe;
    public constructor(props: any) {
        super(props);
        this.state = {
            user: store.getState().user,
            vacations: store.getState().vacations,
            follow: new Follow(),
            followed: store.getState().followed
        }
        this.unsubscribeStore = store.subscribe(() => this.setState({ user: store.getState().user, vacations: store.getState().vacations, followed: store.getState().followed }))
    }
    componentWillUnmount() {
        this.setState({ user: new User() });
        this.unsubscribeStore();
    }
    // Mounting Component
    componentDidMount() {
        socket = io(`http://localhost:3002`);
        if (store.getState().user.id === 0) {
            const userName = this.props.match.params.userName;
            fetch(`http://localhost:3001/api/users/${userName}`)
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
                        div[0].animate([{ backgroundColor: "transparent" }, { backgroundColor: "rgba(255, 255, 255, .2)" }], { duration: 400, fill: "forwards", easing: "ease-in-out" });
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
            div[0].animate([{ backgroundColor: "transparent" }, { backgroundColor: "rgba(255, 255, 255, .2)" }], { duration: 400, fill: "forwards", easing: "ease-in-out" });
        }
        socket.on("all-vacations", (vacations: Vacation[]) => {
            const action = { type: ActionType.getAllVacations, payload: vacations };
            store.dispatch(action);
        });
        if (this.state.followed.length === 0) {
            socket.emit("give-my-follows");
        }
        socket.on("user-follows", (follows: Follow[]) => {
            const action = { type: ActionType.getFollowed, payload: follows };
            store.dispatch(action);
        });
    }
    // Checking Component's Updates
    shouldComponentUpdate(nextProps: any, nextState: any): boolean {
        return (nextState.vacations !== this.state.vacations || nextState.followed !== this.state.followed);
    }
    // Updating Component
    componentDidUpdate() {
        socket.on("update-user", (vacations: Vacation[]) => {
            const action = { type: ActionType.getAllVacations, payload: vacations };
            store.dispatch(action);
        });
        socket.on("all-follows", (followed: Follow[]) => {
            const action = { type: ActionType.getFollowed, payload: followed };
            store.dispatch(action);
        });
    }
    // Search Bar
    private clearSearch = (e: any): void => {
        e.target.parentElement.children[0].value = "";
        this.searchBar("");
    }
    private async searchBar(e: any) {
        const cards = Object.values(document.getElementsByClassName("card"));
        if (e.target) {
            if (e.target.value.length > 0) {
                const value = e.target.value.toLowerCase();
                const hide = cards.filter((c: any) => c.children[1].innerHTML.indexOf(value) < 0);
                const show = cards.filter((c: any) => c.children[1].innerHTML.indexOf(value) >= 0);
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
    // Toggle Search - Small Screens
    private toggleSearch = (e: any): void => {
        const header = e.target.parentElement.parentElement;
        header.classList.toggle("searchMode");
        for (const item of header.children) {
            item.classList.toggle("searchMode");
        }
    }
    // Log Out
    private logOut(): void {
        const div = document.getElementsByClassName("layout");
        div[0].animate([{ backgroundColor: "rgba(255, 255, 255, .2)" }, { backgroundColor: "transparent" }], { duration: 400, fill: "forwards", easing: "ease-in-out" });
        store.dispatch({ type: ActionType.getFollowed, payload: [] });
        store.dispatch({ type: ActionType.getOneUser, payload: new User() });
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
            tmpElement.parentNode.children[0].classList.toggle("blurred");
            tmpElement.parentNode.children[4].classList.toggle("show");
            tmpElement.parentNode.children[5].classList.toggle("show");
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
            tmpElement.parentNode.children[0].classList.toggle("blurred");
            tmpElement.parentNode.children[4].classList.toggle("show");
            tmpElement.parentNode.children[5].classList.toggle("show");
        }
        else {
            if (tmpElement.children[4].firstChild.getAttribute("data-value") === "dates") {
                tmpElement.children[4].firstChild.setAttribute("data-value", "back");
                tmpElement.children[4].firstChild.setAttribute("class", "fa fa-step-backward");
            }
            else {
                tmpElement.children[4].firstChild.setAttribute("data-value", "dates");
                tmpElement.children[4].firstChild.setAttribute("class", "fa fa-calendar-alt");
            }
            tmpElement.classList.toggle("blurred");
            tmpElement.children[0].classList.toggle("blurred");
            tmpElement.children[4].classList.toggle("show");
            tmpElement.children[5].classList.toggle("show");
        }
    }
    // Toggle Follow
    private toggleFollow(e: any): void {
        const uID = store.getState().user.id;
        const vID = +e.target.id;
        const follow = { uID, vID };
        if (e.target.checked) {
            e.target.parentElement.children[1].style.color = "#ff6b6b";
            e.target.parentElement.parentElement.style.transform = "scale(.5)";
            e.target.parentElement.parentElement.style.width = "0";
            e.target.parentElement.parentElement.style.opacity = "0";
            setTimeout(() => {
                socket.emit("add-follow", follow);
            }, 501);
        }
        else {
            e.target.parentElement.children[1].style.color = "white";
            e.target.parentElement.parentElement.style.transform = "scale(.5)";
            e.target.parentElement.parentElement.style.width = "0";
            e.target.parentElement.parentElement.style.opacity = "0";
            setTimeout(() => {
                socket.emit("delete-follow", follow);
            }, 501);
        }
    }
    // City Name Manipulation
    private cityName(dest: string): any {
        const index = dest.indexOf(",");
        let city = dest.slice(0, index);
        city = city.replace(/\s/g, "");
        city = city.slice(0, city.length);
        return city.toLowerCase();
    }
    public render(): JSX.Element {
        return (
            <div className="userPage">
                <header>
                    <p>welcome {this.state.user.user}<i className="fa fa-search-location" onClick={this.toggleSearch}></i></p>
                    <NavLink to="/" onClick={this.logOut}>logout</NavLink>
                    <div className="panel">
                        <input type="text" onChange={this.searchBar} autoFocus placeholder="Search Location" />
                        <button type="button" onClick={this.clearSearch}>clear</button>
                        <i className="fas fa-level-up-alt" onClick={this.toggleSearch}></i>
                    </div>
                </header>
                <div className="container">
                    <Followed vacations={(this.state.followed.length > 0) ? (this.state.vacations.filter((v: Vacation): any => { for (let item of this.state.followed) { if (item.vID === v.id) { return v } } }
                    )) : []} cityName={this.cityName} showDates={this.showDates} toggleFollow={this.toggleFollow} />
                    <NotFollowed vacations={(this.state.followed.length > 0) ? this.state.vacations.filter((v: Vacation) => {
                        let bool = true;
                        for (let item of this.state.followed) {
                            if (v.id !== item.vID) {
                                bool = true;
                            }
                            else {
                                bool = false;
                                break;
                            }
                        }
                        if (bool) {
                            return v;
                        }
                    }) : this.state.vacations} cityName={this.cityName} showDates={this.showDates} toggleFollow={this.toggleFollow} />
                </div>
            </div>
        )
    }
}