import React from "react";
import { render, screen } from "@testing-library/react";
import MemberFeedbackBanner from "./MemberFeedbackBanner";

beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    function () {
      return {
        matches: false,
        addListener: function () {},
        removeListener: function () {},
      };
    };
});

describe("MemberFeedbackBanner Component", () => {
  test("renders default empty text in content body when message is null or empty", () => {
    const { unmount } = render(
      <MemberFeedbackBanner message={null} activeLang="en" />
    );
    expect(screen.getByTestId("feedback-empty-box")).toBeInTheDocument();
    expect(
      screen.getByText(
        /No feedback recorded for this organisation in this monitoring round/i
      )
    ).toBeInTheDocument();
    unmount();

    render(<MemberFeedbackBanner message={{ message: "" }} activeLang="de" />);
    expect(
      screen.getByText(
        /Für diese Organisation wurde in dieser Monitoringrunde noch kein Feedback erfasst/i
      )
    ).toBeInTheDocument();
  });

  test("renders achievements and growth areas in separated styled boxes", () => {
    const message = {
      id: 101,
      year: 2024,
      message:
        "**Achievements:**\n85% direct sourcing achieved.\n\n**Growth area:**\nExpand living income coverage.",
    };

    render(<MemberFeedbackBanner message={message} activeLang="en" />);

    const region = screen.getByRole("region", {
      name: /Annual Reporting Feedback/i,
    });
    expect(region).toBeInTheDocument();

    expect(screen.getByTestId("feedback-achievements-box")).toBeInTheDocument();
    expect(
      screen.getByText(/85% direct sourcing achieved/i)
    ).toBeInTheDocument();

    expect(screen.getByTestId("feedback-growth-box")).toBeInTheDocument();
    expect(
      screen.getByText(/Expand living income coverage/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Annual Reporting Feedback \(2024\)/i)
    ).toBeInTheDocument();
  });

  test("renders fallback general message when structured markdown headers are missing", () => {
    const message = {
      id: 102,
      year: 2023,
      message:
        "Overall outstanding commitment across all supply chains without specific sub-headings.",
    };

    render(<MemberFeedbackBanner message={message} activeLang="en" />);

    expect(screen.getByTestId("feedback-general-box")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Overall outstanding commitment across all supply chains/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("feedback-achievements-box")
    ).not.toBeInTheDocument();
  });

  test("prefers matching translation when activeLang is de", () => {
    const message = {
      id: 103,
      year: 2024,
      message:
        "**Achievements:**\nEnglish achievements.\n\n**Growth area:**\nEnglish growth.",
      translations: [
        {
          language: "de",
          message:
            "**Achievements:**\nDeutsche Erfolge.\n\n**Growth area:**\nDeutscher Entwicklungsbereich.",
        },
      ],
    };

    render(<MemberFeedbackBanner message={message} activeLang="de" />);

    expect(screen.getByText(/Deutsche Erfolge/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Deutscher Entwicklungsbereich/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/English achievements/i)).not.toBeInTheDocument();
  });

  test("renders download template button for admin in header", () => {
    const onDownload = jest.fn();
    render(
      <MemberFeedbackBanner
        message={null}
        year={2024}
        isAdmin={true}
        onDownloadTemplate={onDownload}
      />
    );

    const btn = screen.getByTestId("download-feedback-template-btn");
    expect(btn).toBeInTheDocument();
  });

  test("renders year selector pills when multiple years of messages are provided and toggles content", () => {
    const messages = [
      {
        id: 201,
        year: 2024,
        message:
          "**Achievements:**\n2024 achievements reached.\n\n**Growth area:**\n2024 growth needed.",
      },
      {
        id: 202,
        year: 2023,
        message:
          "**Achievements:**\n2023 baseline set.\n\n**Growth area:**\n2023 initial steps.",
      },
      {
        id: 203,
        year: 2022,
        message:
          "**Achievements:**\n2022 pilot begun.\n\n**Growth area:**\n2022 setup required.",
      },
    ];

    render(<MemberFeedbackBanner messages={messages} activeLang="en" />);

    // Initial state: latest (2024) is displayed
    expect(screen.getByText(/2024 achievements reached/i)).toBeInTheDocument();
    expect(screen.getByText("2024")).toBeInTheDocument();
    expect(screen.getByText("2023")).toBeInTheDocument();
    expect(screen.getByText("2022")).toBeInTheDocument();

    // Click 2023 pill
    const pill2023 = screen.getByRole("tab", { name: /2023/i });
    pill2023.click();

    expect(screen.getByText(/2023 baseline set/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/2024 achievements reached/i)
    ).not.toBeInTheDocument();

    // Click 2022 pill
    const pill2022 = screen.getByRole("tab", { name: /2022/i });
    pill2022.click();

    expect(screen.getByText(/2022 pilot begun/i)).toBeInTheDocument();
  });
});
