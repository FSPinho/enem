import React, {Component} from 'react'
import FireBase from 'react-native-firebase'
import {Alert} from '../services'
import NameUtils from "../services/NameUtils"

const {Provider, Consumer} = React.createContext({
    data: undefined
});

export {Consumer}

class DataProvider extends Component {
    constructor(props) {
        super(props)

        this.state = {

            /** True if loaded at least once */
            dirty: false,

            user: {
                key: undefined,
                name: undefined,
                firstName: undefined,
                lastName: undefined,
                email: undefined,
                photo: undefined,
                is_gnome: false,
                has_letter: false,
                has_letter_answer: false,
                letter: undefined,
                letter_answer: undefined
            },
            userLoading: false,

            findLetterLoading: false,

            doSetUser: this.doSetUser,
            doSetUserLetter: this.doSetUserLetter,
            doSetUserLetterAnswer: this.doSetUserLetterAnswer,
            doTransformUserInGnome: this.doTransformUserInGnome,
            doFindLetter: this.doFindLetter
        }
    }

    async componentDidMount() {
        /**
         * ...
         * */
    }

    asyncSetState = async state =>
        await new Promise(a => this.setState({...this.state, ...state, dirty: true}, a))

    doOrAlert = async (toDo, errorMessage) => {
        try {
            await toDo()
        } catch (e) {
            !!errorMessage && Alert.showLongText(errorMessage)
            console.warn('DataProvider:doOrAlert - Can\'t do task:', e)
        }
    }

    doSetUser = async ({user}) => {
        await this.asyncSetState({userLoading: true})

        await this.doOrAlert(
            async () => {
                const _user = {
                    key: user.uid,
                    name: NameUtils.getName(user),
                    firstName: NameUtils.getFirstName(user),
                    lastName: NameUtils.getLastName(user),
                    email: user.email,
                    photo: user.photoURL,
                }

                console.log("DataProvider:doSetUser - Sending current user details to analytics...")
                FireBase.analytics().setUserId(_user.key)
                FireBase.analytics().setUserProperties({
                    le_name: _user.name,
                    le_email: _user.email,
                    le_photo: _user.photo,
                })

                const userRef = FireBase.firestore().collection('users').doc(user.uid)
                const snapshot = await userRef.get()

                if (!snapshot.exists) {
                    await userRef.set({
                        ..._user,
                        is_gnome: false,
                        has_letter: false,
                        has_letter_answer: false,
                        letter: undefined,
                        letter_answer: undefined,
                        creationTimestamp: +new Date(),
                        creationTimestampReverse: -+new Date(),
                        lastAccessTimestamp: +new Date(),
                        lastAccessTimestampReverse: -+new Date(),
                    })
                } else {
                    await userRef.update({
                        ..._user,
                        lastAccessTimestamp: +new Date(),
                        lastAccessTimestampReverse: -+new Date(),
                    })
                }

                const __user = await userRef.get()
                await this.asyncSetState({user: __user.data()})

                userRef.onSnapshot(async doc => {
                    console.log("DataProvider:doSetUser - Updating user automatically...")
                    await this.asyncSetState({user: doc.data()})
                })
            },
            'Oops, verifique sua conexão!'
        )

        await this.asyncSetState({userLoading: false})
    }

    doSetUserLetter = async ({letter}) => {
        await this.asyncSetState({userLoading: true})

        await this.doOrAlert(
            async () => {
                const _user = {
                    ...this.state.user,
                    has_letter: true,
                    timestamp: +new Date(),
                    letter: {
                        ...this.state.user.letter,
                        ...letter
                    }
                }

                console.log("DataProvider:doSetUserLetter - Sending user's letter to firebase...")

                const userRef = FireBase.firestore().collection('users').doc(_user.key)
                await userRef.update(_user)
                await this.asyncSetState({user: _user})

                Alert.showLongText("Carta enviada!")
            },
            'Oops, será que você está sem internet?'
        )

        await this.asyncSetState({userLoading: false})
    }

    doSetUserLetterAnswer = async ({letterAnswer, user}) => {
        await this.asyncSetState({userLoading: true})

        await this.doOrAlert(
            async () => {
                const _user = {
                    letter_answer: {
                        ...letterAnswer
                    },
                    has_letter_answer: true,
                }

                console.log("DataProvider:doSetUserLetterAnswer - Sending user's letter answer to firebase...")

                const userRef = FireBase.firestore().collection('users').doc(user.key)
                await userRef.update(_user)
                Alert.showLongText("Resposta enviada!")
            },
            'Oops, será que você está sem internet?'
        )

        await this.asyncSetState({userLoading: false})
    }

    doTransformUserInGnome = async () => {
        await this.asyncSetState({userLoading: true})

        if (!this.state.user.is_gnome)
            await this.doOrAlert(
                async () => {
                    const _user = {
                        ...this.state.user,
                        is_gnome: true,
                    }

                    console.log("DataProvider:doTransformUserInGnome - Transforming user in a gnome...")

                    const userRef = FireBase.firestore().collection('users').doc(_user.key)
                    await userRef.update(_user)
                    await this.asyncSetState({user: _user})
                    FireBase.analytics().setUserProperty('le_is_gnome', '1')
                    Alert.showLongText("Agora você é um gnomo!")
                },
                'Oops, será que você está sem internet?'
            )

        await this.asyncSetState({userLoading: false})
    }

    doFindLetter = async (offset = 0) => {
        await this.asyncSetState({findLetterLoading: true})
        let user = null

        await this.doOrAlert(
            async () => {
                console.log("DataProvider:doFindLetter - Searching letter...")

                const userRef = FireBase.firestore().collection('users')
                    .orderBy('timestamp')
                    .startAfter(offset)
                    .where('has_letter', '==', true)
                    .where('has_letter_answer', '==', false)
                    .limit(2)
                const snapshot = await userRef.get()
                snapshot.forEach((ss) => {
                    if (user === null && ss.id !== this.state.user.key)
                        user = {...ss.data(), key: ss.id}
                })

                console.log("DataProvider:doFindLetter - letter found:", user)

            },
            'Oops, será que você está sem internet?'
        )

        await this.asyncSetState({findLetterLoading: false})
        return user
    }

    render() {
        return (
            <Provider
                value={{
                    data: this.state
                }}>
                {this.props.children}
            </Provider>
        )
    }
}


export default DataProvider
