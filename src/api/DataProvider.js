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

            /**
             * Personal Info
             * */
            profile: {
                key: undefined,
                name: undefined,
                firstName: undefined,
                lastName: undefined,
                email: undefined,
                photo: undefined

            },
            profileLoading: false,
            profileVersion: 0,

            /**
             * Proof info
             * */
            proof: {
                /** Should be the same user key */
                key: undefined,

                /** First day */
                firstColor: undefined,

                /** Second day */
                secondColor: undefined,
            },
            proofLoading: false,
            proofVersion: 0,

            /**
             * Proof answers
             */
            proofAnswers: {
                // key: {
                //     key
                //     questionKey
                //     questionDay
                //     userKey
                //     answerLetter
                // }
            },
            proofAnswersLoading: false,
            proofAnswersVersion: 0,

            /**
             * General proof info
             * */
            generalProof: {
                /** Overall users status */
                /** Unused */
                userCount: 0,
                acceptedCount: 0,
                colors: []
            },
            generalProofLoading: false,
            generalProofVersion: 0,

            /**
             * General proof answers
             */
            generalProofAnswers: {
                // key: {
                //     key
                //     questionKey
                //     questionDay
                //     correctLetter
                //     counts: { a: x, b: y }
                // }
            },
            generalProofAnswersLoading: false,
            generalProofAnswersVersion: 0,

            generalSettings: {
                adsEnabled: false,
            },
            generalSettingsLoading: false,
            generalSettingsVersion: 0,

            doGetProfile: this._doGetProfile,
            doGetProof: this._doGetProof,
            doUpdateProof: this._doUpdateProof,
            doGetProofAnswers: this._doGetProofAnswers,
            doSaveProofAnswer: this._doSaveProofAnswer,
            doGetGeneralProof: this._doGetGeneralProof,
            doGetGeneralProofAnswers: this._doGetGeneralProofAnswers,
            doGetGeneralSettings: this._doGetGeneralSettings,
        }

        this.unsubscribers = {}
    }

    _removeFireStoreListeners = () => {
        Object.keys(this.unsubscribers).map(k => this.unsubscribers[k]())
        this.unsubscribers = {}
    }

    async componentDidMount() {

        // for(let i = 0; i < 180; i++) {
        //     const docRef = await FireBase.firestore().collection('generalProofAnswers').add()
        //     await docRef.set({
        //         key: docRef.id,
        //         questionKey: (i + 1),
        //         questionDay: (i + 1) < 90 ? 1 : 2,
        //         correctLetter: {},
        //         counts: {}
        //     })
        // }

        /** Auto update user settings */
        const generalSettingsRef = FireBase.firestore().collection('generalSettings')
        this.unsubscribers.generalSettingsUnsubscriber = generalSettingsRef.onSnapshot(this._doGetGeneralSettings)

        /** Auto update general data */
        const generalProofRef = FireBase.firestore().collection('generalProofs')
        this.unsubscribers.generalProofUnsubscriber = generalProofRef.onSnapshot(this._doGetGeneralProof)
        const generalProofAnswersRef = FireBase.firestore().collection('generalProofAnswers')
        this.unsubscribers.generalProofAnswersUnsubscriber = generalProofAnswersRef.onSnapshot(this._doGetGeneralProofAnswers)

    }

    componentWillUnmount() {
        this._removeFireStoreListeners()
    }

    asyncSetState = async state =>
        await new Promise(a => this.setState({...this.state, ...state, dirty: true}, a))

    _doGetProfile = async ({user}) => {
        let success = true
        await this.asyncSetState({profileLoading: true})

        try {
            const profile = {
                key: user.uid,
                name: NameUtils.getName(user),
                firstName: NameUtils.getFirstName(user),
                lastName: NameUtils.getLastName(user),
                email: user.email,
                photo: user.photoURL,
            }

            FireBase.analytics().setUserId(profile.key)
            FireBase.analytics().setUserProperties({
                en_name: profile.name,
                en_email: profile.email,
                en_photo: profile.photo,
            })

            const profileRef = FireBase.firestore().collection('profiles').doc(profile.key)
            const snapshot = await profileRef.get()
            if (snapshot.exists)
                await profileRef.update(profile)
            else
                await profileRef.set(profile)

            await this.asyncSetState({profile})
        } catch (e) {
            console.warn("DataProvider:_doGetProfile - Error", e)
            Alert.showLongText("Oops! Você está sem internet?")
            success = false
        }

        /**
         * Exec once after user loads
         * */
        await this._doGetProof()
        await this._doGetProofAnswers()

        await this.asyncSetState({
            profileLoading: false,
            profileVersion: this.state.profileVersion + 1
        })

        return success
    }

    _doGetProof = async () => {
        let success = true
        await this.asyncSetState({proofLoading: true})

        try {
            const proofRef = FireBase.firestore().collection('proofs').doc(this.state.profile.key)
            const snapshot = await proofRef.get()
            const proof = snapshot.data() || this.state.proof
            await this.asyncSetState({proof})
        } catch (e) {
            console.warn("DataProvider:_doGetProof - Error", e)
            Alert.showLongText("Oops! Você está sem internet?")
            success = false
        }

        await this.asyncSetState({
            proofLoading: false,
            proofVersion: this.state.proofVersion + 1
        })

        return success
    }

    _doUpdateProof = async (proof) => {
        let success = true
        await this.asyncSetState({proofLoading: true})

        try {
            const proofRef = FireBase.firestore().collection('proofs').doc(this.state.profile.key)
            await proofRef.update(proof)
            await this.asyncSetState({proof: {...this.state.proof, ...proof}})
        } catch (e) {
            console.warn("DataProvider:_doUpdateProof - Error", e)
            Alert.showLongText("Oops! Você está sem internet?")
            success = false
        }

        await this.asyncSetState({
            proofLoading: false,
            proofVersion: this.state.proofVersion + 1
        })

        return success
    }

    _doGetProofAnswers = async () => {
        let success = true
        await this.asyncSetState({proofAnswersLoading: true})

        try {
            const proofAnswers = {}
            const proofAnswersRef = FireBase.firestore().collection('proofAnswers').where('userKey', '==', this.state.profile.key)
            const snapshots = await proofAnswersRef.get()
            snapshots.forEach(snapshot => {
                proofAnswers[snapshot.id] = {...snapshot.data(), key: snapshot.id}
            })
            await this.asyncSetState({proofAnswers})
        } catch (e) {
            console.warn("DataProvider:_doGetProofAnswers - Error", e)
            Alert.showLongText("Oops! Você está sem internet?")
            success = false
        }

        await this.asyncSetState({
            proofAnswersLoading: false,
            proofAnswersVersion: this.state.proofAnswersVersion + 1
        })

        return success
    }

    _doSaveProofAnswer = async (proofAnswer) => {
        let success = true
        await this.asyncSetState({proofAnswersLoading: true})

        try {
            if (proofAnswer.key) {
                const proofAnswersRef = FireBase.firestore().collection('proofAnswers').doc(proofAnswer.key)
                await proofAnswersRef.update(proofAnswer)
                await this.asyncSetState({proofAnswers: {...this.state.proofAnswers, [proofAnswer.key]: proofAnswer}})
            } else {
                const proofAnswersRef = FireBase.firestore().collection('proofAnswers')
                const documentRef = await proofAnswersRef.add()
                const _proofAnswer = {
                    key: documentRef.id,
                    userKey: this.state.profile.key,
                    ...proofAnswer,
                }
                await documentRef.update(_proofAnswer)
                await this.asyncSetState({proofAnswers: {...this.state.proofAnswers, [_proofAnswer.key]: _proofAnswer}})
            }

            // const generalProofAnswersRef = FireBase.firestore()
            //     .collection('generalProofAnswers').where('questionKey', '==', proofAnswer.questionKey)
            // const generalProofAnswersSnapshots = await generalProofAnswersRef.get()
            // const color = proofAnswer.questionDay === 1 ? this.state.proof.firstColor : this.state.proof.secondColor
            // generalProofAnswersSnapshots.forEach(async snapshot => {
            //     await snapshot.ref.update({
            //         counts: {
            //             ...snapshot.data().counts,
            //             [this.state.proofAnswers[proofAnswer.key].answerLetter + '_' + color]: (snapshot.data()[this.state.proofAnswers[proofAnswer.key].answerLetter + '_' + color] || 0) - (proofAnswer.key ? 1 : 0),
            //             [proofAnswer.answerLetter + '_' + color]: (snapshot.data()[proofAnswer.answerLetter + '_' + color] || 0) + 1
            //         }
            //     })
            // })

        } catch (e) {
            console.warn("DataProvider:_doSaveProofAnswer - Error", e)
            Alert.showLongText("Oops! Você está sem internet?")
            success = false
        }

        await this.asyncSetState({
            proofAnswersLoading: false,
            proofAnswersVersion: this.state.proofAnswersVersion + 1
        })

        return success
    }

    _doGetGeneralProof = async () => {
        let success = true
        await this.asyncSetState({generalProofLoading: true})

        try {
            let generalProof = {}
            const generalProofRef = FireBase.firestore().collection('generalProofs')
            const snapshots = await generalProofRef.get()
            snapshots.forEach(snapshot => {
                const gp = snapshot.data()
                generalProof = {...generalProof, ...gp}
            })
            await this.asyncSetState({generalProof})
        } catch (e) {
            console.warn("DataProvider:_doGetGeneralProof - Error", e)
            Alert.showLongText("Oops! Você está sem internet?")
            success = false
        }

        await this.asyncSetState({
            generalProofLoading: false,
            generalProofVersion: this.state.generalProofVersion + 1
        })

        return success
    }

    _doGetGeneralProofAnswers = async () => {
        let success = true
        await this.asyncSetState({generalProofAnswersLoading: true})

        try {
            const generalProofAnswers = {}
            const generalProofAnswersRef = FireBase.firestore().collection('generalProofAnswers')
            const snapshots = await generalProofAnswersRef.get()
            snapshots.forEach(snapshot => {
                generalProofAnswers[snapshot.id] = {...snapshot.data(), key: snapshot.id}
            })
            await this.asyncSetState({generalProofAnswers})

        } catch (e) {
            console.warn("DataProvider:_doGetGeneralProofAnswers - Error", e)
            Alert.showLongText("Oops! Você está sem internet?")
            success = false
        }

        await this.asyncSetState({
            generalProofAnswersLoading: false,
            generalProofAnswersVersion: this.state.generalProofAnswersVersion + 1
        })

        return success
    }

    _doGetGeneralSettings = async () => {
        let success = true
        await this.asyncSetState({generalSettingsLoading: true})

        try {
            let generalSettings = {}
            const settingsRef = FireBase.firestore().collection('generalSettings')
            const snapshots = await settingsRef.get()
            snapshots.forEach(snapshot => {
                const setts = snapshot.data()
                generalSettings = {...generalSettings, ...setts}
            })
            await this.asyncSetState({generalSettings})
        } catch (e) {
            console.warn("DataProvider:_doGetGeneralSettings - Error", e)
            Alert.showLongText("Oops! Você está sem internet?")
            success = false
        }

        await this.asyncSetState({
            generalSettingsLoading: false,
            generalSettingsVersion: this.state.generalSettingsVersion + 1
        })

        return success
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
