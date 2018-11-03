import React, {Component} from 'react'
import {withTheme} from "../theme";
import {createStackNavigator, createSwitchNavigator} from "react-navigation";
import {Home, Login} from "../screens";
import Header from "./Header";
import HeaderTitle from "./HeaderTitle";

export const Routes = {
    Login: 'LOGIN',
    Home: 'HOME',
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
                    navigationOptions: {headerTitle: <HeaderTitle text={'Gabarito Enem 2018'}/>, ...stackOptions}
                },
            }, {navigationOptions: stackOptions})
        })
    }

    render() {
        return (<this.Nav/>)
    }
}

export default withTheme({}, RootNavigation)
