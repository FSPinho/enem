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
import {hasDirtyWords} from "../services/DirtyWordDetector";
import {Palette} from '../theme'

class LetterResponder extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            name: '',
            message: '',
            hasDirtyWords: false
        }
    }

    componentDidMount() {
        FireBase.analytics().logEvent(Events.LetterOpenLetterResponder)
    }

    _doChangeField = (field, value) => {
        const _hasDirtyWords = hasDirtyWords(value)
        this.setState({[field]: value, hasDirtyWords: _hasDirtyWords})
    }

    _doSendLetter = async () => {
        const message_length = this.state.message.length
        const user = this.props.navigation.getParam('user')
        const answer_gap = +new Date() - user.timestamp

        FireBase.analytics().logEvent(Events.LetterLetterAnswered, {message_length, answer_gap})

        await this.props.data.doSetUserLetterAnswer({
            user,
            letterAnswer: {
                ...this.state,
                timestamp: +new Date(),
                timestampReverse: -+new Date(),
            }
        })
        const doUpdateLetter = this.props.navigation.getParam('doUpdateLetter')
        if (doUpdateLetter)
            doUpdateLetter()
        this.props.navigation.goBack()
    }

    render() {
        const {data, theme} = this.props
        const {styles} = theme

        const {name, message, hasDirtyWords} = this.state

        const user = this.props.navigation.getParam('user')

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
                                        style={styles.input}
                                        selectionColor={theme.palette.primary}
                                        placeholder={'Sua mensagem para ' + user.letter.name}
                                        placeholderTextColor={theme.palette.backgroundPrimaryTextSecondary}
                                        multiline={true}
                                        numberOfLines={4}
                                        maxLength={1024 * 1024}
                                        value={message}
                                        onChangeText={value => this._doChangeField('message', value)}
                                    />
                                    <Spacer vertical large/>
                                    {
                                        !!hasDirtyWords.length &&
                                        <Text color={Palette.Red500}>
                                            Por favor, não inclua palavrões no seu texto: "{hasDirtyWords[0]}"
                                        </Text>
                                    }
                                </Box>
                                <Line/>
                                <Box padding>
                                    <Text secondary>
                                        {user.letter.name} ficará muito feliz com sua resposta. Você está se saindo
                                        muito bem como Gnomo!
                                    </Text>
                                </Box>
                                <Line/>
                                <Box paddingSmall justifyEnd>
                                    <Button disabled={!name || !message || !!hasDirtyWords.length}
                                            onPress={this._doSendLetter}
                                            flat primary={!!name && !!message && !hasDirtyWords.length} children={'ENVIAR RESPOSTA'}/>
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

export default withData(withTheme(styles, LetterResponder))
