import { combineReducers } from "redux";
import mixPlaying from "./mixPlaying";
import isPlaying from "./isPlaying";
import hasEnded from "./hasEnded";
import isBuffering from "./isBuffering";
import mixModal from "./mixModal"
import mixPreview from "./mixPreview"
import mixes from "./mixesReducer"
import userFavorites from "./userFavorites"

// Combine reducers
const mixApp = combineReducers({
    mixPlaying,
    isPlaying,
    hasEnded,
    isBuffering,
    mixModal,
    mixPreview,
    mixes,
    userFavorites
});

export default mixApp;