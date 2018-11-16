import React from "react";
import {
    Text,
    View,
    StyleSheet,
    Slider,
    ActivityIndicator
} from 'react-native';
import TrackPlayer from "react-native-track-player";
import styles from "../styles/styles";
import {Icon} from "react-native-elements";
import store from "../store";
import {isPlaying, isBuffering, hasEnded, openMixPreview} from "../actions";
import connect from "react-redux/es/connect/connect";

class MixProgressBar extends TrackPlayer.ProgressComponent {

    constructor(props) {
        super(props);
        this.state = {
            previewDrag : false,
            previewDragValue : 0,
        };
    }

    _formatTimePosition() {

        let position = this.state.position;

        if (this.state.previewDrag)
        {
            position =  this.state.previewDragValue;
        }

        return this._formatTime(position);
    }
    _formatTimeDuration() {
        let duration = this.state.duration;
        return this._formatTime(duration);
    }

    _formatTime(seconds) {
        let minutes = Math.floor(seconds / 60);
        minutes = (minutes >= 10) ? minutes : "0" + minutes;
        if (minutes > 100) {
            let hourMinutes = Math.floor(minutes % 100);
            minutes = Math.floor(minutes / 100) + ":" + ((hourMinutes >= 10) ? hourMinutes : "0" + hourMinutes);
        }
        let secs = Math.floor(seconds % 60);
        secs = (secs >= 10) ? secs : "0" + secs;
        return minutes + ":" + secs;
    }

    change(value) {
        this.setState({position: value});
        TrackPlayer.seekTo(value);
        this.setState({previewDrag: false});
    }

    previewChange(value) {
        this.setState({previewDrag: true, previewDragValue: value});
    }


    render() {
        return (
            <View style={{}}>

                {
                    this.props.hasEnded === false &&
                    <View style={{width: '100%'}}>
                        <View style={{
                            justifyContent: 'center',
                            alignItems: 'center'}}>
                            <Text style={{color:'#fff', fontSize:12, marginBottom: 0}}>{this._formatTimePosition()} / {this._formatTimeDuration()}</Text>

                            <Slider
                                    step={1}
                                    onSlidingComplete={this.change.bind(this)}
                                    onValueChange={this.previewChange.bind(this)}
                                    maximumValue={this.state.duration}
                                    value={this.state.previewDrag ? this.state.previewDragValue : this.state.position}
                                    trackStyle={customStyles8.track}
                                    thumbStyle={customStyles8.thumb}
                                    disabled={this.state.isBuffering}
                                    minimumTrackTintColor='#db892a'
                                    thumbTintColor='#db892a'
                                    thumbTouchSize={{width: 100, height: 100}}
                                    style={{height: 50, width:'100%'}}
                            />
                        </View>

                    </View>
                }

                {
                    this.props.isBuffering &&
                    <View style={{  height: 10, marginTop: 1}}>
                        <ActivityIndicator size="small" />
                    </View>
                }

            </View>
        );
    }

}
const customStyles8 = StyleSheet.create({
    track: {
        height: 4,
        backgroundColor: '#464646',
    },
    thumb: {
        width: 20,
        height: 20,
        backgroundColor: '#fff',
        borderRadius: 20 / 2
    }
});

const mapStateToProps = (state) => {
    return {
        isPlaying: state.isPlaying.playing,
        isBuffering: state.isBuffering.buffering,
        hasEnded: state.hasEnded.ended,
        mixPlaying: state.mixPlaying.mix.mix,
        mixPreview: state.mixPreview.mix.mix,
    }
};

export default connect(mapStateToProps, { openMixPreview })(MixProgressBar);
