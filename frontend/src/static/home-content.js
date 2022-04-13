import React, { Fragment } from "react";
import { Link } from "react-router-dom";

const homeContent = (handleShow, youtubeLink, slideLink) => {
  return {
    en: {
      h: "Welcome to the Cocoa Monitoring!",
      p1: "Dear Participants, ",
      p2: (
        <Fragment>
          Thank you for participating in this pilot of our new monitoring
          system. Your comments on the monitoring system are very valuable for
          us – you can give them in the feedback section (menu above) or in the
          comment fields in the questionnaires. <br />
          Before you start, please use this{" "}
          <Link onClick={handleShow} to="#">
            link
          </Link>{" "}
          to check on the data security and confidentiality measures taken.{" "}
          <br />
          <br />
          Thank you very much for your contribution to making the cocoa sector
          more sustainable!
        </Fragment>
      ),
      gettingStarted: {
        h: "Getting Started",
        p1: [
          <Fragment key="p1-1">
            For in-depth info, please watch the video at this{" "}
            <a target="_blank" rel="noreferrer" href={youtubeLink}>
              link
            </a>{" "}
            (or watch it directly below).
          </Fragment>,
          <Fragment key="p1-2">
            You should also visit our <Link to="/faq">FAQ section</Link> which
            contain answers to most questions.
          </Fragment>,
        ],
        p2: [
          <Fragment key="p2-1">
            We also prepare a{" "}
            <a target="_blank" rel="noreferrer" href={slideLink}>
              slide
            </a>
            , describing the tool functionalities.
          </Fragment>,
          <Fragment key="p2-2">
            If you need any more info, don&apos;t hesitate to get in touch
            directly: <Link to="/feedback">feedback form</Link>
          </Fragment>,
        ],
      },
    },

    de: {
      h: "Willkommen beim Kakao-Monitoring!",
      p1: "Liebe Teilnehmerinnen und Teilnehmer, ",
      p2: (
        <Fragment>
          vielen Dank für Ihre Teilnahme an der Pilot-Anwendung unseres neuen
          Monitoringsystems. Ihre Kommentare zum Monitoringsystem sind für uns
          sehr wertvoll – Sie können diese im Feedbackformular (im Menu oben)
          oder in den Kommentarfeldern der Fragebögen machen. <br />
          Bevor Sie beginnen, verwenden Sie bitte diesen{" "}
          <Link onClick={handleShow} to="#">
            link
          </Link>
          , um die ergriffenen Datensicherheits- und
          Datenvertraulichkeitsmaßnahmen zu überprüfen. <br />
          <br />
          Vielen Dank für Ihren Beitrag zur Verbesserung der Nachhaltigkeit des
          Kakaosektors!
        </Fragment>
      ),
      gettingStarted: {
        h: "Getting Started",
        p1: [
          <Fragment key="p1-1">
            For in-depth info, please watch the video at this{" "}
            <a target="_blank" rel="noreferrer" href={youtubeLink}>
              link
            </a>{" "}
            (or watch it directly below).
          </Fragment>,
          <Fragment key="p1-2">
            You should also visit our <Link to="/faq">FAQ section</Link> which
            contain answers to most questions.
          </Fragment>,
        ],
        p2: [
          <Fragment key="p2-1">
            We also prepare a{" "}
            <a target="_blank" rel="noreferrer" href={slideLink}>
              slide
            </a>
            , describing the tool functionalities.
          </Fragment>,
          <Fragment key="p2-2">
            If you need any more info, don&apos;t hesitate to get in touch
            directly: <Link to="/feedback">feedback form</Link>
          </Fragment>,
        ],
      },
    },
  };
};

export default homeContent;
