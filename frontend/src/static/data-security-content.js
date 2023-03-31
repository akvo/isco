import React, { Fragment } from "react";

const dataSecurityContent = {
  en: (
    <Fragment>
      <h2>Information on data security and data confidentiality</h2>
      <hr />
      <br />
      <h3>Data ownership and procedures</h3>
      <p className="text-justify">
        The tool developer Akvo does not claim any data ownership. All data that
        will be collected through the system, will be legally owned by the
        organisations that enter the data. All rights remain with the
        organisations to whom the data belong. Akvo systems allow the
        administration of specified roles and permissions; with corresponding
        access to data and / or functionalities in the system.
      </p>
      <p className="text-justify">
        Considering the potential broadening of the system over time, we (the
        Belgian, Dutch, German and Swiss Initiatives on Sustainable Cocoa)
        envisage separate meetings to clarify roles and responsibilities across
        various stakeholders and clear guidelines and data procedures to
        administer and implement these roles and corresponding access to data
        and / or functionalities in the system.
      </p>
      <br />

      <h3>Data security & privacy</h3>
      <p className="text-justify">
        Akvo maintains strong data security and privacy protection policies,
        frameworks, and procedures, as laid out further in the below text. Data
        is stored securely; we ensure data is safely encrypted, and your data is
        never shared with third parties. We comply with the European General
        Data Protection Regulations (GDPR).
      </p>
      <p className="text-justify">
        Access to data before anonymization is possible only for a very limited
        number of duly authorized persons having signed non-disclosure
        commitments; this may solely be done to check for and ensure consistency
        in data; getting back to the members to correct for erroneous or
        contradicting data and/or for providing support to gradual improvement
        of sustainability reporting by members.
      </p>
      <br />

      <h3>Secure database</h3>
      <p className="text-justify">
        Akvo software ensures that all data is properly secured when in transit
        and at rest. For data at rest, Akvo relies on the capabilities of Amazon
        S3 and Google Datastore, which provide one of the highest security
        standards in the whole industry. Data is backed-up regularly and stored
        securely on Google Cloud Storage. For data in transit, all
        communications between different parts of Akvo’s systems (Browser apps,
        mobile app, backend services, databases) are encrypted using TLS.
      </p>
      <p className="text-justify">
        Any communication to Akvo’s backend service is properly authenticated
        and authorized. Akvo software gives administrators the control on what
        permissions a user has on the platform at a very fine level. All Akvo’s
        servers are managed by Google which are ISO certified, comply with US
        and EU regulations and provide round-the-clock security maintenance and
        essential upgrades for the best level of security. Akvo’s tools are
        continuously monitored for uptime.
      </p>
      <p className="text-justify">
        All Akvo’s servers are <b>hosted in Belgium</b> and managed by Google
        Cloud Platform which meets ISO 27018, ISO 27017, ISO 27001, comply with
        US and EU regulations and provide round-the-clock security maintenance
        and essential upgrades for the best level of security. See{" "}
        <a
          href="https://cloud.google.com/security/compliance"
          target="_blank"
          rel="noreferrer"
        >
          https://cloud.google.com/security/compliance
        </a>
        .
      </p>
      <br />

      <h3>Data processing by Akvo</h3>
      <p className="text-justify">
        The processor entrusts only such persons (whether legal or natural) with
        the data processing under this agreement who have given an undertaking
        to maintain confidentiality and have been informed of any special data
        protection requirements relevant to their work; Akvo acts as a data
        processor on behalf of Beyond Chocolate, DISCO, GISCO and SWISSCO.
      </p>
      <p className="text-justify">
        The data collected are subject to the GDPR which is a EU law that
        protects personal data, this is also stated in Akvo’s Data Processing
        Agreement:{" "}
        <a href="https://akvo.org/wp-content/uploads/2020/06/Akvo-DPA-Template-revised-June-2020.pdf">
          https://akvo.org/wp-content/uploads/2020/06/Akvo-DPA-Template-revised-June-2020.pdf
        </a>
      </p>
      <br />

      <h3>Roles and permissions</h3>
      <p className="text-justify">
        The platform secretariats of Beyond Chocolate, DISCO, GISCO and SWISSCO
        will follow a roles and permissions model. allowing for administrator
        level and also granular access control to data. They will grant where
        relevant administrator level access to the tool and control granular
        access to data. Access to questions and attendant response data will be
        restricted to a user’s specifically and defined role and the permissions
        assigned to that role. A strict permissions model ensures that sensitive
        data is not accessible nor visible to other users of the platforms.
      </p>
      <p className="text-justify">
        Unless explicitly agreed upon otherwise by the owner of the data,
        collected data must be entirely anonymized and aggregated before they
        may be shared with other members of the platforms and/or rendered
        public. Any data shared and/or displayed at a disaggregated level
        internally (e.g. to staff of the secretariats, the platform working
        groups that accompany the monitoring incl. data evaluation) will be
        entirely anonymized.
      </p>
      <p className="text-justify">
        Before publishing (anonymized and aggregated) findings or insights
        arising from the analysis of collected data, the platform secretariats
        will still ensure that this does not indirectly disclose sensitive
        information with respect to a particular member.
      </p>
      <p className="text-justify">
        The following persons will have such access to data before anonymization
        and aggregation:
      </p>
      <p className="text-justify">
        <u>For GISCO:</u>
      </p>
      <ul className="pl-5">
        <li>Beate Weiskopf, GISCO</li>
        <li>Ulrike Joras, GISCO</li>
        <li>Patrick Stoop, C-Lever.org</li>
        <li>Hilde Geens, C-Lever.org</li>
        <li>Koen Sneyers, C-Lever.org</li>
        <li>Lela Lindena, Mainlevel</li>
        <li>Lukas Wirnitzer, Mainlevel</li>
      </ul>

      <p className="text-justify">
        <u>For Beyond chocolate:</u>
      </p>
      <ul className="pl-5">
        <li>Charles Snoeck</li>
        <li>Marloes Humbeeck</li>
        <li>Patrick Stoop, C-Lever.org</li>
        <li>Hilde Geens, C-Lever.org</li>
      </ul>

      <p className="text-justify">
        <u>For DISCO:</u>
      </p>
      <ul className="pl-5">
        <li>Mark de Waard</li>
        <li>Marlene Hoekstra</li>
        <li>Patrick Stoop, C-Lever.org</li>
        <li>Hilde Geens, C-Lever.org</li>
      </ul>

      <p className="text-justify">
        <u>For SWISSCO:</u>
      </p>
      <ul className="pl-5">
        <li>Christian Robin</li>
        <li>Michaela Kuhn</li>
        <li>Sophie Tüllmann</li>
        <li>Patrick Stoop, C-Lever.org</li>
        <li>Hilde Geens, C-Lever.org</li>
      </ul>
      <p className="text-justify">
        Each of the named persons above is required to sign a confidentiality
        agreement before getting access to the data of the corresponding
        platform members. Any new personnel at the secretariats, at C-Lever.org
        or at Mainlevel that needs to be granted access will have to have signed
        the confidentiality agreement before getting such access.
      </p>
      <br />

      <h3>Data storage locations and access</h3>
      <p className="text-justify">
        During data collection, the data is stored in a secure system hosted by
        Akvo.
      </p>
      <p className="text-justify">
        During the data cleaning phase (executed by C-lever.org and Mainlevel in
        consultation with the Beyond Chocolate, DISCO, GISCO and SWISSCO
        secretariats), the data is accessed directly in the data-storage tool
        made available by Akvo. Access to the tool is password protected, only
        the authorised persons (see Annex 5) have access to the data. In the
        storage tool each submitted data set is linked to an instance ID. The
        authorised persons have access to the data cleaning information linked
        to each instance ID.
      </p>
      <p className="text-justify">
        Storage of data during evaluation by C-Lever.org: After the data has
        been cleaned directly in the data-storage tool, Akvo merges the
        individual surveys and deletes all information that makes it possible to
        identify the reporting member, except for the randomly assigned instance
        ID. Once this is done the anonymized spreadsheet of raw data is exported
        from the tool and transferred to C-lever.org. These anonymized raw data
        are password protected with access limited to the designated persons
        listed above and stored locally on a password-secured server at
        C-Lever.org. When anonymized data is shared from C-Lever.org with the
        ISCOs, data will also be stored on a password-secured server with access
        limited to the designated persons.
      </p>
      <br />

      <h3>
        Handling of sensitive data after anonymization and aggregation of
        collected data
      </h3>
      <p className="text-justify">
        When reporting or sharing any data, compiled from data collected with
        the monitoring tool, appropriate measures will be taken to ensure that
        the nature of the reported data do not allow any conclusions on specific
        members. Therefore, the secretariats will follow the following
        principles:
      </p>
      <ol className="pl-5">
        <li>
          Not only ensure that data are anonymised, but also aggregated and / or
          averaged before any publication of data.
        </li>
        <li>
          Still be careful in sharing anonymised, but also aggregated and / or
          averaged data and check where any risk of sharing sensitive
          information exists. In this case, the members involved will be
          contacted first.
        </li>
        <li>
          Internal reporting to the members, in a confidential setting, will
          always precede external reporting.
        </li>
      </ol>
      <br />

      <h3>Agreement to and visibility of these data security provisions</h3>
      <p className="text-justify">
        When registering, the users are asked to agree to their data being
        processed according to the above data security provisions by clicking a
        box. Also, the link to the data security provisions is shown at the top
        of each survey at all times.
      </p>
    </Fragment>
  ),
  de: (
    <Fragment>
      <h2>Datensicherheits- und Datenvertraulichkeitsmaßnahmen</h2>
      <hr />
      <br />
      <h3>Dateneigentum und -verfahren</h3>
      <p className="text-justify">
        Der Tool-Entwickler Akvo erhebt keinen Anspruch auf Eigentum der Daten.
        Alle Daten, die über das System erfasst werden, bleiben rechtlich
        Eigentum der Organisationen, welche die Daten eingeben. Alle Rechte
        verbleiben bei den Organisationen, denen die Daten gehören. Akvo-Systeme
        ermöglichen die Verwaltung von bestimmten Rollen und Berechtigungen mit
        entsprechendem Zugriff auf Daten und / oder Funktionen im System.
      </p>
      <p className="text-justify">
        Angesichts der möglichen Erweiterung des Systems im Laufe der Zeit
        planen wir (die belgische, deutsche, niederländische und schweizer
        Platform) separate Besprechungen, um die Rollen und Verantwortlichkeiten
        verschiedener Interessengruppen zu klären und Richtlinien und
        Datenverfahren für die Verwaltung und Implementierung dieser Rollen,
        sowie den entsprechenden Zugriff auf Daten und / oder Funktionen im
        System festzulegen.
      </p>
      <br />

      <h3>Datensicherheit und Datenschutz</h3>
      <p className="text-justify">
        Akvo hält strenge Richtlinien und Verfahren bezüglich Datensicherheit
        und Datenschutz ein, welche im Folgenden dargelegt werden. Alle Daten
        werden sicher gespeichert. Wir stellen sicher, dass ihre Daten
        verschlüsselt sind und niemals an Dritte weitergegeben werden. Wir
        halten uns an die Europäischen Allgemeinen Datenschutzbestimmungen
        (DSGVO). Der Zugriff auf die Daten vor der Anonymisierung ist nur einem
        sehr begrenzten Kreis autorisierter Personen möglich, die eine
        Verschwiegenheitserklärung unterzeichnet haben. Zugriff kann gewährt
        werden, um die Konsistenz der Daten zu überprüfen, um in Rücksprache mit
        den Mitgliedern fehlerhafte oder widersprüchliche Daten zu korrigieren
        und / oder um die schrittweise Verbesserung der
        Nachhaltigkeitsberichterstattung durch die Mitglieder zu unterstützen.
      </p>
      <br />

      <h3>Sicherheit der Datenbank</h3>
      <p className="text-justify">
        Die Akvo-Software stellt sicher, dass alle Daten jederzeit ordnungsgemäß
        gesichert sind. Für ruhende Daten stützt sich Akvo auf die Funktionen
        von Amazon S3 und Google Datastore, die einen der höchsten
        Sicherheitsstandards in der Branche bieten. Die Daten werden regelmäßig
        gesichert und sicher im Google Cloud Storage gespeichert. Für die
        Datenübertragung werden alle Kommunikationen zwischen verschiedenen
        Teilen der Akvo-Systeme (Browser-Apps, mobile Apps, Backend-Dienste,
        Datenbanken) mit TLS verschlüsselt.
      </p>
      <p className="text-justify">
        Jede Kommunikation mit dem Backend-Service von Akvo wird ordnungsgemäß
        authentifiziert und autorisiert. Mit der Akvo-Software können
        Administratoren sehr fein steuern, über welche Berechtigungen ein/e
        Benutzer/in auf der Plattform verfügt. Alle Akvo-Server werden von
        Google verwaltet, die ISO-zertifiziert sind, den US- und EU-Vorschriften
        entsprechen und rund um die Uhr Sicherheitswartungen und wichtige
        Upgrades für ein Höchstmaß an Sicherheit durchführen. Die Tools von Akvo
        werden kontinuierlich auf ihre Betriebszeit überwacht.
      </p>
      <p className="text-justify">
        Alle Akvo-Server werden in Belgien gehostet und von der Google Cloud
        Plattform verwaltet, die ISO 27018, ISO 27017, ISO 27001 entspricht, den
        US- und EU-Vorschriften entspricht und diese einhält und rund um die Uhr
        Sicherheitswartung und wesentliche Upgrades für ein Höchstmaß an
        Sicherheit bietet. Siehe{" "}
        <a href="https://cloud.google.com/security/compliance">
          https://cloud.google.com/security/compliance
        </a>
        .
      </p>
      <br />

      <h3>Datenverarbeitung durch Akvo</h3>
      <p className="text-justify">
        Der Datenverarbeiter beauftragt gemäß dieser Vereinbarung nur Personen
        (ob juristisch oder natürlich) mit der Datenverarbeitung, die der
        Wahrung der Datenvertraulichkeit zugestimmt haben und über besondere
        Datenschutzanforderungen in Bezug auf ihre Arbeit unterrichtet wurden.
        Akvo fungiert als Datenverarbeiter im Auftrag von Beyond Chocolate,
        DISCO, SWISSCO und dem Forum Nachhaltiger Kakao.
      </p>
      <p className="text-justify">
        Die gespeicherten Daten unterliegen der DSGVO, dem europäischen Gesetz
        zum Schutz persönlicher Daten. Dies ist auch in Akvo`s
        Datenverarbeitungsbestimmung festgehalten:{" "}
        <a href="https://akvo.org/wp-content/uploads/2020/06/Akvo-DPA-Template-revised-June-2020.pdf">
          https://akvo.org/wp-content/uploads/2020/06/Akvo-DPA-Template-revised-June-2020.pdf
        </a>
      </p>
      <br />

      <h3>Rollen und Berechtigungen</h3>
      <p className="text-justify">
        Die Plattformsekretariate von Beyond Chocolate, DISCO, SWISSCO und dem
        Forum Nachhaltiger Kakao folgen einem Rollen- und Berechtigungsmodell,
        welches den Zugriff auf die Daten sowohl auf Administratorenebene als
        auch auf granularer Ebene ermöglicht. Der Zugriff auf Fragen- und
        Antwortdaten ist auf die spezifische und definierte Rolle des/der
        jeweiligen Nutzer/in und die dieser Rolle zugewiesenen Berechtigungen
        beschränkt. Ein striktes Berechtigungsmodell stellt sicher, dass
        vertrauliche Daten für andere Benutzer der Plattformen weder zugänglich
        noch sichtbar sind.
      </p>
      <p className="text-justify">
        Sofern mit dem/r Eigentümer/in der Daten nicht ausdrücklich anders
        vereinbart, müssen die gesammelten Daten vollständig anonymisiert und
        aggregiert werden, bevor sie mit anderen Mitgliedern der Plattformen
        geteilt und / oder veröffentlicht werden können. Alle Daten, die intern
        auf disaggregierter Ebene geteilt und / oder angezeigt werden (z.B. mit
        den Mitarbeitern/innen der Sekretariate oder den
        Plattformarbeitsgruppen, die das Monitoring begleiten, einschließlich
        der Datenauswertung), werden vollständig anonymisiert.
      </p>
      <p className="text-justify">
        Vor der Veröffentlichung der (anonymisierten und aggregierten)
        Erkenntnisse oder Informationen aus der Analyse der gesammelten Daten
        stellen die Plattformsekretariate weiterhin sicher, dass dies nicht
        Rückschlüsse auf sensible Informationen über ein bestimmtes Mitglied
        zulässt.
      </p>
      <p className="text-justify">
        Die folgenden Personen haben aktuell (Stand: April 2022){" "}
        <u>
          (zusätzlich für die Weiterentwicklung und Betreuung des Tools
          zuständigen Mitarbeitenden des Softwareentwicklungsunternehmens Akvo,
          die aus technischem Gründen Datenzugriff haben)
        </u>{" "}
        die Berechtigung, vor der Anonymisierung und Aggregation auf Daten
        zuzugreifen:
      </p>
      <p className="text-justify">
        <u>Für das Kakaoforum:</u>
      </p>
      <ul className="pl-5">
        <li>Beate Weiskopf</li>
        <li>Ulrike Joras</li>
        <li>Weiterer Mitarbeitender der Geschäftsstelle, zu benennen</li>
        <li>Patrick Stoop, C-Lever.org</li>
        <li>Hilde Geens, C-Lever.org</li>
        <li>Koen Sneyers, C-Lever.org</li>
        <li>Lela Lindena, Mainlevel</li>
        <li>Lukas Wirnitzer, Mainlevel</li>
        <li>Weitere zu benennende, externe Person</li>
      </ul>

      <p className="text-justify">
        <u>Für Beyond Chocolate:</u>
      </p>
      <ul className="pl-5">
        <li>Charles Snoeck</li>
        <li>Marloes Humbeeck</li>
        <li>Patrick Stoop, C-Lever.org</li>
        <li>Hilde Geens, C-Lever.org</li>
      </ul>

      <p className="text-justify">
        <u>Für DISCO:</u>
      </p>
      <ul className="pl-5">
        <li>Mark de Waard</li>
        <li>Marlene Hoekstra</li>
        <li>Patrick Stoop, C-Lever.org</li>
        <li>Hilde Geens, C-Lever.org</li>
      </ul>

      <p className="text-justify">
        <u>Für SWISSCO:</u>
      </p>
      <ul className="pl-5">
        <li>Christian Robin</li>
        <li>Michaela Kuhn</li>
        <li>Sophie Tüllmann</li>
        <li>Patrick Stoop, C-Lever.org</li>
        <li>Hilde Geens, C-Lever.org</li>
      </ul>

      <p className="text-justify">
        Jede der autorisierten Personen muss eine Verschwiegenheitserklärung
        unterzeichnen, bevor sie auf Daten der jeweiligen Plattformmitglieder
        zugreifen kann. Jede/r neue Mitarbeiter/in in den Sekretariaten oder von
        Mainlevel und C-Lever.org muss die Verschwiegenheitserklärung
        unterzeichnet haben, bevor er/sie Zugriff erhält.
      </p>
      <br />

      <h3>Speicherorte und Zugriff auf die Daten</h3>
      <p className="text-justify">
        Während der Datenerhebung werden die Daten in einem sicheren System
        ges-peichert, das von Akvo gehostet wird.
      </p>
      <p className="text-justify">
        Während der Datenbereinigungsphase (durchgeführt von C-lever.org und
        Mainlevel in Absprache mit den Sekretariaten von Beyond Chocolate,
        DISCO, SWISSCO und dem Forum Nachhaltiger Kakao) erfolgt der Zugriff auf
        die Daten direkt in dem von Akvo zur Verfügung gestellten
        Datenspeicherungstool. Der Zugang zum Tool ist passwortgeschützt und nur
        die autorisierten Personen haben Zugriff auf die Daten. Im Speicher-Tool
        ist jeder eingereichte Datensatz mit einer Instanz-ID verknüpft. Die
        autorisierten Personen haben Zugriff auf die mit den Instanz-IDs
        verknüpften Datenbereinigungsinformationen.
      </p>
      <p className="text-justify">
        Speicherung der Daten während der Auswertung durch C-Lever.org: Nachdem
        die Daten direkt im Datenspeicherungstool bereinigt wurden, führt Akvo
        die einzelnen Erhebungen zusammen und löscht alle Informationen, die
        eine Identifizierung des berichtenden Mitglieds ermöglichen, mit
        Ausnahme der zufällig vergebenen Instanz-ID. Sobald dies geschehen ist,
        wird das anonymisierte Spreadsheet mit den Rohdaten aus dem Tool
        exportiert und an C-lever.org übertragen. Diese anonymisierten Rohdaten
        sind passwortgeschützt mit Zugriffsbeschränkung auf die autorisierten
        Personen und werden lokal auf einem passwortgesicherten Server bei
        C-Lever.org gespeichert. Wenn anonymisierte Daten von C-Lever.org mit
        den ISCOs geteilt werden, werde die Daten dann ebenfalls auf einem
        passwortgeschützten und mit Zugriffsbeschränkung versehenem Server
        gespeichert.
      </p>
      <br />

      <h3>
        Umgang mit sensiblen Daten nach der Anonymisierung und Aggregierung
        erhobener Daten
      </h3>
      <p className="text-justify">
        Wann immer Daten, die mit dem Monitoringtool erhoben wurden,
        weitergegeben oder veröffentlicht werden sollen, werden entsprechende
        Vorkehrungen getroffen, um sicherzustellen, dass die Daten keine
        Rückschlüsse auf Informationen einzelner Mitglieder zulassen. Dafür
        halten sich die Sekretariate an folgenden Prinzipien:
      </p>
      <ol className="pl-5">
        <li>
          Es wird vor der Veröffentlichung der Daten nicht nur sichergestellt,
          dass die Daten anonymisiert sind, sondern auch, dass sie aggregiert
          und / oder gemittelt werden.
        </li>
        <li>
          Auch bei anonymisierten und aggregierten und / oder gemittelten Daten
          wird Vorsicht walten gelassen und überprüft, ob ein Risiko der
          Weitergabe sensibler Informationen besteht. In diesem Fall werden die
          betroffenen Mitglieder vor jedweder Weitergabe kontaktiert.
        </li>
        <li>
          Daten werden vor der Veröffentlichung immer zuerst in einem
          vertraulichen Rahmen mit den Mitgliedern der Plattformen geteilt.
        </li>
      </ol>
      <br />

      <h3>Zustimmung zu und Sichtbarkeit der Datenschutzvorkehrungen</h3>
      <p className="text-justify">
        Bei der Registrierung werden die NutzerInnen gebeten, der Verarbeitung
        ihrer Daten gemäß den oben genannten Datenschutzvorkehrungen
        zuzustimmen, indem sie ein entsprechendes Feld anklicken. Der Link zu
        den Datenschutzvorkehrungen wird außerdem jederzeit oberhalb der
        Fragebögen angezeigt.
      </p>
    </Fragment>
  ),
};

export default dataSecurityContent;
