import React, { useEffect, useState } from "react";
import { Select } from "antd";

const MonitoringRoundSelector = ({ options, value, onChange }) => {
  const [round, setRound] = useState([]);

  useEffect(() => {
    // generate monitoring round
    let startYear = 2022;
    const currentYear = new Date().getFullYear();
    const roundTmp = [];
    while (startYear <= currentYear) {
      roundTmp.push(startYear++);
    }
    setRound(roundTmp.map((x) => ({ label: x, value: x })));
  }, []);

  return (
    <Select
      allowClear
      showArrow
      showSearch
      className="custom-dropdown-wrapper monitoring-round-selector"
      placeholder="Select Monitoring Round"
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      options={options || round}
      value={value}
      onChange={onChange}
    />
  );
};

export default MonitoringRoundSelector;
