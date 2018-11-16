import {
    FETCH_MIXES_BEGIN,
    FETCH_MIXES_SUCCESS,
    FETCH_MIXES_FAILURE
} from '../actions/index';

const initialState = {
    mixes: [],
    loading: false,
    error: null
};

export default function mixesReducer(state = initialState, action) {
    switch(action.type) {
        case FETCH_MIXES_BEGIN:
            return {
                ...state,
                loading: true,
                error: null
            };

        case FETCH_MIXES_SUCCESS:
            return {
                ...state,
                loading: false,
                mixes: action.payload.mixes
            };

        case FETCH_MIXES_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload.error,
                mixes: []
            };

        default:
            return state;
    }
}