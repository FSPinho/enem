import React from 'react';
import {StyleSheet, TouchableWithoutFeedback, Animated, Easing, Dimensions, Image} from 'react-native';
import {withTheme} from '../theme';
import Box from "./Box";
import FireBase from "react-native-firebase";
import {Events} from "../constants/Analytics";
import Text from "./Text";
import withData from "../api/withData";

const Banner = FireBase.admob.Banner;

class Snow extends React.Component {
    render() {
        const {
            children,
            data,
        } = this.props

        const snows = []
        for (let i = 0; i < 10; i++)
            snows.push(i)

        return (
            <Box fit column>
                {children}

                {
                    !!data.generalSettings.adsEnabled && (
                        <Box paddingSmall primary centralize style={{borderRadius: 0, elevation: 8}}>
                            <Box fitAbsolute centralize>
                                <Text>Carregando...</Text>
                            </Box>
                            <TouchableWithoutFeedback
                                onPress={() => FireBase.analytics().logEvent(Events.GeneralBannerClicked)}>
                                <Banner
                                    size={"BANNER"}
                                    onAdFailedToLoad={() => FireBase.analytics().logEvent(Events.GeneralBannerError)}
                                    onAdLoaded={() => FireBase.analytics().logEvent(Events.GeneralBannerLoaded)}
                                    unitId={__DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-5594222713152935/7148359605'}
                                />
                            </TouchableWithoutFeedback>
                        </Box>
                    )
                }
            </Box>
        )
    }
}

const styles = theme => StyleSheet.create({})

export default withData(withTheme({}, Snow))