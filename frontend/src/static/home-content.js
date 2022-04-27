import React, { Fragment } from "react";
import { Link } from "react-router-dom";

const homeContent = (handleShow) => {
  return {
    en: {
      h: "WELCOME TO THE COCOA MONITORING OF DISCO, BEYOND CHOCOLATE AND GISCO!",
      p1: "Dear Participants,",
      p2: (
        <Fragment>
          Thank you for participating in the 2022 monitoring round of GISCO,
          DISCO and Beyond Chocolate. Your comments on the monitoring system are
          very valuable for us – you can give them in the feedback section (menu
          above) or in the comment fields in the questionnaires.
          <br />
          <Link onClick={handleShow} to="#">
            Under this link you find the
          </Link>{" "}
          data security and confidentiality measures taken.
          <br />
          <br />
          Thank you very much for your contribution to making the cocoa sector
          more transparent!
        </Fragment>
      ),
      gettingStarted: {
        h: "Getting Started",
        p1: [
          <Fragment key="p1-2">
            You should also visit our <Link to="/faq">FAQ section</Link> which
            contain answers to most questions.
          </Fragment>,
        ],
        p2: [
          <Fragment key="p2-2">
            If you need any more info, don&apos;t hesitate to get in touch
            directly: <Link to="/feedback">feedback form</Link>.
          </Fragment>,
        ],
      },
    },

    de: {
      h: "Willkommen beim Monitoring des Forum Nachhaltiger Kakao, Beyond Chocolate und DISCO!",
      p1: "Liebe Teilnehmerinnen und Teilnehmer,",
      p2: (
        <Fragment>
          vielen Dank für Ihre Teilnahme an der Monitoringrunde 2022. Ihre
          Kommentare zum Monitoringsystem sind für uns sehr wertvoll – Sie
          können diese im Feedbackformular (im Menu oben) oder in den
          Kommentarfeldern der Fragebögen machen.
          <br />
          Unter diesem{" "}
          <Link onClick={handleShow} to="#">
            Link
          </Link>{" "}
          finden Sie die Datensicherheits- und Datenvertraulichkeitsmaßnahmen.
          <br />
          <br />
          Vielen Dank für Ihren Beitrag zur mehr Transparenz bezüglich
          Nachhaltigkeit im Kakaosektor!
        </Fragment>
      ),
      gettingStarted: {
        h: "Loslegen",
        p1: [
          <Fragment key="p1-2">
            Im <Link to="/faq">FAQ Bereich</Link> finden Sie Antworten zu vielen
            Fragen.
          </Fragment>,
        ],
        p2: [
          <Fragment key="p2-2">
            Falls Sie mehr Informationen benötigen, zögern Sie nicht mit uns in
            Kontakt zu treten, z.B. über das{" "}
            <Link to="/feedback">Feedback-Formular</Link>.
          </Fragment>,
        ],
      },
    },
  };
};

export default homeContent;
