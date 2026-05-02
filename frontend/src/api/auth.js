import * as authActions from "../actions/auth";
import {
  AUTH_CHANGE_PASS_API,
  AUTH_LOGIN_API,
  AUTH_LOGOUT_API,
  AUTH_PROFILE_API,
  AUTH_REGISTER_API,
  AUTH_RESET_PASS_API,
  AUTH_RESET_PASS_CONFIRM_API,
  AUTH_VERIFY_EMAIL_API,
  AUTH_SEND_VERIFICATION_API,
} from "../constants/ApiRoutes";

// JWT is stored in an httpOnly cookie — browser sends it automatically.
// withCredentials: true ensures the cookie is included on every request.
const baseOptions = {
  credentials: "include",
  mode: "cors",
  headers: {
    "Content-Type": "application/json",
  },
};

async function request(url, options, dispatch) {
  let status = 0;
  dispatch(authActions.auth_clear_error());
  dispatch(authActions.auth_set_loading(true));
  try {
    const res = await fetch(url, options);
    status = res.status;
    const data = await res.json();
    if (status >= 200 && status < 300) return { status, data };
    throw data;
  } catch (err) {
    if (status === 401) dispatch(authActions.auth_logout_user());
    else dispatch(authActions.auth_error(err));
    return { status, data: null };
  }
}

export const api_login = (x) => async (dispatch) => {
  const { status, data } = await request(AUTH_LOGIN_API, {
    ...baseOptions, method: "POST", body: JSON.stringify(x),
  }, dispatch);
  if (status === 200) dispatch(authActions.auth_login_user(data));
};

export const api_logout = () => async (dispatch) => {
  const { status } = await request(AUTH_LOGOUT_API, {
    ...baseOptions, method: "POST",
  }, dispatch);
  if (status === 200) dispatch(authActions.auth_logout_user());
};

export const api_register = (x) => async (dispatch) => {
  const { status, data } = await request(AUTH_REGISTER_API, {
    ...baseOptions, method: "POST", body: JSON.stringify(x),
  }, dispatch);
  if (status === 201) dispatch(authActions.auth_register_user(data));
};

export const api_get_profile = () => async (dispatch) => {
  const { status, data } = await request(AUTH_PROFILE_API, {
    ...baseOptions, method: "GET",
  }, dispatch);
  if (status === 200) dispatch(authActions.auth_get_profile(data));
};

export const api_change_pass = (x) => async (dispatch) => {
  const { status, data } = await request(AUTH_CHANGE_PASS_API, {
    ...baseOptions, method: "POST", body: JSON.stringify(x),
  }, dispatch);
  if (status === 200) dispatch(authActions.auth_change_password(data));
};

export const api_send_reset_pass = (x) => async (dispatch) => {
  const { status, data } = await request(AUTH_RESET_PASS_API, {
    ...baseOptions, method: "POST", body: JSON.stringify(x),
  }, dispatch);
  if (status === 200) dispatch(authActions.auth_reset_password(data));
};

export const api_confirm_reset_pass = (x) => async (dispatch) => {
  const { status, data } = await request(AUTH_RESET_PASS_CONFIRM_API, {
    ...baseOptions, method: "POST", body: JSON.stringify(x),
  }, dispatch);
  if (status === 200) dispatch(authActions.auth_confirm_reset_password(data));
};

export const api_verify_email = (x) => async (dispatch) => {
  const { status, data } = await request(AUTH_VERIFY_EMAIL_API, {
    ...baseOptions, method: "POST", body: JSON.stringify(x),
  }, dispatch);
  if (status === 200) dispatch(authActions.auth_verify_email(data));
};

export const api_send_verification = () => async (dispatch) => {
  const { status, data } = await request(AUTH_SEND_VERIFICATION_API, {
    ...baseOptions, method: "POST",
  }, dispatch);
  if (status === 200) dispatch(authActions.auth_send_verification(data));
};
