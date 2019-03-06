import { ThunkAction } from "redux-thunk";
import { getBoundary } from "../../config";
import { ICity } from "../../model/location";
import { ILocationState, IViewportState, UPDATE_MAP } from "./types";
import { MaposhState } from "..";
import { Action } from "redux";

export function updatePan(newPan: IViewportState) {
  return {
    type: UPDATE_MAP,
    payload: newPan
  };
}

export function updateCity(
  newCity: ICity
): ThunkAction<void, MaposhState, null, Action<typeof UPDATE_MAP>> {
  return (dispatch, getState) => {
    const { map } = getState();
    const newBoundary = getBoundary(newCity);
    const [
      minLongitude,
      minLatitude,
      maxLongitude,
      maxLatitude,
      cityCenterLongitude,
      cityCenterLatitude
    ] = newBoundary;
    return dispatch({
      type: UPDATE_MAP,
      payload: {
        location: {
          city: newCity,
          boundingBox: newBoundary
        },
        viewport: {
          longitude: cityCenterLongitude,
          latitude: cityCenterLatitude,
          zoom: map.viewport.zoom
        }
      } as ILocationState
    });
  };
}
