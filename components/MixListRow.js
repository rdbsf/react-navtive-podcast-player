import React from "react";
import {
    Image,
    Text,
    Button,
    TouchableHighlight,
    View,
    ScrollView,
    AsyncStorage
} from 'react-native';

import styles from "../styles/styles";
import Config from "react-native-config/index";

export default class MixListRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View key={this.props.mix.motw} style={{flex:2, flexDirection: 'row', paddingTop: 16, paddingBottom: 16, borderBottomWidth:1, borderBottomColor:'#484848'}}>
                <Image style={{width:70, height:70}} source={{uri: Config.MIX_COVER_BASE_URL + this.props.mix.cover}} />
                <View>
                    <Text style={{color: '#fff', marginLeft: 12}}>Mix of the Week #{this.props.mix.motw}</Text>
                    <Text numberOfLines={1} ellipsizeMode='tail' style={{color: '#fff', marginLeft: 12}}>"{this.props.mix.title}"</Text>
                    <Text numberOfLines={1} ellipsizeMode='tail' style={{color: '#fff', marginLeft: 12}}>by {this.props.mix.dj}</Text>
                </View>
            </View>
        );
    }
}
