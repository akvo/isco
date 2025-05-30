import React, { useEffect, useState } from "react";
import { Select } from "antd";
import { globalSelectProps } from "../lib/util";

const MonitoringRoundSelector = ({
  options,
  value,
  onChange,
  className = null,
  style = null,
  disabled = false,
}) => {
  const [round, setRound] = useState([]);

  useEffect(() => {
    // generate monitoring round
    let startYear = 2022;
    const currentYear = new Date().getFullYear();
    const roundTmp = [];
    while (startYear <= currentYear) {
      roundTmp.push(startYear++);
    }
    setRound(roundTmp.map((x) => ({ label: String(x), value: x })));
  }, []);

  return (
    <Select
      showArrow
      showSearch
      className={`custom-dropdown-wrapper ${className ? className : ""}`}
      placeholder="Monitoring Round"
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      options={options || round}
      value={value}
      onChange={onChange}
      style={style ? style : { width: "11rem" }}
      disabled={disabled}
      {...globalSelectProps}
    />
  );
};

export default MonitoringRoundSelector;
