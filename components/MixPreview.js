import React from "react";
import {
    Text,
    StyleSheet,
    TouchableHighlight,
    View,
    Modal,
    ScrollView,
    Linking,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    Platform,
    Share
} from 'react-native';
import { Icon, Avatar } from 'react-native-elements'
import Mix from '../components/Mix'
import MixFavorite from '../components/MixFavorite'
import MixAirplay from '../components/MixAirplay'
import styles from "../styles/styles";
import SwiperFlatList from 'react-native-swiper-flatlist';
import Config from "react-native-config/index";
import {isTablet, isIphoneX} from "../helper/dimentions"
import MixListRow from "./MixListRow";
import AsyncImage from "./AsyncImage";
import store from "../store";
import {isPlaying, mixPlaying, mixPreview} from "../actions";
import {connect} from "react-redux";
import { closeMixPreview } from "../actions";
const { width, height } = Dimensions.get('window');
import MixProgressBar from '../components/MixProgressBar'
import {gaTracker} from '../helper/analytics'


class MixPreview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            slide: 0,
            loading: true,
            selected: false,
            refreshing: false,
            fetched: false,
            djProfile: {},
            tracklist: [],
            mixes: [],
            mixDetails: [],
            djMixes: [],
            relatedMixes: [],
        };
    }

    fetchData = () => {
        let url = 'https://dreamchimney.com/api/motw/details/' + this.props.mixPreview.motw ;
        return fetch(url).
        then(response => response.json()).then((mixes) => {
            this.setState({
                mixDetails: mixes.mix,
                djProfile: mixes.dj,
                djMixes: mixes.mixes,
                relatedMixes: mixes.related_mixes,
                tracklist: mixes.tracklist,
            });
            this.setState({loading: false, fetched: true});
        });

    };

    componentDidMount(){

        let url = Config.MIXES_JSON_URL ;
        fetch(url).
        then(response => response.json()).then((mixes) => {
            this.setState({
                mixes: mixes
            });
        });

    }

    componentDidUpdate(prevProps, prevState, snapshot)
    {

        if (prevProps.modal && prevProps.modal.mixPreviewIsOpen !== this.props.modal.mixPreviewIsOpen)
        {
            this.fetchData();
        }

        if (prevState.mixPreview !== this.props.mixPreview)
        {
            if (!this.state.fetched)
            {
                this.fetchData();
            }
        }

    }


    _playPreviewedMix(){
        // if you are playing music and its the same mix you hit the button on, then pause it
        if (this.props.isPlaying && this.props.mixPlaying && this.props.mixPlaying.motw === this.props.mixPreview.motw)
        {
            store.dispatch(isPlaying({type: "IS_PLAYING", playing: false}));
        }
        else {

            store.dispatch(isPlaying({type: "IS_PLAYING", playing: true}));
            store.dispatch(mixPlaying({type: "NOW_PLAYING", mix: this.props.mixPreview}));
        }
    }

    _changeMixInModal = (newMix) => {

        this.setState({loading: true});

        // find the mix object using the id since the mix was from the api not the mixes.json
        let foundMix = [];
        this.state.mixes.map((mix,index) => {
            if (mix.motw === newMix.motw) {
                foundMix.push(mix);
            }
        });

        store.dispatch(mixPreview({type: "MIX_PREVIEW", mix: foundMix[0]}));

        this.setState({fetched: false, slide: 0});
        this.refs.mixswiper._scrollToIndex(0, true);

    };

    // link to DJ bio url
    _profileExternal = (username) => {
        Linking.canOpenURL('https://soundcloud.com/' + username).then(supported => {
            if (supported) {
                Linking.openURL('https://soundcloud.com/' + username);
            }
        });
    };


    _share = () => {

        let introMessage = this.props.mixPlaying && this.props.mixPlaying.motw === this.props.mixPreview.motw ? 'Listening to' : 'Check out';
        Share.share({
            message: introMessage + ' Dream Chimney Mix of the Week #' + this.props.mixPreview.motw  + ' by ' + this.props.mixPreview.dj,
            url: this.props.mixPreview.url,
            title: this.props.mixPreview.title
        }, {
            // Android only:
            dialogTitle: 'Mix of the Week #' + this.props.mixPreview.motw,
        });
        gaTracker.trackEvent("MOTW app", "Share");
    };


    // pull to reload tracklists
    _onRefresh = () => {
        this.setState({refreshing: true});
        this.fetchData().then(() => {
            this.setState({refreshing: false});
        });
    };

    _thisClose = () => {
        this.setState({loading: true, fetched: false, slide: 0});
        this.props.closeMixPreview();
    };

    render() {

        return (
            <Modal
                animationType="slide"
                transparent={false}
                visible={this.props.modal.mixPreviewIsOpen}
                style={{backgroundColor:'#04080c'}}
                onRequestClose={() => {
                    this.props.closeMixPreview();
                }}>

                    <View style={{flex:1, backgroundColor:'#282828'}}>

                        <View style={{backgroundColor:'#000', height:'10%', marginTop: isIphoneX() ? 30 : 0}}>
                            <View>
                                {
                                    Platform.OS === 'ios' &&
                                    <MixAirplay />
                                }
                            </View>
                            <Icon
                                type='ionicons'
                                name= 'close'
                                size={42}
                                color='#fff'
                                onPress={() => {
                                    this._thisClose()
                                }}
                                underlayColor={'#04080c'}
                                containerStyle={{position:'absolute', top: 16, right:10}}
                            />
                        </View>

                        {
                            this.state.loading &&
                            <View style={styles.loading}>
                                <ActivityIndicator size="large" />
                            </View>
                        }

                        {
                            this.state.loading === false && this.props.mixPreview &&
                            <View style={{height: '90%'}}>

                                <View style={{flex:1}}>
                                    {/*Mix Details Header*/}
                                    <View style={[modalStyles.modalHeaderMixDetails, {height:isTablet()?'10%':'14%'}]}>
                                        <View style={{alignItems: 'center', textAlign: 'center'}}>
                                            {
                                                this.state.loading === false && this.props.mixPreview &&
                                                <View>
                                                    <Text numberOfLines={1} ellipsizeMode='tail' style={modalStyles.headerMixTitle}>Mix of the Week #{this.props.mixPreview.motw}</Text>
                                                    <Text numberOfLines={1} ellipsizeMode='tail' style={modalStyles.headerMixTitle}>"{this.props.mixPreview.title}"</Text>
                                                    <Text numberOfLines={1} ellipsizeMode='tail' style={[modalStyles.headerMixTitle, {color: '#fbef00'}]}>by {this.props.mixPreview.dj}</Text>
                                                </View>
                                            }
                                        </View>
                                    </View>
                                    {/*END Mix Details Header*/}

                                    {/*Header Nav Bar*/}
                                    <View style={{backgroundColor:'#1f1f1f',marginTop:0, paddingTop:10,height:isTablet()?'8%':'9%'}}>
                                        <View style={{flex: 1, alignItems: 'center',  flexDirection: 'row', justifyContent: 'center', marginRight: 0, marginLeft:0, marginBottom: 0, paddingBottom:0}}>

                                            <TouchableHighlight underlayColor={'#1f1f1f'} style={{borderBottomColor: this.state.slide === 0 ? '#fbef00' : '#1f1f1f', borderBottomWidth:2, paddingLeft:18, paddingRight:18, paddingBottom:10}} onPress={() => {this.setState({slide: 0});this.refs.mixswiper._scrollToIndex(0, true)}}><Text style={{fontSize: isTablet() ? 18 : 14, color: this.state.slide === 0 ? '#fff': '#fcfcfc'}} allowFontScaling={false}>MIX</Text></TouchableHighlight>
                                            <TouchableHighlight underlayColor={'#1f1f1f'} style={{borderBottomColor: this.state.slide === 1 ? '#fbef00' : '#1f1f1f', borderBottomWidth:2, paddingLeft:30, paddingRight:26, paddingBottom:10}} onPress={() => {this.setState({slide: 1});this.refs.mixswiper._scrollToIndex(1, true)}}><Text style={{fontSize: isTablet() ? 18 : 14, color: this.state.slide === 1 ? '#fff': '#fcfcfc'}} allowFontScaling={false}>DJ</Text></TouchableHighlight>
                                            <TouchableHighlight underlayColor={'#1f1f1f'} style={{borderBottomColor: this.state.slide === 2 ? '#fbef00' : '#1f1f1f', borderBottomWidth:2, paddingLeft:18, paddingRight:28, paddingBottom:10}} onPress={() => {this.setState({slide: 2});this.refs.mixswiper._scrollToIndex(2, true)}}><Text style={{fontSize: isTablet() ? 18 : 14, color: this.state.slide === 2 ? '#fff': '#fcfcfc'}} allowFontScaling={false}>TRACKLIST</Text></TouchableHighlight>
                                            <TouchableHighlight underlayColor={'#1f1f1f'} style={{borderBottomColor: this.state.slide === 3 ? '#fbef00' : '#1f1f1f', borderBottomWidth:2, paddingLeft:18, paddingRight:18, paddingBottom:10}} onPress={() => {this.setState({slide: 3});this.refs.mixswiper._scrollToIndex(3, true)}}><Text style={{fontSize: isTablet() ? 18 : 14, color: this.state.slide === 3 ? '#fff': '#fcfcfc'}} allowFontScaling={false}>RELATED</Text></TouchableHighlight>
                                        </View>
                                    </View>
                                    {/*END Header Nav Bar*/}


                                {/*Flat List Swipe*/}

                                <SwiperFlatList
                                    ref="mixswiper"
                                    index={0}
                                    style={{height:'74%'}}
                                    containerStyle={{flex:1, alignItems: 'flex-start', justifyContent: 'flex-start'}}
                                    onMomentumScrollEnd={({index}) => {
                                        this.setState({'slide': index});
                                    }}
                                >
                                    <View style={[modalStyles.child, {  }]}>

                                        <View style={{marginTop:10, marginBottom: 10, alignItems: 'center'}}>
                                            <AsyncImage
                                                size={'preview'}
                                                source={{
                                                    uri: Config.MIX_COVER_BASE_URL + this.props.mixPreview.cover
                                                }}/>
                                        </View>

                                        <View style={{alignSelf: 'center', flexDirection: 'row', marginTop: 10}}>

                                            <Icon
                                                type='material'
                                                name= 'share'
                                                size={28}
                                                color='#fff'
                                                onPress={() => this._share()}
                                                containerStyle={{marginTop:20}}
                                                underlayColor={'#282828'}
                                            />

                                            <TouchableHighlight onPress={() => this._playPreviewedMix()} style={{marginLeft:30,marginRight:30}}>
                                                <Icon
                                                    type='material'
                                                    name= {this.props.isPlaying && this.props.mixPlaying && this.props.mixPlaying.motw === this.props.mixPreview.motw ? 'pause-circle-filled':'play-circle-filled'}
                                                    size={70}
                                                    color='#fff' />
                                            </TouchableHighlight>

                                            <MixFavorite mix={this.props.mixPreview} fav={null} />

                                        </View>

                                        <View style={{marginTop:20}}>
                                            <Text style={{color:'white'}}><Text style={{fontWeight: "bold"}}>File Under:</Text> {this.state.mixDetails.tags}</Text>
                                        </View>

                                        <View style={{marginTop:22}}>
                                            {
                                                this.props.mixPlaying && this.props.mixPlaying.motw === this.props.mixPreview.motw &&
                                                <View>
                                                    <MixProgressBar />
                                                </View>

                                            }
                                        </View>



                                    </View>
                                    <View style={[modalStyles.child, {  }]}>
                                        {
                                            this.state.djMixes && this.state.djMixes.length > 0 &&
                                            <View style={{height:90}}>
                                                <View style={{flex:1, flexDirection: 'row'}}>
                                                    <Avatar
                                                        size="large"
                                                        rounded
                                                        containerStyle={{marginRight: 10}}
                                                        source={{uri: this.state.djProfile.avatar_url}}
                                                        onPress={() => {this._profileExternal(this.state.djProfile.dj_user)}}
                                                    />
                                                    <TouchableHighlight underlayColor='#282828' onPress={() => {this._profileExternal(this.state.djProfile.dj_user)}}>
                                                        <View>
                                                            <Text numberOfLines={1} ellipsizeMode='tail' style={modalStyles.headerTitleDjName}>{this.state.djProfile.dj}</Text>
                                                            <Text numberOfLines={1} ellipsizeMode='tail' style={modalStyles.headerTitleDjUsername}>@{this.state.djProfile.dj_user}</Text>
                                                            <Text numberOfLines={1} ellipsizeMode='tail' style={modalStyles.headerTitleDjFrom}>{this.state.djProfile.city}</Text>
                                                        </View>
                                                    </TouchableHighlight>
                                                </View>
                                            </View>
                                        }
                                        {
                                            this.state.djMixes && this.state.djMixes.length === 0 &&
                                            <View style={{alignItems: 'center', marginTop:20}}>
                                                <Avatar
                                                    size="xlarge"
                                                    rounded
                                                    source={{uri: this.state.djProfile.avatar_url}}
                                                    onPress={() => {this._profileExternal(this.state.djProfile.dj_user)}}
                                                />
                                                <TouchableHighlight underlayColor='#282828' onPress={() => {this._profileExternal(this.state.djProfile.dj_user)}}>
                                                    <View>
                                                        <Text numberOfLines={1} ellipsizeMode='tail' style={[modalStyles.headerTitleDjName, {alignSelf: 'center'}]}>{this.state.djProfile.dj}</Text>
                                                        <Text numberOfLines={1} ellipsizeMode='tail' style={[modalStyles.headerTitleDjUsername, {alignSelf: 'center'}]}>@{this.state.djProfile.dj_user}</Text>
                                                        <Text numberOfLines={1} ellipsizeMode='tail' style={[modalStyles.headerTitleDjFrom, {alignSelf: 'center'}]}>{this.state.djProfile.city}</Text>
                                                    </View>
                                                </TouchableHighlight>
                                            </View>
                                        }
                                        {
                                            this.state.djMixes && this.state.djMixes.length > 0 &&
                                            <Text style={modalStyles.headerTitleDivider}>Other Mixes:</Text>
                                        }

                                        <View style={{flex:1, marginBottom: 0}}>
                                            <ScrollView
                                                style={{ marginBottom: 10}}
                                                contentContainerStyle={{ flexGrow: 1 }}>
                                            {
                                                this.state.djMixes.map((mix,index) => (
                                                    <TouchableHighlight key={index} onPress={() => {this._changeMixInModal(mix)}}>
                                                        <MixListRow mix={mix}/>
                                                    </TouchableHighlight>
                                                ))
                                            }
                                            </ScrollView>
                                        </View>
                                    </View>
                                    <View style={[modalStyles.child, { }]}>
                                        <View style={{flex:1, marginBottom: 0}}>
                                            <ScrollView
                                                style={{ marginBottom: 10}}
                                                contentContainerStyle={{ flexGrow: 1 }}
                                                refreshControl={
                                                    <RefreshControl
                                                        refreshing={this.state.refreshing}
                                                        onRefresh={this._onRefresh}
                                                    />
                                                }
                                            >
                                                <Text style={modalStyles.headerTitle}>Tracklist:</Text>

                                                {
                                                    this.state.tracklist.map((track,index) => (
                                                        <Text key={index} style={modalStyles.textTracklist}>{track.artist} - {track.track}</Text>
                                                    ))
                                                }
                                                {
                                                    this.state.tracklist.length === 0 &&
                                                    <Text style={modalStyles.comingSoon}>
                                                        Coming soon
                                                    </Text>
                                                }
                                            </ScrollView>
                                        </View>
                                    </View>
                                    <View style={[modalStyles.child, { }]}>
                                        <ScrollView style={{flex:1}}>
                                            {
                                                this.state.relatedMixes.map((result,index) => (
                                                    <TouchableHighlight key={index} onPress={(mix) => {this._changeMixInModal(result.mix)}}>
                                                        <MixListRow mix={result.mix}/>
                                                    </TouchableHighlight>
                                                ))
                                            }
                                        </ScrollView>
                                    </View>

                                </SwiperFlatList>

                                </View>

                            </View>


                        }

                    </View>

            </Modal>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isPlaying: state.isPlaying.playing,
        mixPlaying: state.mixPlaying.mix.mix,
        mixPreview: state.mixPreview.mix.mix,
        modal: state.mixModal,
    }
};

