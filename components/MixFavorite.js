import React from "react";
import {
    TouchableHighlight,
    AsyncStorage
} from 'react-native';
import { Icon } from 'react-native-elements'
import {gaTracker} from '../helper/analytics'
import store from "../store";
import {addFavorite, removeFavorite} from "../actions";
import {connect} from "react-redux";

class MixFavorite extends React.Component {

    constructor(props) {
        super(props);
    }

    _toggleFavorite = () =>
    {
        let _this = this;
        AsyncStorage.getItem('motwFavorites')
            .then(favs => JSON.parse(favs))
            .then((json) => {

                if (json === null) {
                    json = [];
                }
                Array.prototype.inArray = function(comparer) {
                    for(var i=0; i < this.length; i++) {
                        if(comparer(this[i])) return true;
                    }
                    return false;
                };

                Array.prototype.pushIfNotExist = function(element, comparer) {
                    if (!this.inArray(comparer)) {
                        this.push(element);
                    }
                };

                let compFunc = function(e) {
                    return e === _this.props.mix.motw;
                };

                if (json.inArray(compFunc))
                {
                    // mix is in favorites
                    let index = json.indexOf(_this.props.mix.motw);
                    if (index > -1) {
                        json.splice(index, 1);
                    }
                    store.dispatch(removeFavorite(_this.props.mix));

                    gaTracker.trackEvent("MOTW app", "Favorite remove");
                }
                else {
                    // mix is not in favorites
                    json.pushIfNotExist(_this.props.mix.motw, compFunc);

                    store.dispatch(addFavorite(_this.props.mix));

                    gaTracker.trackEvent("MOTW app", "Favorite add");
                }

                // Saving updated favorites
                AsyncStorage.setItem('motwFavorites', JSON.stringify(json));
            });
    };

    render() {
        // if favorite status is set via prop it will override it here
        let isFavorite = this.props.favorites !== null ? this.props.favorites.includes(this.props.mix.motw) : false;

        return (
            <TouchableHighlight underlayColor={'transparent'} onPress={() => this._toggleFavorite()} style={{marginRight: 0, marginTop:20}}>
                <Icon
                    type='ionicons'
                    name= {isFavorite ? 'favorite' : 'favorite-border'}
                    size={35}
                    color='#fff'
                    containerStyle={{marginTop:-3}}
                />
            </TouchableHighlight>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        mixPreview: state.mixPreview.mix.mix,
        favorites: state.userFavorites.favorites,
    }
};

export default connect(mapStateToProps)(MixFavorite);
