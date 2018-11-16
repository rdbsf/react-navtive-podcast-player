import React from "react";
import {
    Text,
    View,
    ScrollView,
    ActivityIndicator,
    TouchableHighlight,
    Dimensions,
    Animated,
    FlatList,
    Keyboard,
    Platform,
    Easing
} from 'react-native';
import { Icon, Avatar, SearchBar, ListItem } from 'react-native-elements'
import Config from 'react-native-config'
import AsyncImage from '../components/AsyncImage'

import styles from '../styles/styles'
import store from "../store/index";
import {mixPreview, openMixPreview} from "../actions";
import {connect} from "react-redux";
import {isIphoneX, isTablet} from "../helper/dimentions"


class ArchiveScreen extends React.Component {
    constructor(props) {
        super(props);
        this.scrollView = React.createRef();
        this.state = {
            filterHeight: new Animated.Value(0),
            loading: true,
            searchMode: false,
            isSearching: false,
            hasJustSearched: false,
            showFilters: false,
            filter: null,
            pagerMixCount: 0,
            searchText: '',
            mixPreview: [],
            modalVisible: false,
            list: [],
            mixes: [],
            mixesFiltered: [],
            filters: [],
        };

        const didFocusSubscription = this.props.navigation.addListener(
            'didFocus',
            payload => {
                // fixes issue if clicking before screen was completely loaded or not focused
                // if we wait until then the params will pass to next screen
                this.setState({loading: false});
            }
        );
    }

    static navigationOptions = ({navigation}) => {
        const {params} = navigation.state;
        return {
            headerTitle: navigation.state.params && navigation.state.params.headerTitle
        };
    };

    onNavigatorEvent(event) {
        if (event.id === 'bottomTabSelected') {
            console.log('Tab selected!');
        }
        if (event.id === 'bottomTabReselected') {
            console.log('Tab reselected!');
            this.refs.scrollView.scrollTo({x: 0, y: 0, animated: true});
        }
    }

