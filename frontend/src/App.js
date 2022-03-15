import "./App.scss";
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components";
import { Home, Admin, ManageSurvey, ManageUser, SurveyEditor } from "./pages";
import { store, api } from "./lib";

const App = () => {
  useEffect(() => {
    Promise.all([
      api.get("question/type"),
      api.get("member_type/"),
      api.get("isco_type/"),
    ]).then((res) => {
      const [question_type, member_type, isco_type] = res;
      store.update((s) => {
        s.optionValues = {
          ...s.optionValues,
          question_type: question_type?.data,
          member_type: member_type?.data,
          isco_type: isco_type?.data,
        };
      });
    });
  }, []);

  return (
    <Layout>
      <Layout.Header />
      <Layout.Body>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/home" element={<Home />} />
          <Route exact path="/admin" element={<Admin />} />
          <Route exact path="/manage-survey" element={<ManageSurvey />} />
          <Route exact path="/manage-user" element={<ManageUser />} />
          <Route exact path="/survey-editor" element={<SurveyEditor />} />
        </Routes>
      </Layout.Body>
      <Layout.Footer />
    </Layout>
  );
};

export default App;
