import React from 'react';
import {Picker, StyleSheet} from 'react-native';
import {Palette, withTheme} from '../theme';
import PropTypes from "prop-types";
import Box from "./Box";
import Text from "./Text";
import Spacer from "./Spacer";
import {withData} from '../api'

class ListItem extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            letter: '--'
        }
    }

    componentWillMount() {
        const {data, answer} = this.props
        const {questionKey} = answer
        let _answerLetter = '--'

        Object.keys(data.proofAnswers).map(k => {
            const ans = data.proofAnswers[k]
            if (ans.questionKey === questionKey) {
                _answerLetter = ans.answerLetter
            }
        })

        this.setState({
            letter: _answerLetter
        })
    }

    render() {
        const {letter} = this.state
        const {theme, answer, color, data} = this.props
        const {styles} = theme
        const {correctLetter, counts, key, questionKey, questionDay} = answer

        const _correctLetter = (correctLetter && correctLetter[color]) ? correctLetter[color] : ''
        let _answer = {}
        let _answerLetter = '--'

        Object.keys(data.proofAnswers).map(k => {
            const ans = data.proofAnswers[k]
            if (ans.questionKey === questionKey) {
                _answer = ans
                _answerLetter = ans.answerLetter
            }
        })

        if (_answerLetter !== '--')
            console.log(_answer, _answerLetter)

        return (
            <Box paper primary style={styles.root} paddingSmall centralize>
                <Box color={_answerLetter === '--' ? theme.palette.primary : letter === _correctLetter ? Palette.Green : Palette.Red}
                     style={{borderRadius: 192, height: 42, width: 42}}
                     centralize>
                    <Text weight={'900'} size={18} color={theme.palette.primaryText}>{questionKey}</Text>
                </Box>
                <Spacer/>
                <Box fit>
                    <Box fit alignCenter>
                        <Text>Resposta:</Text>
                        <Spacer/>
                        <Text weight={'900'}
                              size={18}
                              color={_correctLetter ? theme.palette.primary : Palette.Orange}>
                            {_correctLetter ? _correctLetter : 'EM BREVE'}
                        </Text>
                    </Box>
                    <Spacer/>
                    {
                        !!_correctLetter &&
                        (
                            <Box alignCenter>
                                <Text>Sua resposta:</Text>
                                <Spacer/>
                                <Picker
                                    style={{width: 96, height: 36}}
                                    selectedValue={letter}
                                    onValueChange={value => {

                                        this.setState({
                                            letter: value
                                        }, () => {
                                            data.doSaveProofAnswer({
                                                ..._answer,
                                                answerLetter: value,
                                                questionKey,
                                                questionDay
                                            })
                                        })
                                    }}>
                                    <Picker.Item label={'--'} value={'--'}/>
                                    {['A', 'B', 'C', 'D', 'E'].map(c => (
                                        <Picker.Item key={c} label={'' + c} value={c}/>
                                    ))}
                                </Picker>
                            </Box>
                        )
                    }
                </Box>
            </Box>
        )
    }
}

ListItem.propTypes = {
    answer: PropTypes.any.isRequired,
    color: PropTypes.any.isRequired,
}

const styles = theme => StyleSheet.create({
    root: {
        marginLeft: theme.metrics.spacing,
        marginRight: theme.metrics.spacing,
        marginTop: theme.metrics.spacing / 2,
        marginBottom: theme.metrics.spacing / 2,
        overflow: 'hidden'
    }
})

export default withData(withTheme(styles, ListItem))
