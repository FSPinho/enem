import React from 'react'
import {FlatList, StyleSheet, Picker} from 'react-native'
import {withTheme, Palette} from "../theme";
import withData from "../api/withData";
import {Box, Loading, AnswerItem} from "../components";
import FireBase from 'react-native-firebase'
import {Events} from "../constants/Analytics";
import {mapToArray} from "../services/ArrayUtils";
import Spacer from "../components/Spacer";
import Text from "../components/Text";


class Home extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            firstColor: 'AMARELO',
            secondColor: 'AMARELO',
        }
    }

    componentDidMount() {
        console.log("Home:componentDidMount - Sending current screen to analytics...")
        FireBase.analytics().logEvent(Events.SessionStart)
        FireBase.analytics().logEvent(Events.OpenHome)
    }

    componentWillUnmount() {
        FireBase.analytics().logEvent(Events.SessionEnd)
    }

    render() {
        const {firstColor, secondColor} = this.state
        const {data, theme} = this.props
        const {generalProofAnswers} = data
        const listData = mapToArray(generalProofAnswers)
            .filter(q => q.questionDay === 1 ? firstColor : secondColor)
            .sort((a, b) => a.questionKey - b.questionKey)
        const {colors} = data.generalProof

        let accepted = 0
        let rejected = 0

        listData.map(q => {
            const {correctLetter, questionKey} = q
            const color = q.questionDay === 1 ? firstColor : secondColor
            const _correctLetter = (correctLetter && correctLetter[color]) ? correctLetter[color] : ''
            let _answer = undefined
            let _answerLetter = '--'
            Object.keys(data.proofAnswers).map(k => {
                const ans = data.proofAnswers[k]
                if (ans.questionKey === questionKey) {
                    _answer = ans
                    _answerLetter = ans.answerLetter
                }
            })
            if (_answer && _answerLetter !== '--') {
                if (_answerLetter === _correctLetter)
                    accepted++
                else
                    rejected++
            }
        })


        console.log("Home:render - Rendering...")

        return (
            <Box secondary fit column>
                <Box padding primary centralize style={{elevation: 2}}>
                    <Loading active={data.proofAnswersLoading} size={16}>
                        <Box fit centralize>
                            <Box fit centralize>
                                <Text>Acertos:</Text>
                                <Spacer/>
                                <Text weight={'900'} size={18} color={theme.palette.primary}>
                                    {accepted} ({(accepted/180 * 100).toFixed(2)}%)
                                </Text>
                            </Box>
                            <Spacer/>
                            <Box fit centralize>
                                <Text>Erros:</Text>
                                <Spacer/>
                                <Text weight={'900'} size={18} color={Palette.Red}>
                                    {rejected} ({(rejected/180 * 100).toFixed(2)}%)
                                </Text>
                            </Box>
                        </Box>
                    </Loading>
                </Box>
                <Loading active={data.profileLoading} size={56}>
                    <FlatList
                        ListHeaderComponent={
                            <Box paddingSmall fit column>
                                <Box paddingSmall paper primary fit>
                                    <Picker
                                        selectedValue={firstColor}
                                        style={{flex: 1}}
                                        onValueChange={value => this.setState({firstColor: value})}>
                                        <Picker.Item label={'Cor da 1ª prova'} value={''}/>
                                        {colors.map(c => (<Picker.Item key={c} label={c} value={c}/>))}
                                    </Picker>
                                    <Spacer/>
                                    <Picker
                                        selectedValue={secondColor}
                                        style={{flex: 1}}
                                        onValueChange={value => this.setState({secondColor: value})}>
                                        <Picker.Item label={'Cor da 2ª prova'} value={''}/>
                                        {colors.map(c => (<Picker.Item key={c} label={c} value={c}/>))}
                                    </Picker>
                                </Box>
                            </Box>
                        }
                        ListFooterComponent={<Spacer vertical/>}
                        ListEmptyComponent={
                            <Box padding centralize>
                                <Text center secondary>Este gabarito não é oficial! As questões foram respondidas
                                    pelos nossos professores após a prova.</Text>
                            </Box>
                        }
                        data={listData}
                        renderItem={({item}) => <AnswerItem color={item.questionDay === 1 ? firstColor : secondColor}
                                                            answer={item}/>}
                    />
                </Loading>
            </Box>
        )
    }
}

const styles = theme => StyleSheet.create({})

export default withData(withTheme(styles, Home))
