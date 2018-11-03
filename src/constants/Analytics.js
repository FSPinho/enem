export const Events = {
    /**
     * Screen navigation
     * */
    OpenLogin: 'le_navigate_to_login',
    OpenHome: 'le_navigate_to_home',

    /**
     * Auth and sessions
     * */
    SessionStart: 'le_session_start',
    SessionEnd: 'le_session_end',
    SignIn: 'le_sign_in',
    SignOut: 'le_sign_out',

    /**
     * Content
     * */
    ThemeEnableLight: 'le_theme_enable_light',
    ThemeEnableDark: 'le_theme_enable_dark',
    GeneralBannerLoaded: 'le_general_banner_loaded',
    GeneralBannerError: 'le_general_banner_error',
    GeneralBannerClicked: 'le_general_banner_clicked',
}