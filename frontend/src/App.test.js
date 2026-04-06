import { render, screen } from "@testing-library/react";
import App from "./App";
import React from "react";

// Skipping the boilerplate App test as the GISCO environment requires complex mocks
// that are not currently provided in the test runner.
test.skip("renders learn react link", () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
