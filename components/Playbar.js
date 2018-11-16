import React from "react";
import {
    Text,
    View,
    Platform,
    ActivityIndicator, TouchableHighlight, AppRegistry
} from 'react-native';
import {connect} from 'react-redux'
import { Icon, Button, Avatar } from 'react-native-elements'

import TrackPlayer from "react-native-track-player";
import store from "../store";
import {openMixPreview, isPlaying, isBuffering, hasEnded, mixPlaying, mixPreview} from "../actions";
import Config from "react-native-config/index";
import AsyncImage from '../components/AsyncImage'

import styles from "../styles/styles";

class Playbar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            buffering: false,
            ended: false,
            hasPlayedSomething: false, // helps keep open once a mix has been played, it wont hide again after that
        }
    }

    componentDidMount() {

        if (Platform.OS === 'android') {

            TrackPlayer.setupPlayer().then(async () => {
                    TrackPlayer.updateOptions({
                        //stopWithApp: true,
                        capabilities: [
                            TrackPlayer.CAPABILITY_PLAY,
                            TrackPlayer.CAPABILITY_PLAY_FROM_ID,
                            TrackPlayer.CAPABILITY_PAUSE,
                            TrackPlayer.CAPABILITY_STOP,
                            TrackPlayer.CAPABILITY_SKIP,
                            TrackPlayer.CAPABILITY_SKIP_TO_NEXT
                        ]
                    });
            });

            AppRegistry.registerHeadlessTask('TrackPlayer', () => require('../helper/player-handler.js').bind(null, this));

        }
        else {

            TrackPlayer.setupPlayer();
            TrackPlayer.registerEventHandler(() => {});
            TrackPlayer.updateOptions({
                stopWithApp: true,
                capabilities: [
                    TrackPlayer.CAPABILITY_PLAY,
                    TrackPlayer.CAPABILITY_PAUSE,
                    TrackPlayer.CAPABILITY_SKIP,
                    TrackPlayer.CAPABILITY_SKIP_TO_NEXT
                ]
            });

            TrackPlayer.registerEventHandler(async (data) => {
                if (data.type === 'playback-state') {
                    //console.warn(data.state);
                    if (data.state === TrackPlayer.STATE_PLAYING) {
                        store.dispatch(hasEnded({type: "HAS_ENDED", ended: false}));
                    }
                    this.setState({buffering: data.state === TrackPlayer.STATE_BUFFERING});
                    store.dispatch(isBuffering({type: "IS_BUFFERING", buffering: data.state === TrackPlayer.STATE_BUFFERING}));

                }
                if (data.type === 'playback-queue-ended') {
                    TrackPlayer.stop();
                    store.dispatch(isPlaying({type: "IS_PLAYING", playing: false}));
                }
                if (data.type === 'playback-queue-ended') {
                    store.dispatch(hasEnded({type: "HAS_ENDED", ended: true}));
                }
            });
        }


    }

    componentDidUpdate(prevProps, prevState, snapshot)
    {
        if (prevProps.isPlaying !== this.props.isPlaying && prevProps.mixPlaying === this.props.mixPlaying)
        {

            if (this.props.isPlaying)
            {
                TrackPlayer.getPosition().then((d)=>{
                    if (d === 0)
                    {
                        TrackPlayer.reset();
                        this._playMix(this.props.mixPlaying);
                    }
                    else {
                        TrackPlayer.play();
                    }
                });

            }
            else {
                TrackPlayer.pause();
            }
        }

        // Different mix is it set to "now playing"
        // check to see if the playing is playing something
        if (prevProps.mixPlaying !== this.props.mixPlaying)
        {
            if (this.props.isPlaying)
            {
                // is playing something, stop and play new mix
                if (Platform.OS === 'android')
                {
                    TrackPlayer.pause();
                }
                else {
                    TrackPlayer.stop();
                }
                this._playMix(this.props.mixPlaying);

            }
            else {
                // this case may not be applicable
                // since when changing a mix we will always be set to "playing"
                TrackPlayer.play();
            }
        }
    }

    _playMix = (mix) => {

        let SoundCloudId = mix.sc_id;

        TrackPlayer.setupPlayer().then(async () => {

            // Adds a track to the queue
            await TrackPlayer.add({
                id: mix.motw,
                url: "https://api.soundcloud.com/tracks/" + SoundCloudId + "/stream?" + 'client_id=' + Config.SOUNDCLOUD_CLIENT_ID,
                title: mix.title,
                artist: mix.dj,
                artwork: Config.MIX_COVER_BASE_URL + mix.cover
            });

            // skip the track player directly to the track we just added
            try {
                await TrackPlayer.skip(mix.motw)
            } catch (_) {
                TrackPlayer.reset();
            }

            // keep the playbar open
            if (!this.state.somethingHasPlayed)
            {
                this.setState({somethingHasPlayed: true});
            }

        });

    };

    _playPausePlayingMix = () => {

        if (this.props.isPlaying)
        {
            store.dispatch(isPlaying({type: "IS_PLAYING", playing: false}));
        }
        else {
             store.dispatch(isPlaying({type: "IS_PLAYING", playing: true}));
        }
    };

    _nowPlayingButtonIcon = () => {

        return this.props.isPlaying ? 'pause-circle-filled' : 'play-circle-filled';
    };

    _openPreview = () => {
        store.dispatch(mixPreview({type: "MIX_PREVIEW", mix: this.props.mixPlaying}));
        this.props.openMixPreview();
    };

    render() {
        return (
            <View style={{height: this.props.isPlaying || this.state.somethingHasPlayed ? 60 : 0, alignSelf: 'stretch', paddingLeft: 10, backgroundColor: '#333', borderTopWidth: this.state.somethingHasPlayed ? 1 : 0, borderTopColor:'yellow'}}>
                {
                    this.state.buffering &&
                    <View style={{  alignSelf: 'stretch', height: 38, marginTop: 18}}>
                        <ActivityIndicator size="small" />
                    </View>
                }
                {
                    this.props.mixPlaying && this.state.buffering === false &&
                    <View style={{flex:1, flexDirection: 'row', marginTop:10}}>


                        <TouchableHighlight underlayColor='#333' onPress={() => this._playPausePlayingMix()}>
                            <Icon
                                type='material'
                                name= {this._nowPlayingButtonIcon()}
                                size={32}
                                color='#fff'
                                containerStyle={{marginRight: 15, marginLeft:5}}
                            />
                        </TouchableHighlight>

                        <TouchableHighlight underlayColor='#333' onPress={() => { this._openPreview();}}>
                            <View>

                                <Text allowFontScaling={false} style={styles.textNowPlayingHeader}>Now Playing</Text>
                                <Text allowFontScaling={false} numberOfLines={1} ellipsizeMode='tail' style={styles.textNowPlaying}>Mix #{this.props.mixPlaying.motw} by {this.props.mixPlaying.dj}</Text>

                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight underlayColor='#333' style={{flex:1, alignItems: 'flex-end', marginTop:5, marginRight: 10}}>
                            <View style={{flex:1, flexDirection: 'row'}}>

                                <Icon
                                    type='material'
                                    name= 'keyboard-arrow-up'
                                    size={44}
                                    color='#fff'
                                    onPress={() => { this._openPreview();}}
                                    containerStyle={{marginTop:-10}}
                                />
                            </View>
                        </TouchableHighlight>
                    </View>
                }
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        isPlaying: state.isPlaying.playing,
        isBuffering: state.isBuffering.buffering,
        hasEnded: state.hasEnded.ended,
        mixPlaying: state.mixPlaying.mix.mix,
        mixPreview: state.mixPreview.mix.mix,
    }
};

export default connect(mapStateToProps, { openMixPreview })(Playbar);