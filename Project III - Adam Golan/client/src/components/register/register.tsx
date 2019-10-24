import React, { Component } from 'react';
import "./register.css";
import { User } from "../../models/user";
import { store } from "../../redux/store";
import { ActionType } from "../../redux/actionType";
import { Unsubscribe } from "redux";
import { NavLink } from 'react-router-dom';
interface RegisterState {
    users: User[];
    user: User;
    errors: {
        valPass: string,
        fName: string,
        lName: string,
        uName: string,
        pass: string
    };
    tmpPass: string;
    passStyle: {
        color: string,
        fontSize: string
    };
}
export class Register extends Component<any, RegisterState> {
    unsubscribeStore: Unsubscribe;
    public constructor(props: any) {
        super(props);
        this.state = {
            users: store.getState().users,
            user: new User(),
            errors: {
                valPass: "",
                fName: "*",
                lName: "*",
                uName: "*",
                pass: "*"
            },
            tmpPass: "",
            passStyle: {
                color: "#e17055",
                fontSize: "1.2em"
            }
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
    // Validate Form
    private setFirstName = (e: any): void => {
        const firstName = e.target.value;
        let errorMessage = "";
        if (firstName.length < 2) {
            errorMessage = "too short";
        }
        if (firstName.length > 10) {
            errorMessage = "too long";
        }
        let user = { ...this.state.user };
        let errors = { ...this.state.errors };
        errors.fName = errorMessage;
        user.firstName = firstName;
        this.setState({ user, errors });
    }
    private setLastName = (e: any): void => {
        const lastName = e.target.value;
        let errorMessage = "";
        if (lastName.length < 2) {
            errorMessage = "too short";
        }
        if (lastName.length > 18) {
            errorMessage = "too long";
        }
        let user = { ...this.state.user };
        let errors = { ...this.state.errors };
        errors.lName = errorMessage;
        user.lastName = lastName;
        this.setState({ user, errors });
    }
    private setUserName = (e: any): void => {
        const userName = e.target.value;
        const valUserName = this.state.users.find((u: User) => u.user === userName);
        let errorMessage = "";
        if (valUserName !== undefined) {
            errorMessage = "user exists";
        }
        if (userName.length < 4) {
            errorMessage = "too short";
        }
        if (userName.length > 20) {
            errorMessage = "too long";
        }
        let user = { ...this.state.user };
        let errors = { ...this.state.errors };
        errors.uName = errorMessage;
        user.user = userName;
        this.setState({ user, errors });
    }
    private setPassword = (e: any): void => {
        const pass = e.target.value;
        let errorMessage = "";
        if (pass.length < 4) {
            errorMessage = "too short";
        }
        let errors = { ...this.state.errors };
        let user = { ...this.state.user };
        errors.pass = errorMessage;
        errors.valPass = "";
        user.pass = pass;
        this.setState({ user, errors });
    }
    // // Validate Password
    private valPassword = (e: any): void => {
        const tmpPass = e.target.value;
        let errorMessage = "";
        let color = "#e17055";
        if (tmpPass !== this.state.user.pass) {
            errorMessage = "fad fa fa-times-circle";
        }
        if (tmpPass === this.state.user.pass && this.state.user.pass !== "") {
            color = "#2ed573";
            errorMessage = "fad fa fa-check-circle";
        }
        let errors = { ...this.state.errors };
        let passStyle = { ...this.state.passStyle };
        passStyle.color = color;
        errors.valPass = errorMessage;
        this.setState({ tmpPass, errors, passStyle });
    }
    // Form Functions
    private isFormLegal(): boolean {
        return this.state.user.pass === this.state.tmpPass &&
            this.state.user.pass !== "" &&
            this.state.user.firstName.length >= 2 &&
            this.state.user.firstName.length <= 10 &&
            this.state.user.lastName.length >= 2 &&
            this.state.user.lastName.length <= 18 &&
            this.state.user.user.length >= 4 &&
            this.state.user.user.length <= 20 &&
            this.state.user.pass.length >= 4 &&
            this.state.errors.uName === "";
    }
    private submitForm = (): void => {
        const user = { ...this.state.user };
        user.connected = "true";
        fetch("http://localhost:3001/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(user)
        })
            .then(response => response.json())
            .then(user => {
                let action = { type: ActionType.getOneUser, payload: user };
                store.dispatch(action);
                action = { type: ActionType.getAllUsersNames, payload: [] };
                store.dispatch(action);
                alert(`Welcome to VeyKay ${user.firstName}`)
                this.props.history.push(`/${user.user}`);
            })
            .catch(err => alert(err));
    }
    public render(): JSX.Element {
        return (
            <div className="register">
                <form action="">
                    <h3>register</h3>
                    <table>
                        <tbody>
                            <tr>
                                <td>first name</td>
                                <td><input type="text" onChange={this.setFirstName} value={this.state.user.firstName} autoFocus /></td><td><span>{this.state.errors.fName}</span></td>
                            </tr>
                            <tr>
                                <td>last name</td>
                                <td><input type="text" onChange={this.setLastName} value={this.state.user.lastName} /></td><td><span>{this.state.errors.lName}</span></td>
                            </tr>
                            <tr>
                                <td>user name</td>
                                <td><input type="text" onChange={this.setUserName} value={this.state.user.user} placeholder="at least 4 characters" /></td><td><span>{this.state.errors.uName}</span></td>
                            </tr>
                            <tr>
                                <td>enter password</td>
                                <td><input type="password" onChange={this.setPassword} value={this.state.user.pass} placeholder="at least 4 characters" /></td><td><span>{this.state.errors.pass}</span></td>
                            </tr>
                            <tr>
                                <td>confirm password</td>
                                <td><input type="password" onChange={this.valPassword} /></td>
                                <td><i style={this.state.passStyle} className={this.state.errors.valPass}></i></td>
                            </tr>
                        </tbody>
                    </table>
                    <button disabled={!this.isFormLegal()} onClick={this.submitForm} type="button">let me in!</button>
                </form>
                <NavLink to="/login" exact>back to login</NavLink>
            </div>
        )
    }
}