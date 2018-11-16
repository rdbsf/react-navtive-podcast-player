import React from "react";
import {
    Text,
    TouchableHighlight,
    View,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import Config from 'react-native-config'
import AsyncImage from '../components/AsyncImage'

import styles from "../styles/styles";
import {mixPreview, openMixPreview} from "../actions";
import store from "../store";
import {connect} from "react-redux";

class Mix extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            deviceHeight: Dimensions.get('window').height,
        };
    }

    // Open preview modal and update state
    _openPreview = () => {
        store.dispatch(mixPreview({type: "MIX_PREVIEW", mix: this.props.mix}));
        this.props.openMixPreview();
    };


    render() {

        let mix = this.props.mix;

        if (this.props.loading === false) {
        return (
            <View>
                <View style={styles.viewCenter}>
                    <Text style={styles.mainHeaderMixNumber}>Mix of the Week #{mix.motw}</Text>
                </View>
                <View style={styles.viewCenter}>
                    {
                        mix.title !== 'Mix for Dream Chimney' &&
                        <Text numberOfLines={1} ellipsizeMode='tail' style={styles.mainHeaderMixTitle}>"{mix.title}"</Text>
                    }
                    <Text numberOfLines={1} ellipsizeMode='tail' style={styles.mainHeaderMixDj}>by {mix.dj}</Text>
                </View>
                <View style={styles.viewCenter}>
                    <TouchableHighlight onPress={() => {
                        this._openPreview();
                    }}>
                    <AsyncImage
                        size={'lrg'}
                        source={{
                            uri: Config.MIX_COVER_BASE_URL + mix.cover
                        }}/>
                    </TouchableHighlight>
                </View>
            </View>
            )
        }
        else {
            return (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" />
                </View>
            )
        }
    }
}

const mapStateToProps = (state) => {
    return {
        isPlaying: state.isPlaying.playing,
        mixPreview: state.mixPreview.mix.mix,
    }
};

export default connect(mapStateToProps, { openMixPreview })(Mix);