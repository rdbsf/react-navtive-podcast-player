/**
 * Mix cover image loading async with spinner and now playing icon
 */
import React from "react";
import {
    Image,
    ImageBackground,
    View,
    ActivityIndicator
} from 'react-native';
import { Icon } from 'react-native-elements'

import {isTablet} from "../helper/dimentions";


export default class Screen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false
        }
    }

    _onLoad = () => {
        this.setState(() => ({ loaded: true }))
    };

    render() {

        const {
            size,
            source
        } = this.props;

        if (size === 'archive')
        {
            this.width = 160;
            this.height = 160;
        }
        else  if (size === 'preview') {
            this.width = isTablet() ? 320 : 160;
            this.height = isTablet() ? 320 : 160;
        }
        else  if (size === 'lrg') {
            this.width = isTablet() ? 400 : 220;
            this.height = isTablet() ? 400 : 220;
        }
        return (
            <View>
                <ImageBackground
                    source={source}
                    resizeMode={'contain'}
                    style={
                        {
                            width: this.width,
                            height: this.height,
                            marginTop: 5,
                            marginBottom: 0,
                            alignItems: 'center'
                        }
                    }
                    onLoad={this._onLoad}>
                    {
                        size === 'archive' && this.props.nowplaying &&
                        <View style={{position: 'absolute', right:0, top:0, backgroundColor: '#000', color:'yellow', padding:5, opacity: 0.7}}>
                            <Icon
                                type='font-awesome'
                                name= 'volume-up'
                                size={16}
                                color='yellow' />
                        </View>
                    }
                </ImageBackground>
                {!this.state.loaded &&
                <View
                    style={
                        {
                            width: this.width,
                            height: this.height,
                            marginTop: 5,
                            marginBottom: 0,
                            alignItems: 'center',
                            position: 'absolute',
                            justifyContent: 'center',
                            flex: 1
                        }
                    } >
                        <ActivityIndicator size="large" />
                    </View>
                }

            </View>
        );
    }
}
