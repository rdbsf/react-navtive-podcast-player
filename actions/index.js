export const isPlaying = playing => ({ type: 'IS_PLAYING', payload: playing });
export const isBuffering = buffering => ({ type: 'IS_BUFFERING', payload: buffering });
export const hasEnded = ended => ({ type: 'HAS_ENDED', payload: ended });
export const mixPlaying = mix => ({ type: 'NOW_PLAYING', payload: mix });
export const mixPreview = mix => ({ type: 'MIX_PREVIEW', payload: mix });

export const openMixPreview = () => ({ type: 'OPEN_MIX_PREVIEW', payload: true });
export const closeMixPreview = () => ({ type: 'CLOSE_MIX_PREVIEW', payload: false });

export const FETCH_MIXES_BEGIN   = 'FETCH_MIXES_BEGIN';
export const FETCH_MIXES_SUCCESS = 'FETCH_MIXES_SUCCESS';
export const FETCH_MIXES_FAILURE = 'FETCH_MIXES_FAILURE';


export const fetchMixesBegin = () => ({
    type: FETCH_MIXES_BEGIN
});

export const fetchMixesSuccess = mixes => ({
    type: FETCH_MIXES_SUCCESS,
    payload: { mixes }
});

export const fetchMixesError = error => ({
    type: FETCH_MIXES_FAILURE,
    payload: { error }
});

export const ADD_FAVORITE = 'ADD_FAVORITE';
export const REMOVE_FAVORITE = 'REMOVE_FAVORITE';
export const LOAD_FAVORITES = 'LOAD_FAVORITES';

export const loadFavorites = mixes => ({ type: LOAD_FAVORITES, payload: mixes });
export const addFavorite = mix => ({ type: ADD_FAVORITE, payload:  mix  });
export const removeFavorite = mix => ({ type: REMOVE_FAVORITE, payload:  mix  });
