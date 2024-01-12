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
    welcome2: "2023 Monitoring Round",
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
    formPreviousYearSubmission:
      "Choose a submission from previous year to pre-fill",
    formPreviousYearSubmissionEmptyOption: "Empty questionnaire",
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
    btnSave: "Save",
    lockedBy: "Locked",
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
    btnAgreeContinue: "Agree & Continue",
    btnCancel: "Cancel",
    // comment
    btnAddComment: "Add Comment",
    btnDeleteComment: "Delete Comment",
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
    tbColDISCOSharedMemberSurvey: "DISCO 2020 shared Member Survey",
    tbColSaved: "Saved",
    tbColSubmitted: "Submitted",
    tbColAll: "All",
    // Modal
    modalDataSecurity: "Data Security Provisions",
    modalSaveForm: "Save Form Data",
    modalWarning: "Warning",
    // Validation & Message
    valEmail: "The email field is required.",
    valFeedbackError: "Something wrong, please try again!",
    valFeedbackSuccess: "Your message has been successfully sent!",
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
    textAlertUserExist: "This email was already used to register a user.",
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
      "Please save your data at regular intervals to prevent data loss due to unforeseen circumstances.",
    bannerDownloadPage:
      "Data from previous monitoring rounds will be available soon.",
    faqTitle: "Frequently Asked Question",
    registrationInApprovalText: "Your registration is still pending approval.",
    // Submit Warning Modal Checkbox
    submitModalC1:
      "I have checked and tried to complete all mandatory fields that are marked as still to be completed.",
    submitModalC2:
      "I have used comments boxes in the corresponding question to explain why I cannot complete the still uncompleted mandatory fields.",
    submitModalC3: (
      <>
        After submitting your data, you will not be able to change it anymore.
        If you are still working on your submission for this round of data
        collection, please use{" "}
        <b>
          <i>&quot;Save&quot;</i>
        </b>
        . Are you sure you want to{" "}
        <b>
          <i>&quot;Submit&quot;</i>
        </b>
        ?
      </>
    ),
    submitModalC4: (
      <>
        If your survey is <b>locked</b>, please remember to <b>unlock</b> it if
        you want your colleague to continue to add data. Would you like to save
        the data?
      </>
    ),
    submitCoreMandatoryWarning: (
      <>Please answer all questions (marked with **) before submission.</>
    ),
    prefilledMismatchWarming:
      "Some responses may not be prefilled because of modifications to the questionnaire. Please review the data carefully before submitting.",
    infoSubmissionDropdown: "(saved/submitted)",
    // password criteria
    passwordCriteriaInfoText: "Criteria for the password:",
    lowercaseCharText: "Lowercase Character",
    numberCharText: "Numbers",
    specialCharText: "Special Character",
    eightCharText: "Min 8 Character",
    // download tab
    downloadDataText: "Download Data",
    formNameText: "Form Name",
    formTypeText: "Form Type",
    submittedDateText: "Submitted Date / Monitoring Round",
    actionText: "Action",
    formStatusText: "Status",
    // computed validation warning
    cvModalTitleText: "Failed validation(s)",
    cvMaxValueText: (
      <>
        <b>Expected maximum value</b>
      </>
    ),
    cvMinValueText: (
      <>
        <b>Expected minimum value</b>
      </>
    ),
    cvEqualValueText: (
      <>
        <b>Expected &quot;total value&quot; value must be equal to</b>
      </>
    ),
    cvTotalValueText: (
      <>
        <b>Total Value</b>
      </>
    ),
    inputDataUnavailable: "Data unavailable/NA",
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
    welcome2: "Monitoringrunde 2023",
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
    navHome: "Startseite",
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
    formPreviousYearSubmission: "Abgabe aus dem Vorjahr",
    formPreviousYearSubmissionEmptyOption: "Empty questionnaire",
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
    btnBackToLogin: "Zurück zur Login-Seite",
    btnUpdate: "Update",
    btnClose: "Schließen",
    btnSave: "Speichern",
    lockedBy: "Reserviert",
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
    btnAgreeContinue: "Zustimmen und weiter",
    btnCancel: "Löschen",
    // comment
    btnAddComment: "Kommentar hinzufügen",
    btnDeleteComment: "Kommentar löschen",
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
    tbColDISCOSharedMemberSurvey: "DISCO 2020 shared Member Survey",
    tbColSaved: "Gerettet",
    tbColSubmitted: "Eingereicht",
    // Modal
    modalDataSecurity: "Datensicherheitsmaßnahmen",
    modalSaveForm: "Daten speichern",
    modalWarning: "Warnung",
    // Validation & Message
    valEmail: "Die Email Angabe ist obligatorisch.",
    valFeedbackError:
      "Etwas ist schiefgelaufen, versuchen Sie es bitte noch einmal.",
    valFeedbackSuccess: "Ihre Nachricht wurde erfolgreich versendet.",
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
    textAlertUserExist:
      "Diese E-Mail wurde bereits verwendet, um einen Benutzer zu registrieren.",
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
      "Bitte speichern Sie Ihre Fragebögen regelmäßig, um zu verhindern, dass Eingaben durch unerwartete Unterbrechungen verloren gehen.",
    bannerDownloadPage:
      "Ihre Informationen aus der vergangenen Monitoringrunde werden in Kürze zum Herunterladen zur Verfügung stehen.",
    faqTitle: "Frequently Asked Question",
    registrationInApprovalText:
      "Ihre Registrierung muss noch verifiziert werden.",
    // Submit Warning Modal Checkbox
    submitModalC1:
      "Ich habe alle verpflichtenden Fragen, die als noch auszufüllen gekennzeichnet sind, geprüft und versucht auszufüllen.",
    submitModalC2:
      "Ich habe die Kommentarfelder zu den entsprechenden Fragen verwendet, um zu erklären, warum ich die noch nicht ausgefüllten Pflichtfelder nicht ausfüllen kann.",
    submitModalC3: (
      <>
        Nachdem Sie Ihren Fragebogen “eingereicht” haben (die{" "}
        <b>
          <i>„Submit“</i>
        </b>{" "}
        – Schaltfläche gedrückt haben), können Sie keine Änderungen mehr
        vornehmen. Wenn Sie noch an dem Fragebogen arbeiten, drücken Sie
        stattdessen{" "}
        <b>
          <i>„Save“</i>
        </b>
        . Sind Sie sicher, dass Sie diesen Fragebogen final einreichen wollen?
      </>
    ),
    // unlock warning translation
    submitModalC4: (
      <>
        Wenn das Häkchen bei <b>Reserviert</b> (rechts oben) aktiviert ist,
        denken Sie bitte daran, das <b>Häkchen</b> vor dem Speichern zu
        entfernen, falls eine Kollegin/ ein Kollege noch Daten eingeben soll.
        Möchten Sie den Fragebogen speichern?
      </>
    ),
    submitCoreMandatoryWarning: (
      <>
        <b>Einreichen ist nicht erlaubt!</b> Bitte beantworten Sie alle
        Kernpflichtfragen (mit einem doppelten Sternchen ** gekennzeichnet).
      </>
    ),
    prefilledMismatchWarming:
      "Einige der Antworten werden aufgrund des aktualisierten Formulars möglicherweise nicht angezeigt.",
    infoSubmissionDropdown: "(gespeichert/eingereicht)",
    // password criteria
    passwordCriteriaInfoText: "Kriterien für das Passwort:",
    lowercaseCharText: "Kleinbuchstabe",
    numberCharText: "Zahlen",
    specialCharText: "Sonderzeichen",
    eightCharText: "Mindestens 8 Zeichen",
    // download tab
    downloadDataText: "Daten herunterladen",
    formNameText: "Name des Fragebogens",
    formTypeText: "Art des Fragebogens",
    submittedDateText: "Datum und Jahr der Datenerhebung",
    actionText: "Aktion",
    // computed validation warning
    cvModalTitleText: "Validierung schlägt fehl",
    cvMaxValueText: "Validierung, Maximalwert",
    cvMinValueText: "Validierung, Mindestwert",
    cvEqualValueText: "Validierung, Wert muss gleich sein",
    cvTotalValueText: "Gesamtwert",
    inputDataUnavailable: "Daten nicht verfügbar/NV",
  },
};

export default uiText;

/**
 * (Can we add translations of the buttons „Submit” (German: Einreichen),
 * “Save” (German: Speichern) and “Locked” (Gesperrt für andere Nutzer) and
 * “Next” (German: Weiter)
 */
