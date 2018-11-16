import React from "react";
import {
    Text,
    View,
    ScrollView,
    ActivityIndicator,
    TouchableHighlight, AsyncStorage
} from 'react-native';

import AsyncImage from '../components/AsyncImage'
import Config from 'react-native-config'
import styles from '../styles/styles'
import store from "../store";
import {mixPreview, openMixPreview} from "../actions";
import {connect} from "react-redux";


class FavoritesScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            modalVisible: false,
            isPlaying: false,
            nowPlaying: null,
            mixes: [],
            mixPreview: [],
            favorites: [],
        };

    }

    componentDidMount() {

        this.props.navigation.setParams({
            scrollToTop: this.callScrollToTop.bind(this)
        });

        this.setState({loading: false});

    };

    callScrollToTop() {
        this.refs._scrollView.scrollTo({x:0,y:0,animated:true});
    };

    _openPreview = (mix) => {
        store.dispatch(mixPreview({type: "MIX_PREVIEW", mix: mix}));
        this.props.openMixPreview();
    };

    renderList()
    {
        if(this.state.loading) {
            return (
                <View style={styles.viewCenter}>
                    <ActivityIndicator size="large" />
                </View>
            )
        }
        else if (this.props.favorites === null || this.props.favorites.length === 0)
        {
            return (
                <View style={{ alignItems: 'center', alignSelf: 'center'}}>
                    <View style={styles.viewCenter}>
                        <Text style={styles.defaultTextHeader}>Your Favorite Mixes</Text>
                    </View>
                    <View style={styles.viewCenter}>
                        <Text style={styles.defaultText}>Click the heart icon to favorite a mix.</Text>
                    </View>
                </View>
            )
        }
        else {
            let list = [];
            this.props.favorites.slice().reverse().map((motw,index) => {

                let mix = {};
                mix  = this.props.mixes.find(function(o){return o.motw === motw;} );

                list.push(
                    <TouchableHighlight onPress={() => this._openPreview(mix)} key={index}>
                        <View style={{padding: 10}}>
                            <AsyncImage
                                size='archive'
                                nowplaying={this.props.isPlaying && this.props.mixPlaying.motw === mix.motw}
                                source={{
                                    uri: Config.MIX_COVER_BASE_URL + mix.cover
                                }}/>
                            <Text allowFontScaling={false} numberOfLines={1} ellipsizeMode='tail' style={{marginTop: 5, width: 140, color: '#F5FCFF'}}>#{mix.motw} by {mix.dj}</Text>
                        </View>
                    </TouchableHighlight>
                );

            });
            return (
                <View style={{ alignItems: 'center', alignSelf: 'center', paddingTop: 14}}>
                    <ScrollView ref="_scrollView">
                        <View style={{flex:1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', alignSelf: 'center'}}>
                            {list}
                        </View>
                    </ScrollView>
                </View>
            )
        }
    }
    render() {
        return (
            <View style={styles.loading}>
                {this.renderList()}
            </View>

        )
    }
}

const mapStateToProps = (state) => {
    return {
        isPlaying: state.isPlaying.playing,
        mixPlaying: state.mixPlaying.mix.mix,
        mixPreview: state.mixPreview.mix.mix,
        favorites: state.userFavorites.favorites,
        mixes: state.mixes.mixes,
    }
};

export default connect(mapStateToProps, { openMixPreview })(FavoritesScreen);