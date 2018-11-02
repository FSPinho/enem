import React from 'react'
import {StyleSheet, Image} from 'react-native'
import {withTheme} from "../theme";
import withData from "../api/withData";
import Loading from "../components/Loading";
import Box from "../components/Box";
import Line from "../components/Line";
import FireBase from 'react-native-firebase'
import {Events} from "../constants/Analytics";
import Text from "../components/Text";
import Button from "../components/Button";
import {Routes} from "../navigation/RootNavigation";
import Spacer from "../components/Spacer";


class Home extends React.Component {

    componentDidMount() {
        console.log("Home:componentDidMount - Sending current screen to analytics...")
        FireBase.analytics().logEvent(Events.LetterSessionStart)
        FireBase.analytics().logEvent(Events.LetterOpenHome)

        // this.props.navigation.navigate(Routes.LetterFinder)
    }

    _doOpenLetterEditor = () => {
        this.props.navigation.navigate(Routes.LetterEditor)
    }

    _doOpenLetterFinder = () => {
        this.props.navigation.navigate(Routes.LetterFinder)
    }

    componentWillUnmount() {
        FireBase.analytics().logEvent(Events.LetterSessionEnd)
    }

    render() {
        const {data, theme} = this.props
        const {styles} = theme

        const isGnome = !!data.user.is_gnome
        const hasLetter = !!data.user.has_letter
        const hasAnswer = !!data.user.has_letter_answer

        const answer = data.user.letter_answer

        return (
            <Box secondary fit column>
                <Loading active={data.userLoading} size={56}>
                    <Box scroll>
                        <Box column fit padding>

                            <Box paper primary column>

                                <Box>
                                    <Image style={styles.cardMedia}
                                           source={require('../resources/images/banner-01.png')}/>
                                </Box>
                                <Box padding column>
                                    <Text
                                        weight={'700'}
                                        size={20}
                                        color={theme.palette.primary}>
                                        {
                                            hasAnswer ? 'Sua carta foi respondida!'
                                                : hasLetter ? 'Sua carta foi enviada!'
                                                : 'Escreva uma carta para o papai noel'
                                        }
                                    </Text>

                                    <Spacer/>

                                    {
                                        !!hasAnswer && (
                                            <Text weight={'900'} secondary>O Gnomo {answer.name} respondeu:</Text>
                                        )
                                    }
                                    <Text secondary>
                                        {
                                            hasAnswer ? answer.message
                                                : hasLetter ? 'Os Gnomos estão tirando uma soneca... Às vezes eles fazem isso! Logo as Renas irão acordá-los, e então começarão a responder as cartas ;)'
                                                : 'Sua carta será lida por Gnomos especializados de todo o mundo =)'
                                        }
                                    </Text>
                                </Box>
                                <Line/>
                                <Box paddingSmall justifyEnd>
                                    <Button flat primary
                                            onPress={this._doOpenLetterEditor}
                                            children={
                                                hasAnswer ? 'ESCREVER OUTRA CARTA'
                                                    : hasLetter ? 'EDITAR CARTA'
                                                    : 'ESCREVER CARTA'
                                            }/>
                                </Box>
                            </Box>

                            <Spacer vertical large/>

                            <Box paper primary column>

                                <Box>
                                    <Image style={styles.cardMedia}
                                           source={require('../resources/images/banner-02.png')}/>
                                </Box>
                                <Box padding column>
                                    <Text
                                        weight={'700'}
                                        size={20}
                                        color={theme.palette.primary}>
                                        {isGnome ? 'Ajudar a responder cartas' : 'Quero ser um Gnomo oficial do Papai Noel'}
                                    </Text>

                                    <Spacer/>

                                    <Text secondary>
                                        {isGnome ? 'Cumpra seu papel como Gnomo e ajude a responder cartas!'
                                            : 'Os Gnomos recebem muitas mensagens todo ano. Torne-se um deles e ajude a responder cartas =D'}
                                    </Text>
                                </Box>
                                <Line/>
                                <Box paddingSmall justifyEnd>
                                    <Button onPress={this._doOpenLetterFinder}
                                            flat primary
                                            children={isGnome ? 'RESPONDER CARTAS' : 'ME TORNAR UM GNOMO'}/>
                                </Box>

                            </Box>

                        </Box>
                    </Box>
                </Loading>
            </Box>
        )
    }
}

const styles = theme => StyleSheet.create({
    cardMedia: {
        height: 162,
        flex: 1,
        borderTopLeftRadius: theme.metrics.borderRadius,
        borderTopRightRadius: theme.metrics.borderRadius,
    }
})

export default withData(withTheme(styles, Home))
