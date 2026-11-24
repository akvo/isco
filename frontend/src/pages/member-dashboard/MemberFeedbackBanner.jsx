import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Row, Col, Typography, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { uiText } from "../../static";

const { Title, Text, Paragraph } = Typography;

const parseFeedbackMessage = (rawText) => {
  if (!rawText || typeof rawText !== "string") {
    return { achievements: null, growthAreas: null, general: null };
  }

  const achievementsMatch = rawText.match(
    /\*\*Achievements?:\*\*\s*([\s\S]*?)(?=(\*\*Growth areas?:\*\*|$))/i
  );
  const growthMatch = rawText.match(/\*\*Growth areas?:\*\*\s*([\s\S]*?)$/i);

  const achievements = achievementsMatch ? achievementsMatch[1].trim() : null;
  const growthAreas = growthMatch ? growthMatch[1].trim() : null;

  if (!achievements && !growthAreas) {
    return { achievements: null, growthAreas: null, general: rawText.trim() };
  }

  return { achievements, growthAreas, general: null };
};

const MemberFeedbackBanner = ({
  message,
  messages,
  year,
  activeLang = "en",
  isAdmin = false,
  onDownloadTemplate,
  isDownloadingTemplate = false,
}) => {
  const text = useMemo(() => uiText[activeLang] || uiText.en, [activeLang]);

  const sortedMessages = useMemo(() => {
    if (messages && Array.isArray(messages) && messages.length > 0) {
      return [...messages].sort((a, b) => b.year - a.year);
    }
    if (message) {
      return [message];
    }
    return [];
  }, [messages, message]);

  const [selectedYear, setSelectedYear] = useState(null);

  const activeSelectedYear = useMemo(() => {
    if (selectedYear && sortedMessages.some((m) => m.year === selectedYear)) {
      return selectedYear;
    }
    if (sortedMessages.length > 0) {
      return sortedMessages[0].year;
    }
    return year;
  }, [selectedYear, sortedMessages, year]);

  const currentMessage = useMemo(() => {
    if (sortedMessages.length > 0) {
      const found = sortedMessages.find((m) => m.year === activeSelectedYear);
      return found || sortedMessages[0];
    }
    return message;
  }, [sortedMessages, activeSelectedYear, message]);

  const resolvedMessageText = useMemo(() => {
    if (!currentMessage || !currentMessage.message) {
      return null;
    }
    if (
      currentMessage.translations &&
      Array.isArray(currentMessage.translations)
    ) {
      const matched = currentMessage.translations.find(
        (t) => t.language?.toLowerCase() === activeLang.toLowerCase()
      );
      if (matched && matched.message) {
        return matched.message;
      }
    }
    return currentMessage.message;
  }, [currentMessage, activeLang]);

  const { achievements, growthAreas, general } = useMemo(() => {
    return parseFeedbackMessage(resolvedMessageText);
  }, [resolvedMessageText]);

  const displayYear = currentMessage?.year || year;
  const yearLabel = displayYear ? ` (${displayYear})` : "";
  const hasFeedback = Boolean(
    resolvedMessageText && (achievements || growthAreas || general)
  );

  return (
    <section
      className={`member-feedback-banner ${
        !hasFeedback ? "feedback-banner-empty" : ""
      }`}
      role="region"
      aria-label={text.feedbackBannerTitle || "Annual Reporting Feedback"}
      data-testid="member-feedback-banner"
    >
      <div className="feedback-banner-header">
        <div className="feedback-header-left">
          <span className="feedback-eyebrow">
            {text.feedbackEyebrow || "Secretariat Reporting Summary"}
          </span>
          <Title level={4} className="feedback-title">
            {text.feedbackBannerTitle || "Annual Reporting Feedback"}
            {sortedMessages.length <= 1 && yearLabel}
          </Title>
          <Text className="feedback-subtitle">
            {text.feedbackBannerSubtitle ||
              "Qualitative reporting feedback provided by the Secretariat"}
          </Text>
        </div>

        <div className="feedback-header-right">
          {isAdmin && onDownloadTemplate && (
            <div className="feedback-header-actions">
              <Button
                type="default"
                icon={<DownloadOutlined />}
                onClick={onDownloadTemplate}
                loading={isDownloadingTemplate}
                className="feedback-download-template-btn"
                data-testid="download-feedback-template-btn"
              >
                {text.feedbackDownloadTemplate || "Download Feedback Template"}
              </Button>
            </div>
          )}

          {sortedMessages.length > 1 && (
            <div
              className="feedback-year-pills"
              role="tablist"
              aria-label="Reporting years"
            >
              {sortedMessages.map((m, idx) => {
                const isSelected = m.year === activeSelectedYear;
                return (
                  <button
                    key={m.year}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    className={`feedback-year-pill ${
                      isSelected ? "active" : ""
                    }`}
                    onClick={() => setSelectedYear(m.year)}
                  >
                    {m.year}
                    {idx === 0 && (
                      <span className="year-latest-badge">
                        {text.feedbackLatestBadge || "Latest"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="feedback-banner-content">
        {hasFeedback ? (
          <>
            {(achievements || growthAreas) && (
              <Row gutter={[32, 20]}>
                {achievements && (
                  <Col xs={24} md={growthAreas ? 12 : 24}>
                    <div
                      className="feedback-editorial-col achievement-col"
                      data-testid="feedback-achievements-box"
                    >
                      <span className="col-rubric-label">
                        {text.feedbackAchievements || "Achievements"}
                      </span>
                      <Paragraph className="col-body-text">
                        {achievements}
                      </Paragraph>
                    </div>
                  </Col>
                )}

                {growthAreas && (
                  <Col xs={24} md={achievements ? 12 : 24}>
                    <div
                      className="feedback-editorial-col growth-col"
                      data-testid="feedback-growth-box"
                    >
                      <span className="col-rubric-label">
                        {text.feedbackGrowthAreas || "Growth Area"}
                      </span>
                      <Paragraph className="col-body-text">
                        {growthAreas}
                      </Paragraph>
                    </div>
                  </Col>
                )}
              </Row>
            )}

            {general && (
              <div
                className="feedback-editorial-col general-col"
                data-testid="feedback-general-box"
              >
                <Paragraph className="col-body-text">{general}</Paragraph>
              </div>
            )}
          </>
        ) : (
          <div
            className="feedback-editorial-col empty-col"
            data-testid="feedback-empty-box"
          >
            <Paragraph className="col-body-text empty-feedback-text">
              {text.feedbackNoMessage ||
                text.feedbackNoMessageAdmin ||
                "No feedback recorded for this organisation in this monitoring round."}
            </Paragraph>
          </div>
        )}
      </div>
    </section>
  );
};

MemberFeedbackBanner.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.number,
    year: PropTypes.number,
    message: PropTypes.string,
    translations: PropTypes.arrayOf(
      PropTypes.shape({
        language: PropTypes.string,
        message: PropTypes.string,
      })
    ),
  }),
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      year: PropTypes.number,
      message: PropTypes.string,
      translations: PropTypes.arrayOf(
        PropTypes.shape({
          language: PropTypes.string,
          message: PropTypes.string,
        })
      ),
    })
  ),
  year: PropTypes.number,
  activeLang: PropTypes.string,
  isAdmin: PropTypes.bool,
  onDownloadTemplate: PropTypes.func,
  isDownloadingTemplate: PropTypes.bool,
};

export default MemberFeedbackBanner;
