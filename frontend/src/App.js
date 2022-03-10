import "./App.scss";
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components";
import { Home } from "./pages";

const App = () => {
  return (
    <Layout>
      <Layout.Header />
      <Layout.Body>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/home" element={<Home />} />
        </Routes>
      </Layout.Body>
    </Layout>
  );
};

export default App;
