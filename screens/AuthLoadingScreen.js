import React from "react";
import {
    View,
    ActivityIndicator
} from 'react-native';

import styles from "../styles/styles";
import { fetchMixes } from "../actions/mixActions";
import { loadFavoriteMixes } from "../actions/favoritesActions";
import { connect } from 'react-redux';


class AuthLoadingScreen extends React.Component {

    constructor(props) {
        super(props);

        this._bootstrapAsync();
    }

    // Fetch the mixes then navigate to our appropriate place
    _bootstrapAsync = async () => {

       this.props.dispatch(fetchMixes())
           .then(() => {

               return this.props.dispatch(loadFavoriteMixes()).then(() => {
                   this.props.navigation.navigate('AppReady');
               });
       });

    };

    render() {
        return (
            <View style={[styles.loading,{backgroundColor:'#db892a'}]}>
                <ActivityIndicator color={'#fff'} size="large" />
            </View>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        mixes: state.mixes.mixes,
        loading: state.mixes.loading,
        error: state.mixes.error
    }
};

export default connect(mapStateToProps)(AuthLoadingScreen);