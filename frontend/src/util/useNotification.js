import { useMemo } from "react";
import PropTypes from "prop-types";
import { notification } from "antd";

function useNotification() {
  return useMemo(() => {
    const notify = ({ type, message, duration = 5, ...props }) => {
      notification.open({
        type: type,
        description: message,
        duration: duration,
        style: { marginTop: 80 },
        ...props,
      });
    };
    notify.propTypes = {
      type: PropTypes.oneOf(["success", "error", "info", "warning"]),
      message: PropTypes.string,
      duration: PropTypes.number,
    };
    return { notify };
  }, []);
}

export default useNotification;
