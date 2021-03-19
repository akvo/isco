import React, {
    createContext,
    useContext,
    useState,
    useMemo,
    useEffect
} from "react";
import auth  from "../services/auth";
import { useAuth0 } from "@auth0/auth0-react";

const UserContext = createContext();

const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within an UserProvider");
    }
//    console.log(context);
    return context;
};
const withPermission = user => {
    if (!user.permissions) {
        return user;
    }

    return {
        ...user,
        can(permission) {
            if (!this.email_verified) {
                return false;
            }
            return this.permissions.includes(permission);
        }
    };
};

const UserProvider = ({ init, ...props }) => {
    const [user, setUser] = useState();
  const [locale, setLocale] = useState({active: 'en', locale: []});

  const {
    isAuthenticated,
    getIdTokenClaims,
    loginWithPopup,
    logout,
  } = useAuth0();


  useEffect(async () => {
    // getUser();

    if (init){
        const response = await getIdTokenClaims();

      console.log('api.setToken', response.__raw);


      const u = await auth.getUser(init, response.__raw);
      console.log('calling api', u);
      setUser(withPermission(u));
    }

  }, [init]);


  const value = useMemo(() => {
    return ({ user, setUser, locale, setLocale });},
                        [user, locale, init]);
    return <UserContext.Provider value={value} {...props} />;
};

export { UserProvider, useUser, withPermission };
