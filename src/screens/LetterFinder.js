import React from 'react'
import {StyleSheet} from 'react-native'
import {withTheme} from "../theme";
import withData from "../api/withData";
import Loading from "../components/Loading";
import Box from "../components/Box";
import Line from "../components/Line";
import FireBase from 'react-native-firebase'
import {Events} from "../constants/Analytics";
import Text from "../components/Text";
import Button from "../components/Button";
import Spacer from "../components/Spacer";
import {Routes} from "../navigation/RootNavigation";

class LetterEditor extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            user: undefined,
            offset: 0
        }
    }

    async componentDidMount() {
        FireBase.analytics().logEvent(Events.LetterOpenLetterFinder)

        if(!this.props.data.user.is_gnome)
            FireBase.analytics().logEvent(Events.LetterUserTurnedGnome)

        await this.props.data.doTransformUserInGnome()

        await this._doFindLetter()
    }

    _doFindLetter = async () => {
        FireBase.analytics().logEvent(Events.LetterDoFindLetter)
        const user = await this.props.data.doFindLetter(this.state.offset)

        if (user) {
            FireBase.analytics().logEvent(Events.LetterNoLetterFound)
            this.setState({user, offset: user.letter.timestamp})
        } else if (!this.state.offset === 0) {
            this.setState({user, offset: 0}, this._doFindLetter)
        } else {
            this.setState({user: null, offset: 0})
        }
    }

    _doOpenLetterResponder = async () => {
        this.props.navigation.navigate(Routes.LetterResponder, {
            user: this.state.user,
            doUpdateLetter: this._doFindLetter
        })
    }

    render() {
        const {data} = this.props

        const {user} = this.state

        return (
            <Box secondary fit column>
                <Loading active={data.findLetterLoading} size={56}>
                    <Box scroll>
                        <Box column fit padding>

                            {
                                !!user ? (
                                    <Box paper primary column>

                                        <Box padding column>
                                            <Text>{user.letter.name}</Text>
                                            <Spacer vertical large/>
                                            <Text>{user.letter.age}</Text>
                                            <Spacer vertical large/>
                                            <Text>{user.letter.message}</Text>
                                        </Box>
                                        <Line/>
                                        <Box padding>
                                            <Text secondary>
                                                {user.letter.name} está ansioso por uma resposta!
                                            </Text>
                                        </Box>
                                        <Line/>
                                        <Box paddingSmall justifyEnd wrap>
                                            <Button onPress={this._doOpenLetterResponder}
                                                    children={'RESPONDER CARTA'}
                                                    flat primary/>
                                            <Button onPress={this._doFindLetter}
                                                    children={'ENCONTRAR OUTRA CARTA'}
                                                    flat primary/>
                                        </Box>

                                    </Box>
                                ) : (
                                    <Box paper primary column padding>
                                        <Text>Todas as cartas já foram respondidas. Mas fique esperto, novas cartas
                                            estão a caminho =)</Text>
                                    </Box>
                                )
                            }

                        </Box>
                    </Box>
                </Loading>
            </Box>
        )
    }
}

const styles = theme => StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: theme.palette.backgroundPrimaryTextDisabled,
        borderRadius: theme.metrics.borderRadius,
        padding: 8,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        color: theme.palette.backgroundPrimaryText
    }
})

export default withData(withTheme(styles, LetterEditor))
