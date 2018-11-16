/**
 * React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    Text,
    View,
} from 'react-native';
import { createSwitchNavigator, createDrawerNavigator, createStackNavigator, createMaterialTopTabNavigator, createTabNavigator, DrawerNavigator, DrawerItems } from 'react-navigation';

import { Icon, Avatar } from 'react-native-elements'
import styles from './styles/styles'

import MixScreen from './screens/MixScreen';
import ArchiveScreen from './screens/ArchiveScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import AuthLoadingScreen from './screens/AuthLoadingScreen';

import Playbar from './components/Playbar'
import MixPreview from './components/MixPreview'

import {Provider, connect} from 'react-redux'
import store from './store/index'

import {isTablet} from "./helper/dimentions"

import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Class RCTCxxModule']);

export const ArchiveStack = createMaterialTopTabNavigator({
    Mix: {
        screen: MixScreen,
        navigationOptions: ({navigation}) => ({

            headerStyle: {
                backgroundColor: '#db892a',
            },
            headerTintColor : '#393939',
            headerBackTitle: 'Back',
            headerRight: archiveButton(navigation),
            tabBarOnPress: ({ navigation, defaultHandler }) => {
                if (navigation.isFocused()) {
                    navigation.state.params.moveToLatestMix();
                } else {
                    defaultHandler();
                }
            },
        }),
    },
    Archive: {
        screen: ArchiveScreen,
        navigationOptions: ({navigation}) => ({
            headerStyle: {backgroundColor: '#db892a', color: '#fff'},
            headerTintColor: 'white', // arrow color
            headerBackTitleStyle: {color: '#fff'},
            gesturesEnabled: false,
            headerTitle: 'Archive',
            headerBackTitle: 'Back',
            tabBarOnPress: ({ navigation, defaultHandler }) => {
                if (navigation.isFocused()) {
                    navigation.state.params.scrollToTop();
                } else {
                    defaultHandler();
                }
            },
        }),
    },
    Favorites: {
        screen: FavoritesScreen,
        navigationOptions: ({navigation}) => ({
            headerStyle: {backgroundColor: '#db892a'},
            headerTintColor: 'white', // arrow color
            headerBackTitleStyle: {color: '#fff'},
            gesturesEnabled: false,
            headerTitle: 'Favorites',
            tabBarOnPress: ({ navigation, defaultHandler }) => {
                if (navigation.isFocused()) {
                    navigation.state.params.scrollToTop();
                } else {
                    defaultHandler();
                }
            },
        }),
    },
    }, {
    navigationOptions: ({ navigation }) => ({
        mode: 'modal',
        tabBarOptions : {
            labelStyle: {
                height: 32,
                paddingTop: isTablet() > 768 ? 10 : 0,
                marginTop: 0,
                fontSize: isTablet() ? 18 : 14
            },
            allowFontScaling: false,
            indicatorStyle: {
                backgroundColor: '#fbef00',
            },
            style: {
                height: isTablet() > 768 ? 60 : 42,
                paddingTop:4,
                backgroundColor: '#3c3c3c'
            }
        }
    })
});


const headerIcon = (navigation) =>
    <View style={{width: '100%'}}>
        <Avatar
            small
            rounded
            source={require('./images/DC-logo-header.png')}
            activeOpacity={1.0}
            overlayContainerStyle={{backgroundColor: '#db892a'}}
            containerStyle={{backgroundColor: '#db892a',marginTop:2, alignSelf: 'center'}}
        />
    </View>


const archiveButton = (navigation) =>
    <Text
        style={{padding: 5, color: '#fff', fontSize: 18, marginRight: 10}}
        onPress={() => {
            navigation.navigate('Archive');
        }
        }>Archive</Text>



const RootNavigator = createStackNavigator({

        Main: {
            //screen: Drawer,
            screen: ArchiveStack,
            navigationOptions: {
                gesturesEnabled: false,
            }
        },

    },
    {
        navigationOptions: ({navigation}) => ({
            gesturesEnabled: false,
            headerTitle: headerIcon(navigation),
            headerStyle: {
                height: 44,
                color: '#3c3c3c',
                backgroundColor: '#db892a',
                borderBottomColor: '#db892a',
                borderBottomWidth: 0
            },

        }),
        headerMode: 'float',
        mode: "modal"
    });


const mapStateToProps = (state) => {
    return {
        isPlaying: state.isPlaying.playing,
        mixPlaying: state.mixPlaying.mix.mix,
        mixPreview: state.mixPreview.mix.mix,
        modal: state.mixModal,
        favorites: state.userFavorites.favorites,
        mixes: state.mixes.mixes,
        loading: state.mixes.loading,
        error: state.mixes.error
    }
};


Root = connect(mapStateToProps, {})(RootNavigator);

FooterPlayer = connect(mapStateToProps)(Playbar);


class AppReady extends Component {
    static router = RootNavigator.router;

    render() {
        return (
            <View style={{flex:1}}>
                <RootNavigator navigation={this.props.navigation} />
                <MixPreview />
                <FooterPlayer/>
            </View>
        );
    }
}

const MixLoaderNavigator = createSwitchNavigator(
    {
        AuthLoading: AuthLoadingScreen,
        AppReady: AppReady,
    },
    {
        initialRouteName: 'AuthLoading',
    }
);

MixLoader = connect(mapStateToProps, {})(MixLoaderNavigator);

export default class App extends Component {

    render() {
        return (
            <Provider store={store}>
                <MixLoader />
            </Provider>
        );
    }
}
