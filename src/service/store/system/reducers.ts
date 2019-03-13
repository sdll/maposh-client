import config from "../../../config";
import {
  ISystemState,
  SystemActionType,
  UPDATE_SESSION
} from "../../../service/store/system/types";

const initialSystemState: ISystemState = {
  language: config.locale.default,
  isAuthenticated: false
};

export function systemReducer(
  state = initialSystemState,
  action: SystemActionType
): ISystemState {
  switch (action.type) {
    case UPDATE_SESSION: {
      return {
        ...state,
        ...action.payload
      };
    }
    default:
      return state;
  }
}
