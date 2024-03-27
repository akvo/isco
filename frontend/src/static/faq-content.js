import React, { Fragment } from "react";

const faqEn = [
  {
    h: "Access to data - Who can view or access the data that I enter via a questionnaire?",
    c: (
      <Fragment>
        <p>
          The data that is entered via the questionnaires can be accessed by:
        </p>
        <ol type="a">
          <li>
            The colleagues from your own organisation who are added as users to
            the portal. As long as the questionnaire is not submitted, they can
            access and edit data of the questionnaire.
          </li>
          <li>
            For project questionnaires (only applicable to GISCO), colleagues
            from selected project partner organisations, that are also Members
            of GISCO with authorized access to project questionnaires, will have
            the same access to data of the questionnaire for the project in
            which their own organisation is participating as a partner.
          </li>
          <li>
            Once the questionnaire is submitted, a limited number of staff
            designated by the GISCO, FRISCO, DISCO, SWISSCO and/or Beyond
            Chocolate Secretariats, as well as C-Lever.org listed in the Data
            Security Provisions and having signed corresponding nondisclosure
            declarations, will have access to individual questionnaire data as
            needed to check the validity and consistency of data and/or check
            whether the conclusions from analysis on anonymized and/or
            aggregated data makes sense.
          </li>
          <li>
            Authorized staff of AKVO, being the contracted IT service
            provider/data processors for the system. Their role is limited to
            intervening when IT issues occur and providing data processing
            support.
          </li>
        </ol>
        <br />
        <p>
          Other users of the platform or other organisations do not have any
          access to the data that you enter.
        </p>
        <p>
          Please also check on the Impressum tab under &quot;Responsible for the
          technical realization&quot;.
        </p>
      </Fragment>
    ),
  },
  {
    h: "What happens if I don't report? Is reporting obligatory? ",
    c: (
      <Fragment>
        <p>
          Reporting is obligatory for members of Beyond Chocolate, DISCO, GISCO
          and SWISSCO. If a member does not report within the given timeframe
          (by April 15th), next steps will be taken by the ISCOs in accordance
          with the agreed processes and procedures. If a member fails to report,
          exclusion from the ISCO in question is a possibility.
        </p>
        <p>
          Please note that for FRISCO this monitoring round is a pilot. FRISCO
          members have an extended deadline until June 2024.
        </p>
      </Fragment>
    ),
  },
  {
    h: "Issues - How do I report an issue/ request support?",
    c: (
      <Fragment>
        <p>
          The portal administrators can be contacted using the feedback form. To
          go to that form, please select Feedback in the top menu. Once you
          submit an issue/request, the portal administrators will contact you as
          soon as possible.
        </p>
      </Fragment>
    ),
  },
  {
    h: "Who needs to report what?",
    c: (
      <Fragment>
        <p>
          In principle the questionnaire will only display the questions you
          need to report on, based on the combination of your organisation’s /
          company’s member type and the platform(s) your organisation is a
          member of.
        </p>
      </Fragment>
    ),
  },
  {
    h: "Time frame - For which time frame shall I report the data?",
    c: (
      <Fragment>
        <ol type="1">
          <li>
            The reporting year is normally the previous calendar year - e.g.
            reporting on 2023 to be done in March/April 2024.
          </li>
          <li>
            If the member organisation is using a reporting cycle and an
            accounting year that differs from the calendar year, and if
            reporting per calendar year would significantly enhance the
            reporting burden, then that member can choose to systematically
            report for its last accounting year for which data is available in
            the March/April period
          </li>
          <li>
            Generally, the time frame for all data is the reporting year.
            However, for some questions in the project questionnaire (e.g.
            household income data), data might be collected only every few
            years. The corresponding questions specifically cater for this by
            asking when the last survey/study was conducted.
          </li>
          <li>
            If for some questions, only older data are available, please provide
            such older data and indicate this in the comment box.
          </li>
          <li>
            For the section on Child Labour you can choose if you want to report
            for the Calendar Year or the Cocoa Year (ICI’s timeframe)
          </li>
        </ol>
      </Fragment>
    ),
  },
  {
    h: "Decimals - Why cannot I enter numbers with decimals (,)?",
    c: (
      <Fragment>
        <p>
          Please use a dot (.), instead of a comma (,)! The dot (.) is the only
          decimal separator supported by the system.
        </p>
      </Fragment>
    ),
  },
  {
    h: "Which data / survey sections are related to destination markets (=national consumer markets)?",
    c: (
      <Fragment>
        <p>
          Destination market specific data are provided under the
          &quot;transparency & traceability&quot; section. Market specific data
          will be asked for sourcing (processing & selling on the national
          market) and certification.
        </p>
      </Fragment>
    ),
  },
  {
    h: "What if I get an error message when trying to submit?",
    c: (
      <Fragment>
        <p>
          If you receive an error message when submitting, this is probably
          because:
          <ul>
            <li>
              You have not replied to a mandatory question. These questions are
              indicated with an asterisk. For example, reporting on sourcing
              volumes is mandatory.
            </li>
            <li>
              You have reported on a wrong numeric value. For example, you have
              reported on a percentage that is over 100%.
            </li>
          </ul>
        </p>
        <p>
          When you receive this error, please go back to the questionnaire and
          ensure your reporting is complete and correct. If you are not able to
          report on a certain mandatory question, please explain why in the
          comment section, click on submit and then clicl on the acknowledgement
          checkboxes. The relevant ISCO secretariats will take up contact for
          further follow-up.
        </p>
      </Fragment>
    ),
  },
  {
    h: "Reporting by project managers - Can I delegate the reporting of our projects/ programs to project/program managers, inside or outside of my organisation?",
    c: (
      <Fragment>
        <ol type="1">
          <li>
            Colleagues from your own organisation who are added as users to the
            portal with authorization to create/edit project questionnaires, can
            view and edit data of your organisation’s project questionnaires.
            You should agree among colleagues of the same organisation as to
            whom will complete/review project data before submission of the
            completed questionnaire.
          </li>
          <li>
            For a cocoa sustainability project /programme that is jointly
            implemented by different member organisations, only one
            questionnaire should be created; this is to be done by the member
            designated as the coordinating or lead partner for that project.
          </li>
          <li>
            Access to the corresponding project questionnaire will be granted to
            all colleagues from the selected project partner organisations who
            are registered as users of the platform with authorised access to
            project questionnaires. Please refer to the FAQ topic Adding
            Collaborators for more explanations on how to grant access to a
            specific project questionnaire for partner organisations. Please
            note that you should agree among colleagues of the different project
            partner organisations as to whom will complete/review project data
            before submission of the completed questionnaire.
          </li>
          <li>
            There is also the possibility to download the data of a
            (fully/partially) completed questionnaire to allow for offline
            review and/or contribution by a colleague before submitting the
            questionnaire.
          </li>
        </ol>
      </Fragment>
    ),
  },
  {
    h: "Who should report on Premiums?",
    c: (
      <Fragment>
        <p>
          Premium related questions are to be completed only by supply chain
          actors that are member of GISCO. Please report if premiums were paid
          for any volume of cocoa sourced by or on behalf of your organisation /
          company.
        </p>
        <p>
          You are only expected to report on premiums paid on your behalf, if
          your supplier (who managed the premium payments on your behalf), is
          not reporting such payments as part of the GISCO reporting. In other
          words, if a company is reporting on this question block, the client
          companies are not expected to report again on the already reported
          premium payments. The same premiums should be reported only once.
        </p>
        <p>
          Note that it is mandatory to report on sourcing in Côte d&apos;Ivoire
          and in Ghana separately, while for other countries you can choose to:
          <ul>
            <li>
              (a) provide country-specific data per country where you sourced
              cocoa with premiums;
            </li>
            <li>(b) provide only aggregated data.</li>
          </ul>
        </p>
        <p>Premium data is not to be disaggregated per destination market.</p>
      </Fragment>
    ),
  },
];

