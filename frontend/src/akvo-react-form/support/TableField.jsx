import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Button,
  Form,
  Popconfirm,
  Input,
  InputNumber,
  Select,
  Table,
} from "antd";
import { globalSelectProps } from "../../lib/util";

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  inputOptions,
  children,
  uiText,
  ...restProps
}) => {
  const inputNode =
    inputType === "number" ? (
      <InputNumber
        placeholder={`${uiText.pleaseInput} ${title}`}
        style={{ width: "100%" }}
      />
    ) : inputType === "option" ? (
      <Select
        style={{ width: "100%" }}
        options={inputOptions.map((o) => ({ value: o.name, label: o.name }))}
        placeholder={`${uiText.pleaseSelect} ${title}`}
        showSearch
        filterOption
        {...globalSelectProps}
      />
    ) : (
      <Input
        style={{ width: "100%" }}
        placeholder={`${uiText.pleaseInput} ${title}`}
      />
    );
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `${uiText.pleaseInput} ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const TableField = ({ columns, setValue, initialData = [], uiText }) => {
  const originColumns = columns.map((x) => {
    return {
      title: x?.label || x.name,
      dataIndex: x.name,
      inputType: x.type,
      inputOptions: x?.options,
      key: x.name,
      editable: true,
    };
  });

  const [form] = Form.useForm();
  const [data, setData] = useState(initialData);
  const [editingKey, setEditingKey] = useState("");

  useEffect(() => {
    if (initialData?.length) {
      setData(initialData);
    }
  }, [initialData]);

  const isEditing = (record) => record.key === editingKey;

  const handleDelete = (key) => {
    const newData = data.filter((item) => item.key !== key);
    setData(newData);
    setValue(newData);
  };

  const editingColumn = {
    title: "Action",
    dataIndex: "operation",
    render: (_, record) => {
      const editable = isEditing(record);
      return editable ? (
        <span>
          <Button
            onClick={() => save(record.key)}
            size="small"
            style={{
              marginRight: 8,
            }}
          >
            {uiText.save}
          </Button>
          <Popconfirm
            title={uiText.sureToCancel}
            onConfirm={cancel}
            cancelText={uiText.cancel}
          >
            <Button type="danger" size="small">
              {uiText.cancel}
            </Button>
          </Popconfirm>
        </span>
      ) : (
        <span>
          <Button
            disabled={editingKey !== ""}
            onClick={() => edit(record)}
            size="small"
            style={{
              marginRight: 8,
            }}
          >
            {uiText.edit}
          </Button>
          {data.length >= 1 ? (
            <Popconfirm
              title={uiText.sureToDelete}
              onConfirm={() => handleDelete(record.key)}
              cancelText={uiText.cancel}
            >
              <Button disabled={editingKey !== ""} type="danger" size="small">
                {uiText.delete}
              </Button>
            </Popconfirm>
          ) : null}
        </span>
      );
    },
  };

  const edit = (record) => {
    const defaultField = originColumns.reduce((curr, x) => {
      return { ...curr, [x.key]: null };
    }, {});

    form.setFieldsValue({
      ...defaultField,
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const onAddRow = () => {
    const keyN = data.length ? parseInt(data[data.length - 1].key) + 1 : 1;
    const defaultSource = originColumns.reduce(
      (curr, x) => {
        return { ...curr, [x.key]: "" };
      },
      { key: keyN.toString() }
    );
    setData([...data, defaultSource]);
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setValue(newData);
        setData(newData);
        setEditingKey("");
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.error(errInfo);
    }
  };

  const mergedColumns = [...originColumns, editingColumn].map((col) => {
    if (!col?.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.inputType,
        inputOptions: col?.inputOptions,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div className="arf-table-data">
      <Row
        justify="space-between"
        style={{ marginBottom: "10px" }}
        gutter={[20, 12]}
      >
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form form={form} component={false}>
            <Table
              components={{
                body: {
                  cell: (allProps) => (
                    <EditableCell uiText={uiText} {...allProps} />
                  ),
                },
              }}
              dataSource={data}
              columns={mergedColumns}
              rowClassName="editable-row"
              size="small"
              pagination={false}
              bordered
            />
          </Form>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Button onClick={onAddRow}>{uiText.add}</Button>
        </Col>
      </Row>
    </div>
  );
};

export default TableField;
