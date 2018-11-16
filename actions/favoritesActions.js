/**
 *  Load user favorites from storage into redux state
 */

import {loadFavorites} from '../actions/index'
import {AsyncStorage} from "react-native";

export function loadFavoriteMixes() {

    return dispatch => {

        return AsyncStorage.getItem('motwFavorites')
            .then(req => JSON.parse(req))
            .then(favs => {
                dispatch(loadFavorites(favs));
                return favs
            });
    };
}
