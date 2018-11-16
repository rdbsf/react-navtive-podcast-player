/**
 * Load all mixes
 * - Query string added for caching
 */
import Config from "react-native-config/index";
import {fetchMixesBegin, fetchMixesSuccess, fetchMixesError} from '../actions/index'

export function fetchMixes() {

    let d = new Date();
    let cache = d.getFullYear().toString() + d.getMonth().toString() + d.getDate().toString() + d.getHours().toString();

    let url = Config.MIXES_JSON_URL + '?v=' + cache;

    return dispatch => {
        dispatch(fetchMixesBegin());
        return fetch(url)
            .then(handleErrors)
            .then(res => res.json())
            .then(json => {
                dispatch(fetchMixesSuccess(json));
                return json;
            })
            .catch(error => dispatch(fetchMixesError(error)));
    };
}

// Handle HTTP errors
function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

