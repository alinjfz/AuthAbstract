import * as authtypes from "../constants/Auth";
export const auth_register_user = (x) => ({
  type: authtypes.AUTH_REGISTER_USER,
  x,
});
export const auth_set_loading = (x) => ({
  type: authtypes.AUTH_SET_LOADING,
  x,
});
export const auth_login_user = (x) => ({
  type: authtypes.AUTH_LOGIN_USER,
  x,
});
export const auth_reset = (x) => ({
  type: authtypes.AUTH_RESET,
  x,
});
export const auth_reset_password = (x) => ({
  type: authtypes.AUTH_RESET_PASSWORD,
  x,
});
export const auth_confirm_reset_password = (x) => ({
  type: authtypes.AUTH_CONFIRM_RESET_PASSWORD,
  x,
});
export const auth_logout_user = () => ({
  type: authtypes.AUTH_LOGOUT_USER,
});
export const auth_error = (x) => ({
  type: authtypes.AUTH_ERROR,
  x,
});
export const auth_get_profile = (x) => ({
  type: authtypes.AUTH_GET_PROFILE,
  x,
});
export const auth_clear_error = () => ({
  type: authtypes.AUTH_CLEAR_ERROR,
});
export const auth_set_user_data = (x) => ({
  type: authtypes.AUTH_SET_USER_DATA,
  x,
});
export const auth_edit_profile = (x) => ({
  type: authtypes.AUTH_EDIT_PROFILE,
  x,
});
export const auth_change_password = (x) => ({
  type: authtypes.AUTH_CHANGE_PASSWORD,
  x,
});
export const auth_refresh = () => ({
  type: authtypes.AUTH_REFRESH,
});
export const auth_verify_email = (x) => ({
  type: authtypes.AUTH_VERIFY_EMAIL,
  x,
});
export const auth_send_verification = (x) => ({
  type: authtypes.AUTH_SEND_VERIFICATION,
  x,
});
