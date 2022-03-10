import "./App.scss";
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components";

const App = () => {
  return (
    <Layout>
      <Layout.Header />
      <Layout.Body>
        <Routes>
          <Route exact path="/" element={<h1>Login</h1>} />
          <Route exact path="/home" element={<h1>Homepage</h1>} />
        </Routes>
      </Layout.Body>
    </Layout>
  );
};

export default App;
