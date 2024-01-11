import React from "react";
import RequiredSign from "./RequiredSign";

const FieldLabel = ({ keyform, content, requiredSign = <RequiredSign /> }) => (
  <div className={`arf-field-label`}>
    <div className="arf-field-label-required-sign">{requiredSign}</div>
    <div className="arf-field-label-number">{keyform + 1}.</div>
    {content}
  </div>
);

export default FieldLabel;
