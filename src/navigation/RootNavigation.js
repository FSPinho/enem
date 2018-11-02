import React, {Component} from 'react'
import {withTheme} from "../theme";
import {createStackNavigator, createSwitchNavigator} from "react-navigation";
import {Home, LetterEditor, LetterFinder, LetterResponder, Login} from "../screens";
import Header from "./Header";
import HeaderTitle from "./HeaderTitle";

export const Routes = {
    Login: 'LOGIN',
    Home: 'HOME',
    LetterEditor: 'LETTER_EDITOR',
    LetterFinder: 'LETTER_FINDER',
    LetterResponder: 'LETTER_RESPONDER',
}

class RootNavigation extends Component {
    constructor(props) {
        super(props)

        const stackOptions = {
            header: (props) => <Header {...props}/>
        }

        this.Nav = createSwitchNavigator({
            [Routes.Login]: {
                screen: Login,
            },
            [Routes.Home]: createStackNavigator({
                [Routes.Home]: {
                    screen: Home,
                    navigationOptions: {headerTitle: <HeaderTitle text={'Carta Para Papai Noel'}/>, ...stackOptions}
                },
                [Routes.LetterEditor]: {
                    screen: LetterEditor,
                    navigationOptions: {headerTitle: <HeaderTitle text={'Escrever Carta'}/>, ...stackOptions}
                },
                [Routes.LetterFinder]: {
                    screen: LetterFinder,
                    navigationOptions: {headerTitle: <HeaderTitle text={'Encontre Uma Carta'}/>, ...stackOptions}
                },
                [Routes.LetterResponder]: {
                    screen: LetterResponder,
                    navigationOptions: {headerTitle: <HeaderTitle text={'Responder A Uma Carta'}/>, ...stackOptions}
                }
            }, {navigationOptions: stackOptions})
        })
    }

    render() {
        return (<this.Nav/>)
    }
}

export default withTheme({}, RootNavigation)
