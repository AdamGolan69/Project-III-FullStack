import React, { Component } from 'react';
import "./layout.css";
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { LoginBox } from '../login-box/loginBox';
import { UserPage } from '../userPage/userPage';
import { Register } from '../register/register';
import { AdminPage } from '../adminPage/adminPage';
export class Layout extends Component {
    public render(): JSX.Element {
        return (
            <div className="layout">
                <BrowserRouter>
                    <main>
                        <Switch>
                            <Route path="/login" component={LoginBox} exact />
                            <Route path="/register" component={Register} exact />
                            <Route path="/admin" component={AdminPage} exact />
                            <Route path="/:userName" component={UserPage} exact />
                            <Redirect from="/" to="/login" />
                        </Switch>
                    </main>
                </BrowserRouter>
            </div>
        )
    }
}
