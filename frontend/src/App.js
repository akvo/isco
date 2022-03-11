import "./App.scss";
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components";
import { Home, Admin, ManageSurvey, ManageUser, SurveyEditor } from "./pages";

const App = () => {
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
