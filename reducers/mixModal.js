
const INITIAL_STATE = { mixPreviewIsOpen: false };

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'OPEN_MIX_PREVIEW':
            return { mixPreviewIsOpen: action.payload};
        case 'CLOSE_MIX_PREVIEW':
            return { mixPreviewIsOpen: action.payload};
        default:
            return state;
    }
}