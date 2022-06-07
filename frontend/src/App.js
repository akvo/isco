import "./App.scss";
import React, { useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Layout, SaveFormDataModal, DataSecurityModal } from "./components";
import {
  Home,
  Admin,
  ManageSurvey,
  ManageUser,
  SurveyEditor,
  Register,
  Login,
  ResetPassword,
  EmailNotVerified,
  ErrorPage,
  Download,
  Survey,
  Feedback,
  Definition,
  Impressum,
  Setting,
  SubmissionProgress,
  Faq,
  ManageMember,
  ManageDownload,
  DataCleaning,
  DownloadReport,
} from "./pages";
import { Alert } from "antd";
import { useCookies } from "react-cookie";
import { store, api } from "./lib";
import { useNotification } from "./util";
import { uiText } from "./static";
import orderBy from "lodash/orderBy";

const Secure = ({ element: Element, adminPage = false }) => {
  const user = store.useState((s) => s?.user);
  const [cookies] = useCookies(["AUTH_TOKEN"]);
  const isAuth = cookies?.AUTH_TOKEN && cookies?.AUTH_TOKEN !== "undefined";
  const admins = ["secretariat_admin"];
  const isAuthAdmin = isAuth && admins.includes(user?.role);
  const isNotApproved = isAuth && !user?.approved;
  if (isNotApproved) {
    return <ErrorPage status="not-approved" />;
  }
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
  const { notificationModal, language, user, isLoggedIn } = store.useState(
    (s) => s
  );
  const { saveFormData, dataSecurity } = notificationModal;
  const { active: activeLang } = language;

  const [cookies, removeCookie] = useCookies(["AUTH_TOKEN"]);
  const { notify } = useNotification();
  const navigate = useNavigate();

  const showAssignmentPanel = isLoggedIn && !user?.questionnaires?.length;
  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  useEffect(() => {
    if (
      (!location.pathname.includes("/register") ||
        !location.pathname.includes("/forgot-password") ||
        !location.pathname.includes("/invitation")) &&
      !location.pathname.includes("/login")
    ) {
      if (cookies?.AUTH_TOKEN && cookies?.AUTH_TOKEN !== "undefined") {
        api.setToken(cookies.AUTH_TOKEN);
        api
          .get("/user/me")
          .then((res) => {
            const { data } = res;
            store.update((s) => {
              s.isLoggedIn = true;
              s.user = { ...data };
            });
          })
          .catch((e) => {
            const { status, statusText } = e.response;
            console.error(status, statusText);
            if (status === 401 || status === 500) {
              removeCookie("AUTH_TOKEN");
              api.setToken(null);
              store.update((s) => {
                s.isLoggedIn = false;
                s.user = null;
              });
              notify({
                type: "error",
                message: "Your session has expired",
              });
              navigate("/login");
            }
            if (status === 403) {
              navigate("/verify_email");
            }
          });
      }
    }
  }, [cookies, notify, removeCookie, navigate]);

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
          organisation: orderBy(
            organisation?.data?.filter((o) => o?.active),
            ["name"]
          ),
        };
      });
    });
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      // get organisation filtered
      api
        .get("/organisation/isco")
        .then((res) => {
          store.update((s) => {
            s.optionValues = {
              ...s.optionValues,
              organisationInSameIsco: orderBy(
                res?.data?.filter((o) => o?.active),
                ["name"]
              ),
            };
          });
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [isLoggedIn]);

  return (
    <Layout>
      <Layout.Header />
      <Layout.Body>
        {showAssignmentPanel && (
          <Alert
            type="info"
            className="assignment-notification-panel"
            message={text.textAssignmentPanel}
            banner
            closable
          />
        )}
        <Routes>
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/register" element={<Register />} />
          <Route
            exact
            path="/invitation/:tokenId"
            element={<ResetPassword />}
          />
          <Route
            exact
            path="/reset-password/:tokenId"
            element={<ResetPassword />}
          />
          <Route exact path="/verify_email" element={<EmailNotVerified />} />
          <Route exact path="/verify_email/:email" element={<Login />} />
          <Route exact path="/definition" element={<Definition />} />
          <Route exact path="/" element={<Secure element={Home} />} />
          <Route exact path="/home" element={<Secure element={Home} />} />
          <Route exact path="/setting" element={<Secure element={Setting} />} />
          <Route
            exact
            path="/download"
            element={<Secure element={Download} />}
          />
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
          <Route
            exact
            path="/submission-progress"
            element={<Secure element={SubmissionProgress} adminPage={true} />}
          />
          <Route
            exact
            path="/manage-member"
            element={<Secure element={ManageMember} adminPage={true} />}
          />
          <Route
            exact
            path="/manage-download"
            element={<Secure element={ManageDownload} adminPage={true} />}
          />
          <Route
            exact
            path="/download-report"
            element={<Secure element={DownloadReport} adminPage={true} />}
          />
          <Route
            exact
            path="/data-cleaning"
            element={<Secure element={DataCleaning} adminPage={true} />}
          />
          <Route exact path="/survey" element={<Secure element={Survey} />} />
          <Route
            exact
            path="/feedback"
            element={<Secure element={Feedback} />}
          />
          <Route
            exact
            path="/impressum"
            element={<Secure element={Impressum} />}
          />
          <Route exact path="/faq" element={<Secure element={Faq} />} />
          <Route exact path="*" element={<ErrorPage status={404} />} />
        </Routes>

        {/* Modal */}
        <SaveFormDataModal
          visible={saveFormData.visible}
          activeLang={activeLang}
          onOk={saveFormData.onOk}
          onCancel={() => {
            store.update((s) => {
              s.notificationModal = {
                ...s.notificationModal,
                saveFormData: {
                  ...s.notificationModal.saveFormData,
                  visible: false,
                },
              };
            });
          }}
        />
        <DataSecurityModal
          visible={dataSecurity.visible}
          activeLang={activeLang}
          onCancel={() => {
            store.update((s) => {
              s.notificationModal = {
                ...s.notificationModal,
                dataSecurity: {
                  ...s.notificationModal.dataSecurity,
                  visible: false,
                },
              };
            });
          }}
        />
      </Layout.Body>
      <Layout.Footer />
    </Layout>
  );
};

export default App;
