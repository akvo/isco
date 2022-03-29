import "./App.scss";
import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Layout } from "./components";
import {
  Home,
  Admin,
  ManageSurvey,
  ManageUser,
  SurveyEditor,
  Login,
  Register,
  ErrorPage,
} from "./pages";
import { useCookies } from "react-cookie";
import { store, api } from "./lib";
import { useNotification } from "./util";

const Secure = ({ element: Element, adminPage = false }) => {
  const user = store.useState((s) => s?.user);
  const [cookies] = useCookies(["AUTH_TOKEN"]);
  const isAuth = cookies?.AUTH_TOKEN && cookies?.AUTH_TOKEN !== "undefined";
  const isAuthAdmin = isAuth && user?.role?.includes("admin");
  if (isAuthAdmin && adminPage) {
    return <Element />;
  }
  if (isAuth && adminPage) {
    return <ErrorPage status={403} />;
  }
  if (isAuth && !adminPage) {
    return <Element />;
  }
  return <Navigate to="/login" />;
};

const App = () => {
  const isLoggedIn = store.useState((s) => s?.isLoggedIn);
  const [cookies, removeCookie] = useCookies(["AUTH_TOKEN"]);
  const { notify } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.pathname.includes("/register")) {
      if (
        cookies?.AUTH_TOKEN &&
        cookies?.AUTH_TOKEN !== "undefined" &&
        !isLoggedIn
      ) {
        api.setToken(cookies.AUTH_TOKEN);
        api
          .get("/user/me")
          .then((res) => {
            const { data } = res;
            store.update((s) => {
              s.isLoggedIn = true;
              s.user = { ...data };
            });
            navigate("/home");
          })
          .catch((e) => {
            const { status, statusText } = e.response;
            console.error(status, statusText);
            if (status === 401) {
              removeCookie("AUTH_TOKEN", { path: "/" });
              api.setToken(null);
              store.update((s) => {
                s.isLoggedIn = false;
                s.user = null;
              });
              notify({
                type: "error",
                message: "Your session has expired",
              });
            }
            navigate("/login");
          });
      }
    }
  }, [cookies, isLoggedIn, notify, removeCookie, navigate]);

  useEffect(() => {
    Promise.all([
      api.get("/question/type"),
      api.get("/member_type/"),
      api.get("/isco_type/"),
      api.get("/skip_logic/operator"),
      api.get("/cascade/"),
      api.get("/question/repeating_object"),
      api.get("/organisation/"),
    ]).then((res) => {
      const [
        question_type,
        member_type,
        isco_type,
        operator_type,
        cascade,
        repeating_object,
        organisation,
      ] = res;
      store.update((s) => {
        s.optionValues = {
          ...s.optionValues,
          question_type: question_type?.data,
          member_type: member_type?.data,
          isco_type: isco_type?.data,
          operator_type: operator_type?.data,
          cascade: cascade?.data?.filter((c) => c?.type === "cascade"),
          nested: cascade?.data?.filter((c) => c?.type === "nested"),
          repeating_object_option: repeating_object?.data,
          organisation: organisation?.data?.filter((o) => o?.active),
        };
      });
    });
  }, []);

  return (
    <Layout>
      <Layout.Header />
      <Layout.Body>
        <Routes>
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/" element={<Secure element={Home} />} />
          <Route exact path="/home" element={<Secure element={Home} />} />
          <Route
            exact
            path="/admin"
            element={<Secure element={Admin} adminPage={true} />}
          />
          <Route
            exact
            path="/manage-survey"
            element={<Secure element={ManageSurvey} adminPage={true} />}
          />
          <Route
            exact
            path="/manage-user"
            element={<Secure element={ManageUser} adminPage={true} />}
          />
          <Route
            exact
            path="/survey-editor/:formId"
            element={<Secure element={SurveyEditor} adminPage={true} />}
          />
          <Route exact path="*" element={<ErrorPage status={404} />} />
        </Routes>
      </Layout.Body>
      <Layout.Footer />
    </Layout>
  );
};

export default App;
