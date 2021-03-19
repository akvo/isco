import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { UserProvider, useUser, withPermission } from "../lib/user-context";
import authApi from "../services/auth";
import { Route, Redirect } from "react-router-dom";
import config from "../config";
import VerifyEmail from "./VerifyEmail";

// TODO: double-check
//const initUser = async (user) => {
    // check user last activity
    // if (user.last_activity === null) {
    //     // reload page
    //     window.location.reload();
    //     return;
    // }
//    return withPermission(user);
//};

const AuthProvider = props => {
  const { user } = useAuth0();
  if (props.isLoading) {
    return (<h1>{props.isLoading}</h1>);
  } else {
    //    authApi.getUser()
    return (<UserProvider init={user || false} {...props} />);
  };
};

const useAuth = () => {
  const { user, setUser } = useUser();
  const logout0 = useAuth0().logout;
  const logout = async () => {

    localStorage.clear();

    setUser(null);

    logout0();
  };
    const login = async data => {
        const sessionUser = await authApi.login(data);
        setUser(withPermission(sessionUser));
    };


    const updateUser = data => {
        setUser(data);
    };

    return { user, login, logout, updateUser };
};

const SecureRoute = ({ component: Component, ...rest }) => {
  const { user } = useUser();
    const goto = props => {
        if (user?.email_verified) return <Component {...rest} />;
        if (user) return <VerifyEmail {...rest} />;
        if (user === false)
            return (
                <Redirect
                    to={{
                        pathname: config.routes.login,
                        state: { referrer: props.location }
                    }}
                />
            );
        return <></>;
    };

    return <Route {...rest} render={goto} />;
};

const PublicOnlyRoute = ({ component: Component, ...rest }) => {
//  console.log('PublicOnlyRoute', rest, Component);
  const { user } = useUser();
    const goto = () => {
        if (user) return <Redirect to={config.userLanding} />;
        if (user === false || user === undefined) return <Component {...rest} />;
        return <></>;
    };

    return <Route {...rest} render={goto} />;
};

export { AuthProvider, useAuth, SecureRoute, PublicOnlyRoute };
