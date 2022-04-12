import React, { Fragment } from "react";

const webformContent = (handleShow, activeForm = null) => {
  return {
    en: {
      dataSecurityText: (
        <Fragment>
          <a onClick={handleShow} href="#">
            Data security provisions
          </a>{" "}
          for the data that will be submitted as part of this survey.
        </Fragment>
      ),
      registerCheckBoxText: (
        <Fragment>
          By clicking this box, I agree to my data being processed according to
          the{" "}
          <a onClick={handleShow} href="#">
            Data security provisions
          </a>
          .
        </Fragment>
      ),
      iframeNotLoaded: (
        <Fragment>
          The survey failed to load . Please enable third party cookies in you
          browser settings to load the survey. <br />
          In case you do not have the credentials to enable third party cookies,
          please{" "}
          <a href={activeForm} target="_blank" rel="noreferrer">
            click here{" "}
          </a>{" "}
          to load the survey in a separate tab.
        </Fragment>
      ),
    },

    de: {
      dataSecurityText: (
        <Fragment>
          <a onClick={handleShow} href="#">
            Datensicherheitsvorkehrungen
          </a>{" "}
          für die Daten, die Sie im Rahmen dieser Erhebung eingeben.
        </Fragment>
      ),
      registerCheckBoxText: (
        <Fragment>
          Durch das Ankreuzen dieses Feldes stimme ich der Verarbeitung meiner
          Daten gemäß der{" "}
          <a onClick={handleShow} href="#">
            Datenschutzvorkehrungen
          </a>{" "}
          zu.
        </Fragment>
      ),
      iframeNotLoaded: (
        <Fragment>
          The survey failed to load . Please enable third party cookies in you
          browser settings to load the survey. <br />
          In case you do not have the credentials to enable third party cookies,
          please{" "}
          <a href={activeForm} target="_blank" rel="noreferrer">
            click here{" "}
          </a>{" "}
          to load the survey in a separate tab.
        </Fragment>
      ),
    },
  };
};

export default webformContent;
