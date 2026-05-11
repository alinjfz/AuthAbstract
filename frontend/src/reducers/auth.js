import {
  AUTH_LOGIN_USER,
  AUTH_CLEAR_ERROR,
  AUTH_LOGOUT_USER,
  AUTH_EDIT_PROFILE,
  AUTH_CHANGE_PASSWORD,
  AUTH_RESET_PASSWORD,
  AUTH_SET_LOADING,
  AUTH_CONFIRM_RESET_PASSWORD,
  AUTH_ERROR,
  AUTH_SET_USER_DATA,
  AUTH_RESET,
  AUTH_SEND_VERIFICATION,
  AUTH_GET_PROFILE,
  AUTH_REGISTER_USER,
  AUTH_VERIFY_EMAIL,
  AUTH_SHOW_WELCOME_MODAL,
  AUTH_CLEAR_WELCOME_MODAL,
} from "../constants/Auth";

const initialState = {
  user: {
    email: '',
    name: '',
    is_verified: false,
  },
  config: {
    email_verify_enabled: false,
  },
  loggedin: false,
  loading: false,
  error: '',
  message: '',
  show_welcome_modal: false,
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case AUTH_RESET:
      return { ...initialState };
    case AUTH_CONFIRM_RESET_PASSWORD:
      return { ...state, ...action.x, loading: false };
    case AUTH_EDIT_PROFILE:
      return { ...state, ...action.x, loading: false };
    case AUTH_RESET_PASSWORD:
      return { ...state, ...action.x, loading: false };
    case AUTH_CHANGE_PASSWORD:
      return { ...state, ...action.x, loading: false };
    case AUTH_VERIFY_EMAIL:
      return { ...state, ...action.x, loading: false };
    case AUTH_SET_LOADING:
      return { ...state, loading: action.x };
    case AUTH_SEND_VERIFICATION:
      return { ...state, ...action.x, loading: false };
    case AUTH_REGISTER_USER:
      return { ...state, ...action.x, loading: false };
    case AUTH_ERROR:
      if (action.x) {
        if (action.x.message) return { ...state, error: action.x.message, loading: false };
        if (action.x.error)   return { ...state, error: action.x.error,   loading: false };
      }
      return { ...state, ...action.x, loading: false, error: 'Empty' };
    case AUTH_LOGOUT_USER:
      return { ...initialState };
    case AUTH_LOGIN_USER:
      if (!action.x) return { ...state, loggedin: true, loading: false };
      return {
        ...state,
        user:     action.x.user   || state.user,
        config:   action.x.config || state.config,
        loggedin: true,
        loading:  false,
      };
    case AUTH_SET_USER_DATA:
      return { ...state, ...action.x, loading: false };
    case AUTH_GET_PROFILE:
      return { ...state, ...action.x, loading: false };
    case AUTH_SHOW_WELCOME_MODAL:
      return { ...state, show_welcome_modal: true };
    case AUTH_CLEAR_WELCOME_MODAL:
      return { ...state, show_welcome_modal: false };
    case AUTH_CLEAR_ERROR:
      return { ...state, error: '', message: '', loading: false };
    default:
      return state;
  }
}
