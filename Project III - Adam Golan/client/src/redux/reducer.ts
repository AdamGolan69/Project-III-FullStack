import { AppState } from "./appState";
import { AnyAction } from "redux";
import { ActionType } from "./actionType";
export function reducer(oldAppState: AppState | undefined, action: AnyAction): AppState {
    if (!oldAppState) {
        return new AppState();
    }
    const newAppState = { ...oldAppState };
    switch(action.type){
        case ActionType.getAllUsersNames:
            newAppState.users = action.payload;
            break;
        case ActionType.getOneUser:
            newAppState.user = action.payload;
            break;
        case ActionType.getAllVacations:
            newAppState.vacations = action.payload;
            break;
        case ActionType.getAllFollows:
            newAppState.follows = action.payload;
            break;
        case ActionType.getFollowed:
            newAppState.followed = action.payload;
            break;
    }
    return newAppState;
}