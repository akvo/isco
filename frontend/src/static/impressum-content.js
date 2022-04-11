import React, { Fragment } from "react";

const icEn = (handleShow) => {
  return {
    t: "Impressum",
    list: [
      {
        h: "Responsible for the content",
        c: (
          <Fragment>
            <h3>German Initiative on Sustainable Cocoa (GISCO)</h3> <hr />
            <p>
              Secretariat Berlin <br />
              c/o Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ)
              GmbH <br />
              Reichpietschufer 20 <br />
              10785 Berlin <br />
              Germany <br />
            </p>
            <p>
              Secretariat Eschborn <br />
              Postfach 5180 <br />
              65726 Eschborn <br />
              Germany <br />
            </p>
            <p>
              Contact: Beate Weiskopf <br />
              Email:{" "}
              <a href="mailto:Beate.Weiskopf@giz.de">
                Beate.Weiskopf@giz.de
              </a>{" "}
              <br />
            </p>
            <br />
            <br />
            <h3>Beyond Chocolate</h3> <hr />
            <p>
              Fosbury & Sons, Albert <br />
              Koning Albert II Laan 7 <br />
              1210 Brussels <br />
            </p>
            <p>
              Contact: Charles Snoeck <br />
              Email:{" "}
              <a href="mailto:snoeck@idhtrade.org">snoeck@idhtrade.org</a>{" "}
              <br />
            </p>
            <br />
            <br />
            <h3>DISCO</h3> <hr />
            <p>
              IDH, Sustainable Trade Initiative <br />
              Arthur van Schendelstraat 500 <br />
              3511 MH Utrecht <br />
            </p>
            <p>
              Contact: Mark de Waard <br />
              Email:{" "}
              <a href="mailto:deWaard@idhtrade.org">
                deWaard@idhtrade.org
              </a>{" "}
              <br />
            </p>
          </Fragment>
        ),
      },
      {
        h: "Responsible for the technical realization",
        c: (
          <Fragment>
            <h3>Akvo Foundation</h3> <hr />
            <p>
              &apos;s-Gravenhekje 1-A, <br />
              1011 TG Amsterdam, <br />
              The Netherlands <br />
            </p>
            <p>
              Phone: <br />
              +31 20 820 0175 <br />
            </p>
            <p>
              E-mail: <br />
              <a href="mailto:">info@akvo.org</a> <br />
            </p>
            <p>
              Netherlands Chamber of Commerce (KvK) number: 27327087 <br />
              VAT number: NL 819794727 B01 <br />
            </p>
            <p>
              Akvo Foundation does not commit to nor is it obliged to
              participate in the alternative dispute resolution for consumer
              disputes in front of a consumer dispute resolution entity. <br />
              European Commission official website for Online Dispute
              Resolution:{" "}
              <a href="http://www.ec.europa.eu/consumers/odr">
                http://www.ec.europa.eu/consumers/odr
              </a>
              <br />
            </p>
            <p>
              Data privacy: <br />
              Akvo&apos;s data privacy{" "}
              <a href="https://akvo.org/wp-content/uploads/2018/05/Akvo-General-Privacy-policy-FINAL_May18_V1.pdf">
                https://akvo.org/wp-content/uploads/2018/05/Akvo-General-Privacy-policy-FINAL_May18_V1.pdf
              </a>
            </p>
            <p>
              How can you request removal of your personal data from our
              systems? <br />
              Please fill out this form (
              <a href="https://akvo.org/remove-my-personal-data/">
                https://akvo.org/remove-my-personal-data/
              </a>
              ) if you&apos;d like to have your personal data removed from our
              systems or write to our data security officer: <br />
            </p>
            <p>
              Email: <a href="mailto:">privacy@akvo.org</a> <br />
            </p>
            <p>
              You can also contact the above named data security officer to file
              a complaint. <br />
            </p>
            <p>
              <a onClick={handleShow} href="#">
                Data Security Provisions
              </a>
            </p>
          </Fragment>
        ),
      },
    ],
  };
};

