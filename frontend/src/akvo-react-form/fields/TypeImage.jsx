import React, { useState, useEffect } from "react";
import { Col, Form, Input, Upload, message } from "antd";
import { FieldLabel } from "../support";
import DraggerText from "../support/DraggerText";
import ImagePreview from "../support/ImagePreview";

const { Dragger } = Upload;

const FILE_TYPES = ["image/png", "image/jpeg", "image/jpg"];

const getImageBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result;
      resolve(base64String);
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

const convertImageToBase64 = (imgUrl) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.height = image.naturalHeight;
      canvas.width = image.naturalWidth;
      ctx.drawImage(image, 0, 0);
      const dataUrl = canvas.toDataURL();
      resolve(dataUrl);
    };
    image.src = imgUrl;
    image.onerror = (error) => {
      reject(error);
    };
  });
};

const TypeImage = ({
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  requiredSign,
  uiText,
  initialValue = null,
  limit = 2,
}) => {
  const [fileList, setFileList] = useState([]);
  const [preview, setPreview] = useState(null);
  const [visible, setVisible] = useState(false);
  const form = Form.useFormInstance();

  useEffect(() => {
    if (initialValue && fileList.length === 0) {
      convertImageToBase64(initialValue).then((initialBase64) => {
        form.setFieldsValue({ [id]: initialBase64 });
      });

      setFileList([
        {
          uid: "1",
          status: "done",
          name: initialValue,
          url: initialValue,
        },
      ]);
    }
  }, [initialValue, fileList, form, id]);

  const fileListExists = fileList.filter((f) => f?.status !== "removed");
  return (
    <Col>
      <Form.Item
        className="arf-field"
        label={
          <FieldLabel
            keyform={keyform}
            content={name}
            requiredSign={required ? requiredSign : null}
          />
        }
        tooltip={tooltip?.text}
        required={required}
      >
        <Form.Item
          className="arf-field-image"
          name={id}
          rules={rules}
          required={required}
          noStyle
        >
          <Input disabled hidden />
        </Form.Item>
        <Dragger
          multiple={false}
          listType="picture"
          fileList={fileListExists}
          customRequest={({ onSuccess }) => {
            onSuccess("ok");
          }}
          beforeUpload={(file) => {
            const fileMB = file.size / (1024 * 1024);
            const validate = fileMB <= limit && FILE_TYPES.includes(file.type);
            if (validate) {
              setFileList([
                {
                  ...file,
                  name: file.name,
                  url: URL.createObjectURL(file),
                },
              ]);
            }
            if (!validate) {
              setFileList([]);
              message.error(`${uiText.errorFileSize} ${limit} MB.`);
            }
            return validate;
          }}
          onChange={({ file: { status, originFileObj } }) => {
            if (fileList.length) {
              setFileList([
                {
                  ...fileList[0],
                  status,
                },
              ]);
            }
            if (originFileObj && (status === "success" || status === "done")) {
              getImageBase64(originFileObj).then((imageBase64String) => {
                form.setFieldsValue({ [id]: imageBase64String });
              });
            }
          }}
          onPreview={({ url }) => {
            setPreview(url);
            setVisible(true);
          }}
        >
          <DraggerText uiText={uiText} limit={limit} />
        </Dragger>
        <ImagePreview visible={visible} src={preview} onChange={setVisible} />
      </Form.Item>
    </Col>
  );
};
export default TypeImage;
