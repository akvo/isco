import React, { Fragment } from "react";

const uiText = {
  en: {
    welcome: (
      <Fragment>
        Welcome
        <br />
        to the GISCO Monitoring Pilot
        <br />
        for 2021 data
      </Fragment>
    ),
    welcome2: "2022 Monitoring Round",
    welcome3: (
      <Fragment>
        Welcome
        <br />
        to the Cocoa Monitoring
        <br /> for 2021 data
      </Fragment>
    ),
    // Navigation
    navSurvey: "Survey",
    navDefinitions: "Definitions",
    navFeedback: "Feedback",
    navSetting: "Setting",
    navManageUser: "Manage User",
    navManageDownloadRequest: "Manage Download",
    navLogout: "Logout",
    navSearch: "Search",
    navGettingStarted: "Getting Started",
    navSubmission: "Submission",
    navHome: "Home",
    navAdmin: "Admin",
    navDownload: "Download",
    navImpressum: "Impressum",
    navFaq: "FAQ",
    // Form
    formChangePwd: "Change Password",
    formEmail: "Email Address",
    formEmailText: "We'll never share your email address with anyone else.",
    formPwd: "Password",
    formConfirmPwd: "Confirm Password",
    formOldPwd: "Old Password",
    formNewPwd: "New Password",
    formConfirmNewPwd: "Confirm New Password",
    formQuestionnaire: "Questionnaire",
    formFeedbackTitle:
      "Please provide your feedback. It is highly valuable to improve the system.",
    formTitle: "Title",
    formCategory: "Category",
    formFeedback: "Feedback",
    formCaptcha: "Insert captcha value",
    formPickPreviousSavedForms: "Pick a previously saved form",
    formStartFillingNewForm: "Start filling a new form",
    formLogin: "Login User",
    formRememberLogin: "Remember Login",
    formForgotPwd: "Forgot Password",
    formHaveAccount: "Already have account?",
    formDontHaveAccount: "Don't have any account?",
    formRegister: "Register",
    formFullName: "Full Name",
    formResetPwd: "Reset Password",
    formCollaborators: "Contributing organization(s)",
    formPhoneNumber: "Phone Number (Optional)",
    // Button
    btnLogin: "Login",
    btnBackToLogin: "Back to Login Page",
    btnUpdate: "Update",
    btnClose: "Close",
    btnSaveChanges: "Save Changes",
    btnDeleteUser: "Delete User",
    btnInformUser: "Inform User",
    btnSubmit: "Submit",
    btnLoading: "Loading",
    btnOpen: "Open",
    btnSendEmail: "Send Email",
    btnResendVerificationEmail: "Resend Verification Email",
    btnStartSurvey: "Click here to start the survey",
    btnRefresh: "Refresh",
    btnOk: "OK",
    btnYes: "Yes",
    btnNo: "No",
    btnAdd: "Add",
    btnPrimary: "Primary",
    btnDownload: "Download",
    btnGenerating: "Generating",
    btnUploading: "Uploading",
    btnRequestToDownload: "Request to Download",
    btnWaitingApproval: "Waiting for Approval",
    btnApprove: "Approve",
    btnReject: "Reject",
    btnRejected: "Rejected",
    btnView: "View",
    // Table
    tbColName: "Name",
    tbColEmail: "Email",
    tbColOrganization: "Organization",
    tbColSecretariats: "Secretariats",
    tbColRole: "Role",
    tbColSurveys: "Surveys",
    tbColSubmitter: "Submitter",
    tbColForm: "Form",
    tbColYear: "Year",
    tbColAction: "Action",
    tbColFilename: "Filename",
    tbColStatus: "Status",
    tbColRequestBy: "Request By",
    tbRowNoRecords: "There are no records to display.",
    tbColMemberQuestionnaire: "Member Questionnaire",
    tbColProjectQuestionnaire: "Project Questionnaire",
    tbColSaved: "Saved",
    tbColSubmitted: "Submitted",
    // Modal
    modalDataSecurity: "Data Security Provisions",
    modalSaveForm: "Save Form Data",
    modalWarning: "Warning",
    // Validation & Message
    valEmail: "The email field is required.",
    valFeedbackError: "Something wrong, please try again!",
    valFeedBackSuccess: "Your message has been successfully sent!",
    valTitle: "The title field is required.",
    valCategory: "The category field is required.",
    valFeedback: "The feedback field is required.",
    valCaptcha: "The captcha field is required.",
    valWrongCaptcha: "Wrong Captcha value",
    valFullName: "The full name field is required.",
    valPwd: "The password field is required.",
    valOldPwd: "The old password field is required.",
    valNewPwd: "The new password field is required.",
    valPwdNotMatch: "The passwords do not match.",
    valSelectOrganization: "Select Organization",
    valOrganization: "Select one of Organization.",
    valRegisterSuccess: "Congratulations, you have been registered.",
    valVerificationThank:
      "Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you? If you didn't receive the email, we will gladly send you another.",
    valVerificationInfo:
      "A new verification link has been sent to the email address you provided during registration.",
    valName: "The name field is required.",
    valFetchingData: "Fetching data",
    // New
    valOptionNewFormDisabledInfo: "submission for the member already created",
    // Save Form Modal
    valClickSave: (
      <Fragment>
        Please make sure that the data has been saved before you navigate away
        from the page.
        <br />
        To save the data please click on the &quot;Save&quot; button in the
        questionnaire.
        <br />
        Do you want to navigate away from the page?
      </Fragment>
    ),
    valClickYes: 'Click "Yes" if you have already saved the data',
    valClickNo: 'Click "No" if you have not saved the data',
    tbColVerifiedOn: "Verified on",
    valRegisterCheckBox:
      "To complete your registration, please consent to the data security provisions.",
    textFooterImpressum: "Impressum",
    textFooterFaq: "FAQ",
    // assignment panel
    textAssignmentPanel:
      "Thank you for completing your registration. We will verify your credentials and assign you the appropriate surveys. You will be notified via email.",
    textUntitledProject: "Untitled Project",
    textUnsavedChanges: "You have unsaved changes for user ",
    textEmailNotVerifiedYet: (
      <Fragment>
        is not verified yet.
        <br />
        <hr />
        The user can only be informed about the assignment to questionnaires
        after he/she has verified his/her email address.
      </Fragment>
    ),
    // collaborators
    btnCollaborators: "Add collaborator for joint projects",
    infoNoSubmittedData: "No Submitted Data",
    infoNoDownloadRequest: "No Download Request",
    textInfoSubmission:
      "There's maybe a slight delay between a submission made and data being ready to download.",
    downloadOfSubmissions: "Download of submissions",
    // Register
    registerFilterOrganizationsBy: "Filter organizations by",
    // Alert text
    textAlertFailed: "Failed!",
    textAlertSomethingWentWrong: "Something went wrong.",
    // info
    infoDataSecurityDoc: (
      <>
        For GISCO members: If you have not yet signed the bilateral data
        confidentiality and data security agreement for the monitoring, please
        download{" "}
        <a
          href="https://storage.googleapis.com/isco-storage/document/GISCO%20Confidentiality%20Agreement%20Monitoring%202022.docx"
          target="_blank"
          rel="noopener noreferrer"
        >
          THIS FILE
        </a>{" "}
        and send two printed versions to us in written with your signature. You
        will receive a copy signed by us in return.
      </>
    ),
    // page title
    pageSubmissionProgress: "Submission Progress",
    // popup download request
    popupDownloadRequestMessage: "Download Request",
    popupDownloadRequestDescription:
      "Thank you for the data download request. The secretariat admins will be notified about your request. You will receive an email from us once your data is ready for download",
    // banner
    bannerSaveSurvey:
      "Please remember to save your data at regular intervals to prevent data loss due to enforcing circumstances.",
    bannerDownloadPage: "Data from the previous round will be available soon.",
  },

  de: {
    welcome: (
      <Fragment>
        Willkommen
        <br />
        zum Pilotmonitoring des Forum nachhaltiger Kakao
        <br />
        für das Berichtsjahr 2021!
      </Fragment>
    ),
    welcome2: "Monitoringrunde 2022",
    welcome3: (
      <Fragment>
        Willkommen
        <br />
        zum Monitoring für das Berichtsjahr
        <br />
        2021 data
      </Fragment>
    ),
    // Navigation
    back: "Back",
    navSurvey: "Umfrage",
    navDefinitions: "Definitionen",
    navFeedback: "Feedback",
    navSetting: "Einstellungen",
    navManageUser: "Nutzermanagement",
    navManageDownloadRequest: "Manage Download",
    navLogout: "Ausloggen",
    navSearch: "Suchen",
    navGettingStarted: "Getting Started",
    navSubmission: "Submission",
    navHome: "Home",
    navAdmin: "Admin",
    navDownload: "Download",
    navImpressum: "Impressum",
    navFaq: "FAQ",
    // Form
    formChangePwd: "Passwort ändern",
    formEmail: "Emailadresse",
    formEmailText: "Ihre Emailadresse wird nicht weitergegeben.",
    formPwd: "Passwort",
    formConfirmPwd: "Passwort bestätigen",
    formOldPwd: "Altes Passwort",
    formNewPwd: "Neues Passwort",
    formConfirmNewPwd: "Neues Passwort bestätigen",
    formQuestionnaire: "Fragebogen",
    formFeedbackTitle:
      "Bitte geben Sie uns Feedback. Dieses hilft uns, das Monitoringsystem zu verbessern.",
    formTitle: "Titel",
    formCategory: "Category",
    formFeedback: "Feedback",
    formCaptcha: "Bitte tragen die den Wert/die Werte ein",
    formPickPreviousSavedForms: "Auswahl eines zuvor gespeicherten Fragebogens",
    formStartFillingNewForm: "Beginn eines neuen Fragebogens",
    formLogin: "Einloggen",
    formRememberLogin: "Login-Daten erinnern",
    formForgotPwd: "Passwort vergessen",
    formHaveAccount: "Sind Sie schon registriert?",
    formDontHaveAccount: "Sind Sie noch nicht registriert?",
    formRegister: "Registrieren",
    formFullName: "Name",
    formResetPwd: "Passwort zurücksetzen",
    formCollaborators: "Beitragende Organisation(en)",
    formPhoneNumber: "Phone Number (Optional)",
    // Button
    btnLogin: "Einloggen",
    btnBackToLogin: "Terug naar Inlogpagina",
    btnUpdate: "Update",
    btnClose: "Schließen",
    btnSaveChanges: "Änderungen speichern",
    btnDeleteUser: "Nutzer löschen",
    btnInformUser: "Nutzer/in informieren",
    btnSubmit: "Senden",
    btnLoading: "Laden",
    btnOpen: "Öffnen",
    btnSendEmail: "Email senden",
    btnResendVerificationEmail: "Bestätigungsemail nochmal senden",
    btnStartSurvey: "Klicken Sie hier um die Erhebung zu beginnen",
    btnRefresh: "Erneuern",
    btnOk: "OK",
    btnYes: "Ja",
    btnNo: "Nein",
    btnAdd: "Add",
    btnPrimary: "Primary",
    btnDownload: "Download",
    btnGenerating: "Generating",
    btnUploading: "Uploading",
    btnRequestToDownload: "Request to Download",
    btnWaitingApproval: "Waiting for Approval",
    btnApprove: "Approve",
    btnReject: "Reject",
    btnRejected: "Rejected",
    btnView: "View",
    // Table
    tbColName: "Name",
    tbColEmail: "Email",
    tbColOrganization: "Organisation",
    tbColSecretariats: "Sekretariate",
    tbColRole: "Rolle",
    tbColSurveys: "Umfragen",
    tbColSubmitter: "Nutzerin/Nutzer",
    tbColForm: "Formular",
    tbColYear: "Jahr",
    tbColAction: "Aktion",
    tbColFilename: "Filename",
    tbColStatus: "Status",
    tbColRequestBy: "Request By",
    tbRowNoRecords: "Keine Daten vorhanden.",
    tbColMemberQuestionnaire: "Member Questionnaire",
    tbColProjectQuestionnaire: "Project Questionnaire",
    tbColSaved: "Saved",
    tbColSubmitted: "Submitted",
    // Modal
    modalDataSecurity: "Datensicherheitsmaßnahmen",
    modalSaveForm: "Daten speichern",
    modalWarning: "Warnung",
    // Validation & Message
    valEmail: "Die Email Angabe ist obligatorisch.",
    valFeedbackError:
      "Etwas ist schiefgelaufen, versuchen Sie es bitte noch einmal.",
    valFeedBackSuccess: "Ihre Nachricht wurde erfolgreich versendet.",
    valTitle: "Die Titelangabe ist obligatorisch.",
    valCategory: "The category field is required.",
    valFeedback: "Das Feedback-Feld ist obligatorisch.",
    valCaptcha: "Das Captcha-Feld ist obligatorisch.",
    valWrongCaptcha: "Wrong Captcha value",
    valFullName: "Die Namensangabe ist obligatorisch.",
    valPwd: "Das Passwortfeld ist obligatorisch.",
    valOldPwd: 'Das Feld "Altes Passwort" ist obligatorisch.',
    valNewPwd: 'Das Feld "Neues Passwort" ist obligatorisch.',
    valPwdNotMatch: "Die Passwörter stimmen nicht überein.",
    valSelectOrganization: "Select Organization",
    valOrganization: "Wählen Sie Ihre Organisation aus.",
    valRegisterSuccess: "Sie wurden erfolgreich registriert.",
    valVerificationThank:
      "Vielen Dank für Ihre Anmeldung. Bitte verifizieren Sie Ihre Emailadresse, indem Sie auf den Link klicken, den wir Ihnen soeben per Email geschickt haben. Sie haben keinen Link erhalten? Dann senden wir gerne nochmal eine Email.",
    valVerificationInfo:
      "Ein neuer Link zur Verifizierunt wurde Ihnen soeben an die von Ihnen angegebene Emailadresse geschickt.",
    valName: "Die Namenseingabe ist obligatorisch.",
    valFetchingData: "Daten werden geladen",
    // New
    valOptionNewFormDisabledInfo:
      "Für dieses Mitglied wurde bereits ein Fragebogen erstellt",
    // Save Form Modal
    valClickSave: (
      <Fragment>
        Bitte stellen Sie sicher, dass Sie die eingegebenen Daten gespeichert
        haben, bevor Sie diese Seite verlassen.
        <br />
        Um Ihre Eingaben zu speichern, drücken Sie bitte auf
        &quot;Speichern&quot;, unten links im Fragebogen.
        <br />
        Wollen Sie diese Seite verlassen?
      </Fragment>
    ),
    valClickYes:
      'Klicken Sie "Ja" wenn Sie Ihre Eingaben bereits gespeichert haben',
    valClickNo:
      'Klicken Sie "Nein" wenn Sie Ihre Eingaben noch nicht gespeichert haben',
    tbColVerifiedOn: "Verifiziert am",
    valRegisterCheckBox:
      "Um die Registrierung abzuschließen, stimmen Sie bitten den Datenschutz-Vorkehrungen zu.",
    textFooterImpressum: "Impressum",
    textFooterFaq: "FAQ",
    // assignment panel
    textAssignmentPanel:
      "Vielen Dank, dass Sie sich registriert haben. Wir werden Ihre Kontaktdaten verifizieren und Ihnen die für Ihre Mitgliedsgruppe passenden Fragebögen freischalten. Sie werden per Email informiert, sobald Sie freigeschaltet wurden.",
    textUntitledProject: "Untitled Project",
    textUnsavedChanges:
      "Sie haben ungespeicherte Änderungen für den Nutzer/die Nutzerin ",
    textEmailNotVerifiedYet: (
      <Fragment>
        wurde noch nicht verifiziert. <br />
        <hr />
        Der Nutzer/die Nutzerin kann nur über seine/ihre Freischaltung von
        Fragebögen informiert werden, nachdem er seine/ sie ihre Emailadresse
        verifiziert hat.
      </Fragment>
    ),
    // collaborators
    btnCollaborators: "Partner für gemeinsame Projekte hinzufügen",
    infoNoSubmittedData: "No Submitted Data",
    infoNoDownloadRequest: "No Download Request",
    // Download
    textInfoSubmission:
      "Es kann zu einer leichten Verzögerung kommen, bis die eingereichten Daten zum Download bereitstehen.",
    downloadOfSubmissions: "Download der eingereichten Daten",
    // Register
    registerFilterOrganizationsBy: "Filtern Sie Organisationen nach",
    // Alert text
    textAlertFailed: "Failed!",
    textAlertSomethingWentWrong: "Something went wrong.",
    // info
    infoDataSecurityDoc: (
      <>
        Für Mitglieder des Forum Nachhaltiger Kakao: Falls Sie die bilaterale
        Vereinbarung zum Monitoring bezüglich Datensicherheit und
        -Vertraulichkeit noch nicht unterzeichnet haben, laden Sie bitte{" "}
        <a
          href="https://storage.googleapis.com/isco-storage/document/Standardvereinbarung_Monitoring_2022-03-24.docx"
          target="_blank"
          rel="noopener noreferrer"
        >
          DIESE DATEI
        </a>{" "}
        herunter und senden Sie uns zwei gedruckte Versionen schriftlich mit
        Ihrer Unterschrift zu. Sie erhalten ein von uns unterschriebenes
        Exemplar zurück.,
      </>
    ),
    // page title
    pageSubmissionProgress: "Submission Progress",
    // popup download request
    popupDownloadRequestMessage: "Anfrage herunterladen",
    popupDownloadRequestDescription:
      "Vielen Dank für die Anfrage zum Download der Daten. Die Sekretariatsverwaltung wird über Ihre Anfrage benachrichtigt. Sie erhalten von uns eine E-Mail, sobald Ihre Daten zum Download bereitstehen",
    // banner
    bannerSaveSurvey:
      "Please remember to save your data at regular intervals to prevent data loss due to enforcing circumstances.",
    bannerDownloadPage: "Data from the previous round will be available soon.",
  },
};

export default uiText;
