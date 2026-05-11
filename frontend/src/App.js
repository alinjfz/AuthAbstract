import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import { connect } from "react-redux";
import MyNavbar from "./components/MyNavbar";
import * as URLs from "./constants/routes";

import LoginPage            from "./pages/LoginPage";
import RegisterPage         from "./pages/RegisterPage";
import LogoutPage           from "./pages/LogoutPage";
import DashboardPage        from "./pages/DashboardPage";
import PublicDashboardPage  from "./pages/PublicDashboardPage";
import ProfilePage          from "./pages/ProfilePage";
import ChangePassPage       from "./pages/ChangePassPage";
import ResetPassPage        from "./pages/ResetPassPage";
import ConfirmResetPassPage from "./pages/ConfirmResetPassPage";
import VerifyEmailPage      from "./pages/VerifyEmailPage";
import WelcomeModal         from "./components/WelcomeModal";

function AnimatedRoutes({ loggedin }) {
  const location = useLocation();
  const toLogin = () => <Navigate to={URLs.LOGIN_URL} replace />;

  return (
    <div key={location.pathname} className="page-enter">
      <Routes>
        {/* Protected routes */}
        <Route path={URLs.DASHBOARD_URL}   index element={loggedin ? <DashboardPage />  : <PublicDashboardPage />} />
        <Route path={URLs.PROFILE_URL}     element={loggedin ? <ProfilePage />    : toLogin()} />
        <Route path={URLs.CHANGE_PASS_URL} element={loggedin ? <ChangePassPage /> : toLogin()} />
        <Route path={URLs.LOGOUT_URL}      element={loggedin ? <LogoutPage />     : toLogin()} />

        {/* Public routes */}
        <Route path={URLs.LOGIN_URL}              element={<LoginPage />} />
        <Route path={URLs.REGISTER_URL}           element={<RegisterPage />} />
        <Route path={URLs.RESET_PASS_URL}         element={<ResetPassPage />} />
        <Route path={URLs.CONFIRM_RESET_PASS_URL} element={<ConfirmResetPassPage />} />
        <Route path={URLs.VERIFY_EMAIL_URL}       element={<VerifyEmailPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={URLs.DASHBOARD_URL} replace />} />
      </Routes>
    </div>
  );
}

function App({ loggedin }) {
  return (
    <Router>
      <MyNavbar />
      <Container fluid className="app-container my-5">
        <AnimatedRoutes loggedin={loggedin} />
      </Container>
      <WelcomeModal />
    </Router>
  );
}

const mapStateToProps = (state) => ({ loggedin: state.auth.loggedin });
export default connect(mapStateToProps)(App);