const faqDe = [
  {
    en: "Access to data - Who can view or access the data that I enter via a questionnaire?",
    h: "Zugriff auf Daten - Wer kann die von mir über einen Fragebogen eingegebenen Daten einsehen oder darauf zugreifen?",
    c: (
      <Fragment>
        <p>
          Auf die Daten, die über die Fragebögen eingegeben werden, kann
          zugegriffen werden durch:
        </p>
        <ol type="a">
          <li>
            Die Kolleginnen und Kollegen aus Ihrer eigenen Organisation, die je
            nach Art des Zugriffs (Mitgliederfragebogen, Projektfragebogen oder
            beides) als Nutzende zum Portal hinzugefügt werden. Solange der
            Fragebogen noch nicht eingereicht ist, können sie auf die Daten des
            Fragebogens zugreifen und diese bearbeiten.
          </li>
          <li>
            ei Projektfragebögen (nur relevant für das Forum Nachhaltiger Kakao)
            haben Kolleginnen und Kollegen der als Projektpartner angegebenen
            Organisationen, die ebenfalls Mitglieder des Kakaoforums sind und
            über autorisierten Zugriff auf das Monitoringsystem verfügen,
            denselben Zugriff auf die Daten des Fragebogens für das Projekt, an
            dem Ihre eigene Organisation als Partner teilnimmt.
          </li>
          <li>
            Sobald der Fragebogen eingereicht wurde, hat eine begrenzte Anzahl
            von autorisierten Personen der Geschäftsstelle des Kakaoforums und
            von C-Lever.org und Mainlevel, die in den Datenschutzbestimmungen
            aufgeführt sind und entsprechende Vertraulichkeitserklärungen
            unterzeichnet haben, Zugriff auf einzelne Fragebogendaten, um die
            Gültigkeit und die Konsistenz der Daten zu überprüfen und/oder um zu
            überprüfen, ob die Schlussfolgerungen aus der Analyse anonymisierter
            und/oder aggregierter Daten schlüssig sind. Für Mitglieder mehrerer
            Plattformen gilt, dass außerdem ausgewählte Personen von Beyond
            Chocolate, DISCO und/oder SWISSCO Zugriff haben.
          </li>
          <li>
            Autorisierte Mitarbeitende von AKVO als beauftragter
            IT-Dienstleister/Datenverarbeiter für das System. Ihre Rolle
            beschränkt sich darauf, bei IT-Problemen einzugreifen und
            Unterstützung für die Datenverarbeitung bereitzustellen.
          </li>
        </ol>
        <p>
          Andere Nutzende der Plattform oder andere Organisationen haben keinen
          Zugriff auf die von Ihnen eingegebenen Daten.
        </p>
        <p>
          Bitte prüfen Sie auch unter der Registerkarte Impressum den Punkt
          „Verantwortlich für die technische Umsetzung&quot;.
        </p>
      </Fragment>
    ),
  },
  {
    en: "What happens if I don't report? Is reporting obligatory?",
    h: "Was passiert, wenn ich mich nicht melde? Ist eine Berichterstattung obligatorisch?",
    c: (
      <Fragment>
        <p>
          Die Berichterstattung ist für Mitglieder von Beyond Chocolate, DISCO,
          SWISSCO und dem Forum Nachhaltiger Kakao obligatorisch. Berichtet ein
          Mitglied nicht innerhalb des vorgegebenen Zeitrahmens (bis zum 15.
          April), werden die nächsten Schritte in Übereinstimmung mit den
          vereinbarten Prozessen und Verfahren von denn ISCOs eingeleitet.
          Berichtet ein Mitglied nicht, ist ein Ausschluss aus dem jeweiligen
          ISCO möglich.
        </p>
        <p>
          Bitte beachten Sie, dass es sich für FRISCO um ein Pilotprojekt
          handelt. FRISCO-Mitglieder haben bis Juni 2024 Zeit um die Daten
          einzugeben.
        </p>
      </Fragment>
    ),
  },
  {
    en: "Issues - How do I report an issue/ request support?",
    h: "Probleme - Wie melde ich ein Problem / fordere ich Unterstützung an?",
    c: (
      <Fragment>
        <p>
          Die Portaladministration kann über das Feedback-Formular kontaktiert
          werden. Um zu diesem Formular zu gelangen, wählen Sie bitte Feedback
          im Menü oben links/in der Mitte des Bildschirms. Sobald Sie ein
          Problem/eine Anfrage eingereicht haben, wird sich jemand so schnell
          wie möglich mit Ihnen in Verbindung setzen.
        </p>
      </Fragment>
    ),
  },
  {
    en: "Who needs to report what?",
    h: "Wer muss über was berichten?",
    c: (
      <Fragment>
        <p>
          Im Prinzip zeigt der Fragebogen nur die Fragen an, zu denen Sie
          Bericht erstatten müssen, und zwar auf der Grundlage der Kombination
          aus der Mitgliedsart Ihrer Organisation/Ihres Unternehmens und der
          Plattform(en), bei der Ihre Organisation Mitglied ist.
        </p>
      </Fragment>
    ),
  },
  {
    en: "Time frame - For which time frame shall I report the data?",
    h: "Zeitrahmen - Für welchen Zeitraum soll ich die Daten melden?",
    c: (
      <Fragment>
        <ol type="1">
          <li>
            Das Berichtsjahr ist normalerweise das vorherige Kalenderjahr - z.B.
            Berichterstattung über 2023 im March/April 2024.
          </li>
          <li>
            Wenn die Mitgliedsorganisation einen vom Kalenderjahr abweichenden
            Berichtszyklus und ein Rechnungsjahr verwendet und die
            Berichterstattung pro Kalenderjahr die Berichtslast erheblich
            erhöhen würde, kann dieses Mitglied systematisch über das letzte
            Rechnungsjahr berichten, für das Daten im March/April vorliegen.
          </li>
          <li>
            Im Allgemeinen ist der Zeitrahmen für alle Daten das Berichtsjahr.
            Bei einigen Fragen (z. B. Daten zum Haushaltseinkommen im
            Projektfragebogen) werden Daten möglicherweise nicht jährlich
            erhoben. Die entsprechenden Fragen berücksichtigen dies, indem sie
            fragen, wann die letzte Umfrage /Studie durchgeführt wurde.
          </li>
          <li>
            Wenn für einige Fragen nur ältere Daten verfügbar sind, geben Sie
            diese bitte an und erklären Sie dies im Kommentarfeld.
          </li>
          <li>
            Für den Abschnitt zu Kinderarbeit können Sie wählen, ob Sie für das
            Kalenderjahr oder das Kakaojahr (ICI-Zeitrahmen) berichten möchten.
          </li>
        </ol>
      </Fragment>
    ),
  },
  {
    en: "Decimals - Why cannot I enter numbers with decimals (,)?",
    h: "Dezimalstellen - Warum kann ich keine Zahlen mit Dezimalstellen eingeben?",
    c: (
      <Fragment>
        <p>
          Verwenden Sie bitte einen Punkt (.) anstelle eines Kommas (,)! Der
          Punkt (.) ist das einzige vom System unterstützte Dezimaltrennzeichen.
        </p>
      </Fragment>
    ),
  },
  {
    en: "Which data / survey sections are related to destination markets (=national consumer markets)?",
    h: "Welche Daten / Erhebungsabschnitte beziehen sich auf Zielmärkte (= nationale Verbrauchermärkte)",
    c: (
      <Fragment>
        <p>
          Bestimmungsmarktspezifische Daten werden unter dem Abschnitt
          &quot;Transparenz und Rückverfolgbarkeit&quot; angegeben.
          Marktspezifische Daten werden für die Beschaffung (Verarbeitung und
          Verkauf auf dem nationalen Markt) und Zertifizierung abgefragt.
        </p>
      </Fragment>
    ),
  },
  {
    en: "What if I get an error message when trying to submit?",
    h: "Was ist, wenn ich eine Fehlermeldung erhalte, wenn ich versuche, das Formular abzuschicken?",
    c: (
      <Fragment>
        <p>
          Wenn Sie beim Absenden eine Fehlermeldung erhalten, liegt das
          wahrscheinlich daran, dass:
          <ul>
            <li>
              Sie eine Pflichtfrage nicht beantwortet haben. Diese Fragen sind
              mit einem Sternchen gekennzeichnet. Zum Beispiel ist die Angabe
              des Beschaffungsvolumens obligatorisch.
            </li>
            <li>
              Sie haben einen falschen numerischen Wert angegeben. Sie haben z.
              B. einen Prozentsatz angegeben, der über 100 % liegt.
            </li>
          </ul>
        </p>
        <p>
          Wenn Sie diese Fehlermeldung erhalten, gehen Sie bitte zum Fragebogen
          zurück und stellen Sie sicher, dass Ihre Angaben vollständig und
          korrekt sind. Wenn Sie eine bestimmte obligatorische Frage nicht
          beantworten können, erläutern Sie bitte den Grund dafür im
          Kommentarfeld, klicken Sie auf &quot;Absenden&quot;und dann auf die
          Kontrollkästchen für die Bestätigung. Die zuständigen
          ISCO-Sekretariate werden sich mit Ihnen in Verbindung setzen, um
          weitere Schritte zu besprechen.
        </p>
      </Fragment>
    ),
  },
  {
    en: "Reporting by project managers - Can I delegate the reporting of our projects/ programs to project/program managers, inside or outside of my organisation?",
    h: "Berichterstattung durch Projektmanager und/oder Projektmanagerinnen - Kann ich die Berichterstattung über unsere Projekte/Programme an Projekt-/Programmmanager bzw. --managerinnen innerhalb oder außerhalb meiner Organisation delegieren?",
    c: (
      <Fragment>
        <ol type="1">
          <li>
            Kolleginnen und Kollegen aus Ihrer eigenen Organisation, die mit der
            Berechtigung zum Erstellen/Bearbeiten von Projektfragebögen zum
            Portal hinzugefügt werden, können Daten der Projektfragebögen Ihrer
            Organisation einsehen und bearbeiten. Sie sollten sich unter
            Kolleginnen und Kollegen derselben Organisation darauf einigen, wer
            die Projektdaten ausfüllen/überprüfen wird, bevor Sie den
            ausgefüllten Fragebogen einreichen.
          </li>
          <li>
            Für ein Kakao-Nachhaltigkeitsprojekt/-programm, das von
            verschiedenen Kakaoforums-Mitgliedsorganisationen gemeinsam
            durchgeführt wird, sollte nur ein Fragebogen erstellt werden. Dies
            muss von dem Kakaoforumsmitglied durchgeführt werden, das als
            koordinierender oder federführender Partner für dieses Projekt
            bestimmt ist.
          </li>
          <li>
            Der Zugriff auf den entsprechenden Projektfragebogen wird allen
            Kolleginnen und Kollegen der ausgewählten
            organisationProjektpartnerorganisationen gewährt, die als Benutzer
            der Plattform mit autorisiertem Zugriff auf Projektfragebögen
            registriert sind. Weitere Erläuterungen zum Gewähren des Zugriffs
            auf einen bestimmten Projektfragebogen für
            organisationPartnerorganisationen finden Sie im FAQ-Thema Hinzufügen
            von Mitarbeitern. Bitte beachten Sie, dass Sie unter den Kolleginnen
            und Kollegen der verschiedenen Projektpartnerorganisationen
            vereinbaren sollten, wer die Projektdaten ausfüllet/überprüft, bevor
            Sie den ausgefüllten Fragebogen einreichen.
          </li>
          <li>
            Es besteht auch die Möglichkeit, die Daten eines
            (vollständig/teilweise) ausgefüllten Fragebogens herunterzuladen, um
            eine Offline-Überprüfung durch einen Kollegen oder eine Kollegin zu
            ermöglichen, bevor der Fragebogen eingereicht wird.
          </li>
        </ol>
      </Fragment>
    ),
  },
  {
    en: "Who should report on Premiums?",
    h: "Wer sollte über Prämien berichten?",
    c: (
      <Fragment>
        <p>
          Die Fragen zu Prämienzahlungen sind nur von Akteuren der Lieferkette
          auszufüllen, die Mitglied von GISCO sind. Bitte geben Sie an, ob
          Prämien für Kakao gezahlt wurden, der von oder im Namen Ihrer
          Organisation/Ihrem Unternehmen bezogen wurde.
        </p>
        <p>
          Sie müssen nur dann über die in Ihrem Namen gezahlten Prämien
          berichten, wenn Ihr Lieferant (der die Prämienzahlungen in Ihrem Namen
          verwaltet hat) solche Zahlungen nicht im Rahmen der Berichterstattung
          des Forums selbst angibt. Mit anderen Worten: Wenn ein Unternehmen
          diesen Fragenblock ausfüllt, wird von den Kundenunternehmen nicht
          erwartet, dass sie die bereits gemeldeten Prämienzahlungen erneut
          melden. Die gleichen Prämien sollten nur einmal gemeldet werden.
        </p>
        <p>
          Bitte beachten Sie, dass es verpflichtend ist, über die Beschaffung in
          Côte d&apos;Ivoire und in Ghana separat zu berichten, während Sie für
          andere Länder wählen können zwischen:
          <ul>
            <li>
              (a) länderspezifische Daten für jedes Land, aus dem Sie Kakao mit
              Prämien bezogen haben,
            </li>
            <li>(b) nur aggregierte Daten bereitstellen.</li>
          </ul>
        </p>
        <p>Die Prämiendaten werden nicht nach Zielmärkten aufgeschlüsselt.</p>
      </Fragment>
    ),
  },
];

const faqContent = {
  en: faqEn,
  de: faqDe,
};

export default faqContent;
