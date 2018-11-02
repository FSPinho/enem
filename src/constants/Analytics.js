export const Events = {
    /**
     * Screen navigation
     * */
    LetterOpenHome: 'le_navigate_to_home',
    LetterOpenLogin: 'le_navigate_to_login',
    LetterOpenLetterEditor: 'le_navigate_to_letter_editor',
    LetterOpenLetterFinder: 'le_navigate_to_letter_finder',
    LetterOpenLetterResponder: 'le_navigate_to_letter_responder',

    /**
     * Auth and sessions
     * */
    LetterSessionStart: 'le_session_start',
    LetterSessionEnd: 'le_session_end',
    LetterSignIn: 'le_sign_in',
    LetterSignOut: 'le_sign_out',

    /**
     * Content
     * */
    LetterThemeEnableLight: 'le_theme_enable_light',
    LetterThemeEnableDark: 'le_theme_enable_dark',
    LetterLetterCreated: 'le_letter_created',
    LetterLetterAnswered: 'le_letter_answered',
    LetterLetterEdited: 'le_letter_edited',
    LetterDoFindLetter: 'le_do_find_letter',
    LetterNoLetterFound: 'le_do_letter_found',
    LetterUserTurnedGnome: 'le_user_turned_gnome',
    LetterGeneralBannerLoaded: 'le_general_banner_loaded',
    LetterGeneralBannerError: 'le_general_banner_error',
    LetterGeneralBannerClicked: 'le_general_banner_clicked',
}