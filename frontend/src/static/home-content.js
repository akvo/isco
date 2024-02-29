import React, { Fragment } from "react";
import { Link } from "react-router-dom";

const homeContent = (handleShow) => {
  return {
    en: {
      h: "WELCOME TO THE COCOA MONITORING OF BEYOND CHOCOLATE, DISCO, FRISCO, GISCO AND SWISSCO!",
      p1: "Dear Participants,",
      p2: (
        <Fragment>
          Thank you for participating in the 2024 monitoring round of Beyond
          Chocolate, DISCO, FRISCO, GISCO and SWISSCO. Your reporting is
          essential to help us track the progress of the ISCOs and to define
          action points for the future. You can start your reporting by going to
          the survey tab at the top of the screen and/or by scrolling down.
          <br />
          Your feedback on the monitoring system is very valuable to us – you
          can provide feedback in the feedback section (menu above) or in the
          comment fields in the questionnaires.
          <br />
          Under this{" "}
          <Link onClick={handleShow} to="#">
            link
          </Link>
          {", "}
          you find the data security and confidentiality measures taken.
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
      h: "WILLKOMMEN BEIM MONITORING DES FORUM NACHHALTIGER KAKAO, BEYOND CHOCOLATE, DISCO, FRISCO UND SWISSCO!",
      p1: "Liebe Teilnehmerinnen und Teilnehmer,",
      p2: (
        <Fragment>
          Liebe Teilnehmerinnen und Teilnehmer, vielen Dank für Ihre Teilnahme
          an der Monitoringrunde 2024. Ihre Berichterstattung ist wichtig, damit
          wir die Fortschritte der ISCOs verfolgen und Aktionspunkte für die
          Zukunft festlegen können. Sie können mit der Berichterstattung
          beginnen, indem Sie an den oberen Rand des Bildschirms gehen und/oder
          nach unten scrollen.
          <br />
          Ihre Rückmeldungen zum Monitoringsystem sind für uns sehr wertvoll –
          Sie können diese im Feedbackformular (im Menu oben) oder in den
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