const icDe = (handleShow) => {
  return {
    t: "Impressum",
    list: [
      {
        h: "Verantwortlich für den Inhalt",
        c: (
          <Fragment>
            <h3>Forum Nachhaltiger Kakao e.V</h3> <hr />
            <p>
              Geschäftsstelle Berlin <br />
              c/o Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ)
              GmbH <br />
              Reichpietschufer 20 <br />
              10785 Berlin <br />
            </p>
            <p>
              Geschäftsstelle Eschborn <br />
              Postfach 5180 <br />
              65726 Eschborn <br />
            </p>
            <p>
              Kontakt: Beate Weiskopf <br />
              Email:{" "}
              <a href="mailto:Beate.Weiskopf@giz.de">
                Beate.Weiskopf@giz.de
              </a>{" "}
              <br />
            </p>
            <br />
            <br />
            <h3>Beyond Chocolate</h3> <hr />
            <p>
              Fosbury & Sons, Albert <br />
              Koning Albert II Laan 7 <br />
              1210 Brussels <br />
            </p>
            <p>
              Kontakt: Charles Snoeck <br />
              Email:{" "}
              <a href="mailto:snoeck@idhtrade.org">snoeck@idhtrade.org</a>{" "}
              <br />
            </p>
            <br />
            <br />
            <h3>DISCO</h3> <hr />
            <p>
              IDH, Sustainable Trade Initiative <br />
              Arthur van Schendelstraat 500 <br />
              3511 MH Utrecht <br />
            </p>
            <p>
              Kontakt: Mark de Waard <br />
              Email:{" "}
              <a href="mailto:deWaard@idhtrade.org">
                deWaard@idhtrade.org
              </a>{" "}
              <br />
            </p>
          </Fragment>
        ),
      },
      {
        h: "Verantwortlich für die technische Umsetzung",
        c: (
          <Fragment>
            <h4>Stiftung Akvo</h4> <hr />
            <p>
              &apos;s-Gravenhekje 1-A, <br />
              1011 TG Amsterdam, <br />
              Die Niederlande <br />
            </p>
            <p>
              Telefon: <br />
              +31 20 820 0175 <br />
            </p>
            <p>
              E-mail: <br />
              <a href="mailto:">info@akvo.org</a> <br />
            </p>
            <p>
              Niederländische Handelskammer (KvK) Nummer: 27327087 <br />
              Umsatzsteueridentifikationsnummer: NL 819794727 B01 <br />
            </p>
            <p>
              Die Akvo Foundation ist weder verpflichtet noch daran gebunden, an
              einer alternativen Streitbeilegung für Verbraucherstreitigkeiten
              vor einer Verbraucherschlichtungsstelle teilzunehmen. <br />
              Offizielle Website der Europäischen Kommission zur
              Online-Streitbeilegung:{" "}
              <a href="http://www.ec.europa.eu/consumers/odr">
                http://www.ec.europa.eu/consumers/odr
              </a>
              <br />
            </p>
            <p>
              Datenschutz: <br />
              Akvo&apos;s Datenschutz{" "}
              <a href="https://akvo.org/wp-content/uploads/2018/05/Akvo-General-Privacy-policy-FINAL_May18_V1.pdf">
                https://akvo.org/wp-content/uploads/2018/05/Akvo-General-Privacy-policy-FINAL_May18_V1.pdf
              </a>
            </p>
            <p>
              Wie können Sie die Löschung Ihrer persönlichen Daten aus unseren
              Systemen beantragen? <br />
              Bitte füllen Sie dieses Formular (
              <a href="https://akvo.org/remove-my-personal-data/">
                https://akvo.org/remove-my-personal-data/
              </a>
              ) aus, wenn Sie Ihre persönlichen Daten aus unseren Systemen
              entfernen lassen möchten oder schreiben Sie an unseren
              Datenschutzbeauftragten: <br />
            </p>
            <p>
              Email: <a href="mailto:">privacy@akvo.org</a> <br />
            </p>
            <p>
              Sie können sich auch an die oben genannte Datenschutzbeauftragte
              wenden, um eine Beschwerde einzureichen. <br />
            </p>
            <p>
              <a onClick={handleShow} href="#">
                Datensicherheitsmaßnahmen
              </a>
            </p>
          </Fragment>
        ),
      },
    ],
  };
};

const impressumContent = (handleShow) => {
  return {
    en: icEn(handleShow),
    de: icDe(handleShow),
  };
};

export default impressumContent;
