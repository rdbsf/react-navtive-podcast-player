import React from "react";
import {
    Platform,
    Image,
    View,
    Dimensions,
    ActivityIndicator,
    TouchableHighlight,
    AppState
} from 'react-native';
import {connect} from 'react-redux'

// Google Analytics
import {gaTracker} from '../helper/analytics'
import SwiperFlatList from 'react-native-swiper-flatlist';
import SplashScreen from 'react-native-splash-screen'
import { fetchMixes } from "../actions/mixActions";
import AsyncImage from '../components/AsyncImage'
import Mix from '../components/Mix'
import MixFavorite from '../components/MixFavorite'
import Config from 'react-native-config'
import { Icon, Button, Avatar } from 'react-native-elements'
import styles from '../styles/styles'
import store from '../store/index'
import {isPlaying, mixPlaying, mixPreview} from '../actions'
import {isTablet, isIphoneX} from "../helper/dimentions"
import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);


class MixCastScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            currIndex: 0,
            appState: AppState.currentState,
            cliendId: 'client_id=' + Config.SOUNDCLOUD_CLIENT_ID,
            // a way to keep the playbar displayed after the first play
            somethingHasPlayed: false,
            modalHasOpenedOnce: false,
            loading: true,
            renderAll: false,
            mixes: [],
            mixPreview: [],
            mixInView: [],
            mix: {},
            indexToStart: 0,
            deviceWidth: Dimensions.get('window').width,
            deviceHeight: Dimensions.get('window').height,
            orientation: Platform.isLandscape ? 'landscape' : 'portrait',
        };
        this.moveToMostRecentMix = this.moveToMostRecentMix.bind(this);

        // Event Listener for orientation changes
        Dimensions.addEventListener('change', () => {
            this.setState({
                orientation: Platform.isLandscape ? 'landscape' : 'portrait',
                deviceHeight: Dimensions.get('window').height,
                deviceWidth: Dimensions.get('window').width
            });

            this.forceUpdateHandler();
        });
    }

    static navigationOptions = ({navigation}) => {
        const {params} = navigation.state;
        return {
            headerTitle: navigation.state.params && navigation.state.params.headerTitle
        };
    };

    forceUpdateHandler(){
        this.reloadMixesAndMove();
    };

    componentDidMount() {

        let mostRecentMix = this.props.mixes[this.props.mixes.length - 1];

        this.setState({
            mix: mostRecentMix,
            loading: false,
            mixInView: mostRecentMix,
            mixes: this.props.mixes.reverse()
        });

        // Need for app state , background.foreground events
        AppState.addEventListener('change', this._handleAppStateChange);

        // helper for second tap of tab (refresh)
        this.props.navigation.setParams({
            moveToLatestMix: this.callScrollToLatestMix.bind(this)
        });

        // After having done stuff (such as async tasks) hide the splash screen
        SplashScreen.hide();
    };


    callScrollToLatestMix() {
        this.moveToMostRecentMix();
    };

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            // checking for new mixes when app is brought to foreground
            this.props.dispatch(fetchMixes()).then(() => {

                // if user is not listening to something and new mix has been added
                if (this.state.mixes.length < this.props.mixes.length && this.props.isPlaying === false)
                {
                    let mostRecentMix = this.props.mixes[this.props.mixes.length - 1];

                    this.setState({
                        mix: mostRecentMix,
                        loading: false,
                        mixInView: mostRecentMix,
                        mixes: this.props.mixes.reverse()
                    });
                }

            });

        }
        this.setState({appState: nextAppState});
    };

    // on orientation change SwiperFlatList wont correctly adjust the width
    // so im forced to reload all the mixes and basically re-render and move to the mix
    reloadMixesAndMove = () =>{
        this.setState({
            mixes: [],
            loading: true
        });
        let url = Config.MIXES_JSON_URL ;
        fetch(url).
        then(response => response.json()).then((mixes) => {
            this.setState({
                loading: false,
                mixes: mixes.reverse()
            });
            this.moveToMix(this.state.mixInView);
        });
    };

    moveToMostRecentMix()
    {
        this.moveToMix(this.state.mixes[0]);
        gaTracker.trackEvent("MOTW app", "Header Home");
    }

    moveToMix(mix)
    {
        this.state.mixes.forEach((m, index) => {
            if(m.motw === mix.motw) {
                this.setState({mixInView: mix, loading: false});
                this.refs.swiper._scrollToIndex(index, false);
            }
        });
    }

    _shuffle()
    {
        let _this = this;
        this.setState({renderAll: true, loading: true});
        // Load a random mix
        let randomMix = _this.state.mixes[Math.floor(Math.random() * _this.state.mixes.length)];
        _this.moveToMix(randomMix);
        gaTracker.trackEvent("MOTW app", "Shuffle");
    }


    // Main "Play" button in the middle of screen
    _mainPlayPauseButton() {

        // check which mix you are playing, the current mix in the slider view
        let mixInView = this.state.mixInView;

        if (this.props.isPlaying)
        {

            if (this.props.mixPlaying.motw !== mixInView.motw)
            {
                // Play the new mix
                store.dispatch(mixPlaying({type: "NOW_PLAYING", mix: mixInView}));
            }
            else {
                // pause the mix you are listening to
                store.dispatch(isPlaying({type: "IS_PLAYING", playing: false}));
            }

        }
        else {
            store.dispatch(isPlaying({type: "IS_PLAYING", playing: true}));
            store.dispatch(mixPlaying({type: "NOW_PLAYING", mix: mixInView}));
        }
        gaTracker.trackEvent("MOTW app", "Play/Pause");
    }


    _mainPlayPauseButtonIcon()
    {
        // this button get displayed under the mix cover, might not be the mix that is playing
        if (this.state.mixInView && this.props.mixPlaying && this.props.mixPlaying.motw === this.state.mixInView.motw) {
            return this.props.isPlaying ? 'pause-circle-filled' : 'play-circle-filled';
        }
        else {
            return 'play-circle-filled';
        }
    }

    renderItemComponent = ({ item }) => (
        item &&
        <View key={item.motw} style={{width: this.state.deviceWidth, alignItems: 'center', textAlign:'center', marginTop:30}}>

            <Mix mix={item} loading={this.state.loading} />

        </View>
    );

    // tablet landscape specific height to allow larger image
    getSwiperHeight = () => {
        let swiperHeight = isTablet() ? 520 : 340;

        if (isIphoneX())
        {
            swiperHeight = 360;
        }

        if (this.state.deviceHeight === 768)
        {
            swiperHeight = 470;
        }

        return swiperHeight;
    };


    render() {

        if (this.state.loading === false) {
            gaTracker.trackEvent("MOTW app", "Home");
            return (
                <View style={{flex: 1,backgroundColor: '#04080c'}}>
                    <View style={{flex: 1}}>

                        <View style={{height: this.getSwiperHeight(), alignItems:'center'}}>
                            <SwiperFlatList
                                ref="swiper"
                                data={this.state.mixes}
                                renderItem={this.renderItemComponent}
                                renderAll={this.state.renderAll}
                                index={this.state.indexToStart}
                                onMomentumScrollEnd={({index}) => {
                                    this.setState({'currIndex': index, 'mixInView': this.state.mixes[index]});
                                }}
                            />
                        </View>

                        <View style={{alignSelf: 'center', flexDirection: 'row', marginTop: 4}}>

                            <TouchableHighlight onPress={() => this._shuffle()} style={{marginRight: 30, marginTop:20}}>
                                <Icon
                                    type='font-awesome'
                                    name= 'random'
                                    size={30}
                                    color='#fff' />
                            </TouchableHighlight>

                            <TouchableHighlight onPress={() => this._mainPlayPauseButton()} style={{marginRight: 30}}>
                                <Icon
                                    type='material'
                                    name= {this._mainPlayPauseButtonIcon()}
                                    size={70}
                                    color='#fff' />
                            </TouchableHighlight>

                            <MixFavorite mix={this.state.mixInView} />

                        </View>

                    </View>
                    <View style={{
                        alignItems: 'center',
                        height: 70,
                        marginBottom: 0,
                        paddingBottom: this.state.somethingHasPlayed ? 130 : 0
                    }}>
                        <Image style={styles.logo} resizeMode="stretch" source={require('../images/motw_title.png')}/>

                    </View>

                </View>
            );
        }
        else {
            return (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" />
                </View>
            )
        }
    };
}

const mapStateToProps = (state) => {
    return {
        isPlaying: state.isPlaying.playing,
        mixPlaying: state.mixPlaying.mix.mix,
        mixPreview: state.mixPreview.mix.mix,

        favorites: state.userFavorites.favorites,

        mixes: state.mixes.mixes,
        loading: state.mixes.loading,
        error: state.mixes.error
    }
};

export default connect(mapStateToProps)(MixCastScreen);