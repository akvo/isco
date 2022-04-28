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
            For project questionnaires (not applicable for DISCO), colleagues
            from selected project partner organisations, that are also Members
            of GISCO or Beyond Chocolate, with authorized access to project
            questionnaires, will have the same access to data of the
            questionnaire for the project in which their own organisation is
            participating as a partner.
          </li>
          <li>
            Once the questionnaire is submitted, a limited number of staff
            designated by the GISCO, DISCO and/or Beyond Chocolate Secretariats,
            as well as C-Lever.org listed in the Data Security Provisions and
            having signed corresponding nondisclosure declarations, will have
            access to individual questionnaire data as needed to check the
            validity and consistency of data and/or check whether the
            conclusions from analysis on anonymized and/or aggregated data makes
            sense.
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
    h: "Double counting – How is double counting of project data and other data being avoided?",
    c: (
      <Fragment>
        <p>
          Members / partners can report on all their cocoa sustainability
          projects/ programmes, without requiring a link to a specific market.
          However, each such project/ programme shall be reported only once.
          Projects/ programmes implemented jointly by several GISCO and / or
          Beyond Chocolate members / partners will be reported on only once.
        </p>
        <p>
          The transition towards a joint reporting tool for the European
          platforms ensures that companies and other organisations, that are a
          member of multiple (or all) European platforms, will have to report on
          the same data only once. This single reporting contributes to avoiding
          double counting.
        </p>
        <p>
          Cocoa sustainability project/ programme managers are encouraged to
          avoid double counting within their own reporting to GISCO and Beyond
          Chocolate.
        </p>
        <p>
          However, at this stage it may for example not be excluded that a same
          farming household is reported as reached by more than one project
          /programme. Further analyses will show whether such double counting
          occurs to a significant extent and, if so, what approach should be
          taken to correct it.
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
    h: "Mandatory questions - Can I submit a questionnaire without completing all the mandatory questions?",
    c: (
      <Fragment>
        <p>
          It is highly appreciated that all mandatory questions are answered
          (completed) before submitting the questionnaire.
        </p>
        <p>
          However, if you are not able to fill in all the mandatory questions
          for various reasons you can still submit the data by clicking on the
          submit button and confirming the acknowledgement checkboxes:
          <ul>
            <li>
              I have checked and tried to complete all mandatory questions that
              are marked as still to be completed.
            </li>
            <li>
              I have used the comments boxes in the corresponding question
              groups to explain why I cannot complete the still uncompleted
              mandatory questions.
            </li>
          </ul>
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
            questionnaire. To activate such download, please first click the
            Overview button at the left of your screen (above the question group
            navigation menu in the left column of the screen).
          </li>
        </ol>
      </Fragment>
    ),
  },
  {
    h: "Time frame - For which time frame shall I report the data?",
    c: (
      <Fragment>
        <ol type="1">
          <li>
            The reporting year is normally the previous calendar year – e.g.
            reporting on 2020 to be done in April-May 2021; reporting on 2021 to
            be done in April-May 2022. Except for DISCO in which reporting on
            2020 and 2021 will be done both in April-May 2022.
          </li>
          <li>
            If the member organisation is using a reporting cycle and an
            accounting year that differs from the calendar year, and if
            reporting per calendar year would significantly enhance the
            reporting burden, then that member can choose to systematically
            report for its last accounting year for which data is available in
            the April-May period.
          </li>
          <li>
            Generally, the time frame for all data is the reporting year.
            However, for some questions (e.g. household income data), data might
            be collected only every few years. The corresponding questions
            specifically cater for this by asking when the last survey/study was
            conducted.
          </li>
          <li>
            If for some questions, only older data are available, please provide
            such older data and indicate this in the comment box.
          </li>
        </ol>
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
    h: "Shall standard setters report on sourcing data?",
    c: (
      <Fragment>
        <p>
          No, because standard setters are not sourcing and supplying the
          market. The companies for which they are certifying are already
          expected to provide these sourcing data. Exception: However, the
          standard setting members of GISCO or partners of Beyond Chocolate are
          expected to provide certified volume under the corresponding platform
          scope questions.
        </p>
      </Fragment>
    ),
  },
  {
    h: "Who should report on Premiums?",
    c: (
      <Fragment>
        <p>
          Premium related questions are to be completed only by supply chain
          actors that are member of GISCO or partner of Beyond Chocolate. Please
          report if premiums were paid for any volume of cocoa sourced by or on
          behalf of your organisation / company.
        </p>
        <p>
          You are only expected to report on premiums paid on your behalf, if
          your supplier (who managed the premium payments on your behalf), is
          not reporting such payments as part of the ISCO reporting. In other
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
  {
    h: "Which data / survey sections are related to destination markets (=national consumer markets?",
    c: (
      <Fragment>
        <p>
          Destination market specific data are provided under the scope section
          particular to each platform. For the sourcing sections, respondents
          may opt between providing destination specific data or global average
          data.
        </p>
      </Fragment>
    ),
  },
];

const faqDe = [
  {
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
            Bei Projektfragebögen haben Kolleginnen und Kollegen der als
            Projektpartner angegebenen Organisationen, die ebenfalls Mitglieder
            des Kakaoforums oder von Beyond Chocolate sind und über
            autorisierten Zugriff auf das Monitoringsystem verfügen, denselben
            Zugriff auf die Daten des Fragebogens für das Projekt, an dem Ihre
            eigene Organisation als Partner teilnimmt.
          </li>
          <li>
            Sobald der Fragebogen eingereicht wurde, hat eine begrenzte Anzahl
            von autorisierten Personen der Geschäftsstelle des Kakaoforums und
            von C-Lever, die in den Datenschutzbestimmungen aufgeführt sind und
            entsprechende Vertraulichkeitserklärungen unterzeichnet haben,
            Zugriff auf einzelne Fragebogendaten, um die Gültigkeit und die
            Konsistenz der Daten zu überprüfen und/oder um zu überprüfen, ob die
            Schlussfolgerungen aus der Analyse anonymisierter und/oder
            aggregierter Daten schlüssig sind. Für Mitglieder mehrerer
            Plattformen gilt, dass außerdem ausgewählte Personen von Beyond
            Chocolate und/oder DISCO Zugriff haben.
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
    h: "Doppelzählung - Wie wird eine Doppelzählung von Projektdaten und anderen Daten vermieden?",
    c: (
      <Fragment>
        <p>
          Mitglieder / Partner können über alle ihre
          Kakao-Nachhaltigkeitsprojekte/-programme berichten, ohne eine
          Verbindung zum jeweiligen Markt zu benötigen. Jedes dieser
          Projekte/Programme wird jedoch nur einmal gemeldet. Projekte /
          Programme, die von mehreren Mitgliedern /Partnern des Kakaoforums und
          / oder Beyond Chocolate gemeinsam durchgeführt werden, werden nur
          einmal erfasst.
        </p>
        <p>
          Der Übergang zu einem gemeinsamen Berichtstool für die europäischen
          Plattformen stellt sicher, dass Unternehmen und andere Organisationen,
          die Mitglied mehrerer (oder aller) europäischer Plattformen sind, nur
          einmal über dieselben Daten berichten müssen. Dies trägt zur
          Vermeidung von Doppelzählungen bei.
        </p>
        <p>
          Kakao-Nachhaltigkeitsprojekt-/ Programmmanager*innen werden
          aufgefordert, Doppelzählungen innerhalb ihrer eigenen
          Berichterstattung zu vermeiden.
        </p>
        <p>
          Zum jetzigen Zeitpunkt kann jedoch beispielsweise nicht ausgeschlossen
          werden, dass ein bäuerlicher Haushalt von mehr als einem Projekt /
          Programm als „erreicht“ gemeldet wird. Weitere Analysen werden zeigen,
          ob eine solche Doppelzählung mit einer signifikanten Rate auftritt und
          wenn ja, welcher Ansatz zur Korrektur dieser Doppelzählung verwendet
          werden sollte.
        </p>
      </Fragment>
    ),
  },
  {
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
    h: "Obligatorische Fragen - Kann ich einen Fragebogen einreichen, ohne alle obligatorischen Fragen auszufüllen?",
    c: (
      <Fragment>
        <p>
          Bitte beatworten Sie alle obligatorischen Fragen vor dem Absenden des
          Fragebogens.
        </p>
        <p>
          Falls Sie jedoch aus verschiedenen Gründen nicht alle obligatorischen
          Fragen ausfüllen können, können Sie die Daten dennoch übermitteln.
          Klicken Sie dazu auf die Schaltfläche &quot;Senden&quot; und
          bestätigen Sie die Kontrollkästchen:
          <ul>
            <li>
              Ich habe alle Pflichtfragen überprüft und versucht, die als nicht
              ausgefüllt markierten Felder zu beantworten.
            </li>
            <li>
              Ich habe die Kommentarfelder in den entsprechenden Fragengruppen
              verwendet, um zu erklären, warum ich die nicht ausgefüllten
              Pflichtfragen nicht ausfüllen kann.
            </li>
          </ul>
        </p>
      </Fragment>
    ),
  },
  {
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
            ermöglichen, bevor der Fragebogen eingereicht wird. Um einen solchen
            Download zu aktivieren, klicken Sie zunächst links auf dem
            Bildschirm auf die Schaltfläche „Übersicht“ (über dem
            Navigationsmenü der Fragengruppe in der linken Spalte des
            Bildschirms).
          </li>
        </ol>
      </Fragment>
    ),
  },
  {
    h: "Zeitrahmen - Für welchen Zeitraum soll ich die Daten melden?",
    c: (
      <Fragment>
        <ol type="1">
          <li>
            Das Berichtsjahr ist normalerweise das vorherige Kalenderjahr - z.B.
            Berichterstattung über 2020 im Mai 2021; Berichterstattung über 2021
            von im Mai 2022. (Ausnahme: DISCO Mitglieder)
          </li>
          <li>
            Wenn die Mitgliedsorganisation einen vom Kalenderjahr abweichenden
            Berichtszyklus und ein Rechnungsjahr verwendetund die
            Berichterstattung pro Kalenderjahr die Berichtslast erheblich
            erhöhen würde, kann dieses Mitglied systematisch über das letzte
            Rechnungsjahr berichten, für das Daten im Zeitraum April bis Mai
            vorliegen.
          </li>
          <li>
            Im Allgemeinen ist der Zeitrahmen für alle Daten das Berichtsjahr.
            Bei einigen Fragen (z. B. Daten zum Haushaltseinkommen) werden Daten
            möglicherweise nicht jährlich erhoben. Die entsprechenden Fragen
            berücksichtigen dies, indem sie fragen, wann die letzte Umfrage
            /Studie durchgeführt wurde.
          </li>
          <li>
            Wenn für einige Fragen nur ältere Daten verfügbar sind, geben Sie
            diese bitte an und erklären Sie dies im Kommentarfeld.
          </li>
        </ol>
      </Fragment>
    ),
  },
  {
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
    h: "Sollen die Standardsetzer über die Beschaffungsdaten berichten?",
    c: (
      <Fragment>
        <p>
          Nein, denn die standardsetzenden Organisationen beschaffen und
          beliefern den Markt nicht. Von den Unternehmen, für die sie
          zertifizieren, wird bereits erwartet, dass sie diese Beschaffungsdaten
          bereitstellen. Ausnahme: Von den standardsetzenden Mitgliedern von
          GISCO oder Partnern von Beyond Chocolate wird jedoch erwartet, dass
          sie über von ihnen zertifizierte Mengen berichten.
        </p>
      </Fragment>
    ),
  },
  {
    h: "Wer sollte über Prämien berichten?",
    c: (
      <Fragment>
        <p>
          Die Fragen zu Prämienzahlungen sind nur von Akteuren der Lieferkette
          auszufüllen, die Mitglied von GISCO oder Partner von Beyond Chocolate
          sind. Bitte geben Sie an, ob Prämien für Kakao gezahlt wurden, der von
          oder im Namen Ihrer Organisation/Ihrem Unternehmen bezogen wurde.
        </p>
        <p>
          Sie müssen nur dann über die in Ihrem Namen gezahlten Prämien
          berichten, wenn Ihr Lieferant (der die Prämienzahlungen in Ihrem Namen
          verwaltet hat) solche Zahlungen nicht im Rahmen der
          ISCO-Berichterstattung selbst angibt. Mit anderen Worten: Wenn ein
          Unternehmen diesen Fragenblock ausfüllt, wird von den
          Kundenunternehmen nicht erwartet, dass sie die bereits gemeldeten
          Prämienzahlungen erneut melden. Die gleichen Prämien sollten nur
          einmal gemeldet werden.
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
  {
    h: "Welche Daten / Erhebungsabschnitte beziehen sich auf Zielmärkte (= nationale Verbrauchermärkte)",
    c: (
      <Fragment>
        <p>
          Zielmarktspezifische Daten werden im Abschnitt über den
          Geltungsbereich der einzelnen Plattformen angegeben. In den
          Abschnitten über die Beschaffung können die Befragten wählen, ob sie
          zielgebietsspezifische Daten oder globale Durchschnittsdaten
          bereitstellen.
        </p>
      </Fragment>
    ),
  },
];

const faqContent = {
  en: faqEn,
  de: faqDe,
};

export default faqContent;
