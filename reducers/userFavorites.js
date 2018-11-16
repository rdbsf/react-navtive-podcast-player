import {
    ADD_FAVORITE,
    LOAD_FAVORITES,
    REMOVE_FAVORITE
} from '../actions/index';

const initialState = {
    favorites: [],
};

const removeMix = (favorites, id) => {
    // return a new list with all values, except the matched id
    return favorites.filter(motwId => motwId !== id);
};

export default function userFavorites(state = initialState, action) {
    switch(action.type) {
        case LOAD_FAVORITES:
            return {
                ...state,
                favorites: action.payload
            };
        case ADD_FAVORITE:

            // passing the entire mix object
            let mixToAdd = action.payload.motw;

            let mixAlreadyExists = false;
            let existingFavorites = [];
            if (state.favorites !== null)
            {
                mixAlreadyExists = state.favorites.indexOf(mixToAdd) > -1;
                existingFavorites = state.favorites.slice();
            }

            // make a copy of the existing array
            if (!mixAlreadyExists) {
                // modify the COPY, not the original
                existingFavorites.push(mixToAdd);
            }

            return {
                ...state,
                favorites: existingFavorites
            };

        case REMOVE_FAVORITE:
            // passing the entire mix object to payload
            return {
                ...state,
                favorites: removeMix(state.favorites, action.payload.motw),
            };

        default:
            // always have a default case in a reducer
            return state;
    }
}