export default connect(mapStateToProps, { closeMixPreview })(MixPreview);


const modalStyles = StyleSheet.create({
    child: {
        width: width,
        backgroundColor: '#282828',
        paddingLeft: 20,
        paddingRight:20,
        paddingTop: 20,
        paddingBottom: 10,
        marginBottom: 2,
    },
    text: {
        fontSize: 14,
        color: '#fff',
    },
    modalHeaderMixDetails: {
        paddingTop:10,
        paddingBottom:10,
        backgroundColor: '#181818',
        borderBottomWidth:1, borderBottomColor:'#313131',
        borderTopWidth:1, borderTopColor:'#313131',
    },
    headerTitleDjName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
        marginBottom: 2
    },
    headerTitleDjUsername: {
        fontSize: 14,
        color: '#fbef00',
        fontWeight: 'bold',
        marginBottom: 4
    },
    headerTitleDjFrom: {
        fontSize: 12,
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 4
    },
    textTracklist: {
        color: '#fff',
        fontSize: 13,
        marginBottom: 2
    },
    headerTitleDivider: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        borderTopWidth: 1,
        borderTopColor:'#ccc'
    },
    comingSoon: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    headerMixTitle : {
        textAlign: 'center',
        color: '#F5FCFF',
        fontSize: isTablet()? 18:14,
        fontWeight: 'bold',
        marginTop: 0,
        marginBottom: 2
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20
    }
});