    _isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
        const paddingToBottom = 40;
        return layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;
    };

    componentDidMount() {
        this.props.navigation.setParams({
            scrollToTop: this.callScrollToTop.bind(this)
        });

        this.fetchApis();
    };

    callScrollToTop() {
        this.refs.scrollView.scrollTo({x:0,y:0,animated:true});
    }

    fetchApis = () => {
        let mixesReversed = this.props.mixes.slice(0);
        let _this = this;
        this.setState({
            mixes: this.props.mixes,
            mixesFiltered: mixesReversed.reverse()
        }, function () {
            _this._loadMixes();
            _this.fetchFilters();
        });

    };

    fetchMixes = () =>{

        let url = Config.MIXES_JSON_URL;
        fetch(url).
        then(response => response.json()).then((mixes) => {
            this.setState({
                mixes: mixes,
                mixesFiltered: mixes
            });
            this._loadMixes();
        });
    };

    // fetch mixes and load the latest mix
    fetchFilters = () =>{
        let seconds = new Date().getTime();
        let url = 'https://dreamchimney.com/motw/filters.json?v=' + seconds;
        fetch(url, {
            headers: {
                'Cache-Control': 'no-cache'
            }
        }).
        then(response => response.json()).then((filters) => {
            this.setState({
                filters: filters
            });
        });
    };

    _openPreview = (mix) => {
        store.dispatch(mixPreview({type: "MIX_PREVIEW", mix: mix}));
        this.props.openMixPreview();
    };

    _filterMixes(genre)
    {

        this.setState({isSearching: true});
        Keyboard.dismiss();

        let blank = [];

        let mixesTmp = this.state.mixes.slice(0);

        let filteredList = [];

        if (genre !== '')
        {
            for (let i = 0; i < this.state.mixes.length; i++){
                if (this.state.mixes[i].motw === genre) {
                    filteredList.push(this.state.mixes[i]);
                }
                if (this.state.mixes[i].dj.toLowerCase().includes(genre.toLowerCase())){
                    filteredList.push(this.state.mixes[i]);
                }
                if (this.state.mixes[i].title.toLowerCase().includes(genre.toLowerCase())){
                    let index = filteredList.findIndex(x => x.motw === this.state.mixes[i].motw);
                    if (index === -1){
                        filteredList.push(this.state.mixes[i]);
                    }
                }
                if (this.state.mixes[i].tags.toLowerCase().includes(genre.toLowerCase())){
                    let index = filteredList.findIndex(x => x.motw === this.state.mixes[i].motw);
                    if (index === -1){
                        filteredList.push(this.state.mixes[i]);
                    }
                }
            }
        }
        else {
            filteredList = mixesTmp;
        }

        filteredList.reverse();

        this.setState({searchText: genre, filter: genre, mixesFiltered: filteredList, list: blank, pagerMixCount: 0});

        let _this = this;
        setTimeout(function(){
            _this._loadMixes();
            _this._toggleFilterTags();
            _this.setState({showFilters: false, isSearching: false});
        }, 500)

    }

    _loadMixes()
    {
        if (this.state.pagerMixCount >= this.state.mixesFiltered.length)
        {
            return false;
        }

        let mixesPerPage = Dimensions.get('window').height > 680 ? 20 : 10;

        if (this.state.mixesFiltered.length > mixesPerPage)
        {
            let firstMix = this.state.mixesFiltered.length - this.state.pagerMixCount;

            if (this.state.pagerMixCount > 0)
            {
                firstMix++
            }

            let lastMix = this.state.mixesFiltered.length - this.state.pagerMixCount - mixesPerPage;

            if (firstMix < 0)
            {
                firstMix = 0;
            }

            if (this.state.pagerMixCount !== 0) {
                firstMix--;
            }

            if (lastMix < 0)
            {
                lastMix = 0;
            }

            this.state.pagerMixCount = this.state.pagerMixCount + mixesPerPage;
            this.state.mixesFiltered.slice(lastMix, firstMix).reverse().map((mix,index) => this.setState(prevState => ({
                list: [...prevState.list, mix]
            })));

        }
        else {
            this.setState({'list': this.state.mixesFiltered});
        }

    }

    _filters()
    {
        let genres = [];
        this.state.filters.map((filter,index) => genres.push(
            <TouchableHighlight style={[styles.badge, {backgroundColor: 'orange', marginBottom: isTablet()? 22 : 12}]} key={index} onPress={() => {this._filterMixes(filter.name)}}>
                <Text style={{ fontSize: 16, color: '#fff'}} allowFontScaling={false}>{filter.name}</Text>
            </TouchableHighlight>
        ));
        return (
            <View>
                <View style={{alignSelf: 'stretch', marginTop: 14, marginLeft: 10}}>
                    <Text style={{color:'#fff', fontSize: 14}}>Popular Genres:</Text>
                </View>
                <View style={{flex:1, flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'center', marginTop: 14}}>
                    {genres}
                </View>
            </View>
        )
    }

    _toggleFilterTags()
    {

        let finalHeight = Platform.OS === 'android' ? 320 : 270;

        if (this.state.showFilters){
            this.setState({finalHeight: finalHeight});
            finalHeight = 0;
        }

        this.setState({showFilters: this.state.showFilters === false});

        let _this = this;
        Animated.timing(
            this.state.filterHeight,
            {
                toValue: finalHeight,
                duration: this.state.showFilters ? 200 : 360,
                easing: Easing.linear
            }
        );

    }

    _initSearch = () => {

        this.setState({searchMode: true});

        if (this.state.searchText === '')
        {
            this.setState({'list': []});
        }

    };


    _submitSearch = (event) => {
        this.setState({searchText: event.nativeEvent.text, hasJustSearched: true});
        this._filterMixes(event.nativeEvent.text);
    };


    _cancelSearch = () => {
        this.setState({searchMode: false, hasJustSearched: false});
        Keyboard.dismiss();
        this.setState({list: this.state.mixes, searchText: ''});
    };

    _renderSearchResults = ({ item }) => (
            <ListItem
                leftAvatar={<Avatar
                    size="large"
                    source={item.cover && {uri: Config.MIX_COVER_BASE_URL + item.cover}}
                />}
                title={'#' + item.motw + ' ' + item.title}
                subtitle={
                    <View>
                        <Text style={{color: '#fff'}}>by {item.dj}</Text>
                    </View>
                }
                titleStyle={{backgroundColor: '#000', color: '#fff'}}
                containerStyle={{backgroundColor: '#000'}}
                chevron={false}
                onPress={() => this._openPreview(item)}
            />
        );



    keyExtractor = (item, index) => index.toString();

    renderList()
    {
        if(this.state.loading) {
            return (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" />
                </View>
            )
        }
        else {

            return (

                <View>

                    <View style={{flexDirection: 'row'}}>
                        <View style={{
                            flex:1,
                            flexDirection: 'row'}}>
                            <SearchBar
                                platform="ios"
                                cancelButtonTitle="Cancel"
                                cancelButtonProps={{color: '#ccc', fontSize: 8}}
                                onFocus={() => {this._initSearch()}}
                                onClear={() => {this._cancelSearch()}}
                                onCancel={() => {this._cancelSearch()}}
                                containerStyle={{width: '100%', backgroundColor:'#000',marginTop:6, marginRight:10}}
                                clearIcon={{color: '#86939e'}}
                                searchIcon={{ type: 'font-awesome', name: 'search' }}
                                placeholder='Search'
                                onSubmitEditing={(event) => {this._submitSearch(event)}}
                                value={this.state.searchText}
                                inputStyle={{color: '#ccc'}}
                                inputContainerStyle={{ backgroundColor: '#1e1e1e'}}
                            />
                        </View>
                    </View>


                    {
                        this.state.list && this.state.list.length === 0 && this.state.searchText === '' &&
                        this._filters()
                    }

                    <ScrollView
                        ref="scrollView"
                        onScroll={({nativeEvent}) => {
                            if (this._isCloseToBottom(nativeEvent)) {
                                this._loadMixes()
                            }
                        }}
                        scrollEventThrottle={400}
                        style={{ marginBottom: 40, marginTop: 10}}
                        contentContainerStyle={{ flexGrow: 1 }}
                        >
                        {
                            !this.state.searchMode &&
                            <View style={{flex:1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', alignSelf: 'center', backgroundColor: '#000'}}>
                                {this.state.list.map((mix, index) => (
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
                                ))}
                            </View>
                        }
                        {
                            this.state.searchMode && this.state.list && this.state.list.length > 0 && !this.state.isSearching &&
                            <FlatList
                                keyExtractor={this.keyExtractor}
                                data={this.state.list}
                                renderItem={this._renderSearchResults}
                                containerStyle={{marginBottom: 20, borderTopWidth: 0}}
                            />
                        }
                        {
                            this.state.isSearching &&
                            <View style={{ marginTop: 100}}>
                                <View style={styles.viewCenter}>
                                    <View style={styles.loading}>
                                        <ActivityIndicator size="large" />
                                    </View>
                                </View>
                            </View>
                        }
                        {
                            this.state.list && this.state.list.length === 0 && this.state.searchText !== '' && this.state.isSearching === false && this.state.hasJustSearched && this.state.searchMode &&
                            <View style={{ marginTop: 100}}>
                                <View style={styles.viewCenter}>
                                    <View style={styles.viewCenter}>
                                        <Text style={styles.defaultTextHeader}>No mixes found</Text>
                                    </View>
                                    <View style={styles.viewCenter}>
                                        <Text style={styles.defaultText}>Please try your search again.</Text>
                                    </View>
                                </View>
                            </View>
                        }
                    </ScrollView>

                </View>
            )
        }
    }
    render() {
        return (
            <View style={{flex:1, backgroundColor: '#000'}}>
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

        mixes: state.mixes.mixes,
    }
};

export default connect(mapStateToProps, { openMixPreview })(ArchiveScreen);