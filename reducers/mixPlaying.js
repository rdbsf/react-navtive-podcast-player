

const initialState = { mix: [] };

export default function mixPlaying(state = initialState, action) {
    switch (action.type) {
        case 'NOW_PLAYING':
            return {
                ...state,
                mix: action.payload,
            };
        default:
            return state;
    }
}