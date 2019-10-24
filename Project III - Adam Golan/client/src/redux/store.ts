import { createStore } from "redux";
import { AppState } from "./appState";
import { reducer } from "./reducer";
export const store = createStore(reducer, new AppState());