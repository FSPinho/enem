import React from 'react'
import {StyleSheet, TextInput} from 'react-native'
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

class LetterEditor extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            name: '',
            age: '',
            message: '',
        }
    }

    componentDidMount() {
        console.log("Home:componentDidMount - Sending current screen to analytics...")
        FireBase.analytics().logEvent(Events.LetterOpenLetterEditor)

        this.setState({
            ...this.props.data.user.letter
        })
    }

    _doChangeField = (field, value) =>
        this.setState({[field]: value})

    _doSendLetter = async () => {
        const hasLetter = !!this.props.data.user.letter
        const age = this.state.age.replace(/[^\d]/g, '')
        const message_length = this.state.message.length

        if (hasLetter)
            FireBase.analytics().logEvent(Events.LetterLetterEdited, {age, message_length})
        else
            FireBase.analytics().logEvent(Events.LetterLetterCreated, {age, message_length})

        await this.props.data.doSetUserLetter({
            letter: {
                ...this.state,
                timestamp: +new Date(),
                timestampReverse: -+new Date(),
            }
        })
        this.props.navigation.goBack()
    }

    render() {
        const {data, theme} = this.props
        const {styles} = theme

        const {name, age, message} = this.state

        return (
            <Box secondary fit column>
                <Loading active={data.userLoading} size={56}>
                    <Box scroll>
                        <Box column fit padding>

                            <Box paper primary column>

                                <Box padding column>
                                    <TextInput
                                        textContentType={'name'}
                                        style={styles.input}
                                        selectionColor={theme.palette.primary}
                                        placeholder={'Seu nome'}
                                        placeholderTextColor={theme.palette.backgroundPrimaryTextSecondary}
                                        maxLength={512}
                                        value={name}
                                        onChangeText={value => this._doChangeField('name', value)}
                                    />
                                    <Spacer vertical large/>
                                    <TextInput
                                        textContentType={'telephoneNumber'}
                                        style={styles.input}
                                        selectionColor={theme.palette.primary}
                                        placeholder={'Sua idade'}
                                        placeholderTextColor={theme.palette.backgroundPrimaryTextSecondary}
                                        maxLength={32}
                                        value={age}
                                        onChangeText={value => this._doChangeField('age', value)}
                                    />
                                    <Spacer vertical large/>
                                    <TextInput
                                        style={styles.input}
                                        selectionColor={theme.palette.primary}
                                        placeholder={'Sua mensagem para o Papai Noel'}
                                        placeholderTextColor={theme.palette.backgroundPrimaryTextSecondary}
                                        multiline={true}
                                        numberOfLines={4}
                                        maxLength={1024 * 1024}
                                        value={message}
                                        onChangeText={value => this._doChangeField('message', value)}
                                    />
                                </Box>
                                <Line/>
                                <Box padding>
                                    <Text secondary>
                                        Fique esperto! Os Gnomos do Papai Noel podem responder sua carta a qualqer
                                        momento =)
                                    </Text>
                                </Box>
                                <Line/>
                                <Box paddingSmall justifyEnd>
                                    <Button disabled={!name || !age || !message}
                                            onPress={this._doSendLetter}
                                            flat primary={!!name && !!age && !!message} children={'ENVIAR CARTA'}/>
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
