import React from 'react'
import {FlatList, StyleSheet, RefreshControl} from 'react-native'
import {withTheme} from "../theme";
import withData from "../api/withData";
import ListItem, {ITEM_HEIGHT} from "../components/ListItem";
import Loading from "../components/Loading";
import Box from "../components/Box";
import Text from "../components/Text";
import Spacer from "../components/Spacer";
import LineIcon from 'react-native-vector-icons/SimpleLineIcons'
import {Routes} from "../navigation/RootNavigation";

class Home extends React.Component {

    componentDidMount() {
        if(this.props.data.subjects.length) {
            this.props.navigation.navigate(Routes.Proof, {
                subject: this.props.data.subjects[0],
                topic: this.props.data.subjects[0].o[0],
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.data.subjects.length) {
            this.props.navigation.navigate(Routes.Proof, {
                subject: nextProps.data.subjects[0],
                topic: nextProps.data.subjects[0].o[0],
            })
        }
    }

    shouldComponentUpdate(nextProps) {
        return this.props.data.subjectsLoading !== nextProps.data.subjectsLoading
    }

    doOpenSubject = (subject) => {
        this.props.navigation.navigate(Routes.Topics, {subject})
    }

    render() {
        const {data, theme} = this.props
        const {styles} = theme

        return (
            <Box secondary fit>
                <Loading active={data.subjectsLoading && !data.dirty} size={56}>
                    <FlatList
                        ListHeaderComponent={<Spacer small vertical/>}
                        ListFooterComponent={<Spacer small vertical/>}
                        refreshing={data.subjectsLoading && data.dirty}
                        onRefresh={data.doUpdate}
                        style={styles.list}
                        data={data.subjects}
                        renderItem={
                            ({item, index}) =>
                                <ListItem index={index}
                                          title={item.t}
                                          subtitle={`${item.c} questões`}
                                          favorite={index % 7 === 0}
                                          onPress={() => this.doOpenSubject(item)}/>
                        }
                        ListEmptyComponent={
                            !data.subjectsLoading &&
                            <Box fit centralize column>
                                <Spacer vertical large/>
                                <Spacer vertical large/>
                                <Spacer vertical large/>
                                <LineIcon name={'graduation'} color={theme.palette.backgroundPrimaryTextSecondary}
                                          size={96}/>
                                <Spacer vertical large/>
                                <Text secondary>Nenhuma matéria para estudar =(</Text>
                            </Box>
                        }
                    />
                </Loading>
            </Box>
        )
    }
}

const styles = StyleSheet.create({
    list: {
        flex: 1
    }
})

export default withData(withTheme(styles, Home))
