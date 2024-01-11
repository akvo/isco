import React from "react";
import { Image } from "antd";

const ImagePreview = ({
  src,
  onChange,
  visible = false,
  width = 200,
  scaleStep = 0.5,
}) => {
  return (
    <Image
      width={width}
      style={{ display: "none" }}
      src={src}
      preview={{
        visible,
        src,
        scaleStep,
        onVisibleChange: (value) => onChange(value),
      }}
    />
  );
};

export default ImagePreview;
