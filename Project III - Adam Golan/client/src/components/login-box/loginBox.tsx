import React, { Component } from 'react';
import "./loginBox.css";
import { NavLink } from 'react-router-dom';
import { User } from "../../models/user";
import { store } from "../../redux/store";
import { ActionType } from "../../redux/actionType";
import { Unsubscribe } from "redux";
interface LoginBoxState {
    users: User[];
    user: User;
}
export class LoginBox extends Component<any, LoginBoxState> {
    unsubscribeStore: Unsubscribe;
    public constructor(props: any) {
        super(props);
        this.state = {
            users: store.getState().users,
            user: new User()
        }
        this.unsubscribeStore = store.subscribe(() => this.setState({ users: store.getState().users }));
    }
    componentWillUnmount() {
        this.unsubscribeStore();
    }
    componentDidMount() {
        if (store.getState().users.length === 0) {
            fetch("http://localhost:3001/api/users/names")
                .then(response => response.json())
                .then(users => {
                    const action = { type: ActionType.getAllUsersNames, payload: users };
                    store.dispatch(action);
                })
                .catch(err => alert(err));
        }
    }
    // Setting Parameters
    private setUserName = (e: any): void => {
        const name = e.target.value;
        const user = { ...this.state.user };
        user.user = name;
        this.setState({ user });
    }
    private setPassword = (e: any): void => {
        const pass = e.target.value;
        const user = { ...this.state.user };
        user.pass = pass;
        this.setState({ user });

    }
    // Submitting Form
    private submitForm = (): void => {
        // Validating User Compliance
        if (this.state.user.user === "") {
            alert("Missing User Name");
        }
        else if (this.state.user.pass === "") {
            alert("Missing Password");
        }
        else {
            // Validating User Existence
            const valUser = this.state.users.find((u: User) => u.user === this.state.user.user);
            if (valUser !== undefined) {
                // Validating Password
                fetch(`http://localhost:3001/api/users/${valUser.user}`)
                    .then(response => response.json())
                    .then(user => {
                        if (user[0].pass === this.state.user.pass) {
                            // Channeling to User/Admin Page
                            if (user[0].type === "user") {
                                user[0].connected = "true";
                                this.setState({ user: user[0] });
                                fetch(`http://localhost:3001/api/users`, {
                                    method: "PATCH",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Accept": "application/json"
                                    },
                                    body: JSON.stringify(this.state.user)
                                })
                                    .then(response => {
                                        if (response) {
                                            let action = { type: ActionType.getOneUser, payload: user[0] };
                                            store.dispatch(action);
                                            action = { type: ActionType.getAllUsersNames, payload: [] };
                                            store.dispatch(action);
                                            this.props.history.push(`/${this.state.user.user}`);
                                        }
                                    })
                                    .catch(err => alert(err));
                            }
                            else {
                                fetch(`http://localhost:3001/api/users`, {
                                    method: "PATCH",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Accept": "application/json"
                                    },
                                    body: JSON.stringify({
                                        user: "ADMIN",
                                        connected: "true"
                                    })
                                })
                                    .then(response => {
                                        if (response) {
                                            let action = { type: ActionType.getOneUser, payload: user[0] };
                                            store.dispatch(action);
                                            action = { type: ActionType.getAllUsersNames, payload: [] };
                                            store.dispatch(action);
                                            this.props.history.push(`/admin`);
                                        }
                                    })
                                    .catch(err => alert(err));
                            }
                        }
                        else {
                            alert("Wrong Password");
                            const action = { type: ActionType.getOneUser, payload: new User() };
                            store.dispatch(action);
                        }
                    })
                    .catch(err => alert(err));
                }
            else {
                alert("User Name Does Not Exists");
            }
        }
    }
    public render(): JSX.Element {
        return (
            <div className="login-box">
                <h3>welcome to veyKay</h3>
                <form>
                    <table>
                        <tbody>
                            <tr>
                                <td>user name:</td>
                                <td><input type="text" onChange={this.setUserName} value={this.state.user.user} autoFocus /></td>
                            </tr>
                            <tr>
                                <td>password:</td>
                                <td><input type="password" onChange={this.setPassword} value={this.state.user.pass} /></td>
                            </tr>
                        </tbody>
                    </table>
                    <button type="button" onClick={this.submitForm}>login</button>
                </form>
                <NavLink to="/register" exact>not registered yet?</NavLink>
            </div>
        )
    }
}
