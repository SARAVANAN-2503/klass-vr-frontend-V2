import { DeleteOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Flex, Popconfirm, Switch, Table, Tooltip, message, Spin, InputNumber, Image } from "antd";
import PropTypes from "prop-types";
import { PatchStatus } from "../../../../services/Index";
import { useState, useCallback } from "react";
import edit from "../../../../assets/icons/edit.svg";
import { useAppSelector } from "../../../../store/config/redux";

const DeviceManagementTable = ({ data, loading, handleDelete, handleRefresh }) => {
  const selectedTheme = useAppSelector((state) => state.theme.theme);
  const [editingRecord, setEditingRecord] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleStatus = useCallback(
    async (id, data) => {
      try {
        await PatchStatus(id, data);
        message.success("Device updated successfully!");
        handleRefresh();
      } catch (error) {
        console.error("Error updating Device:", error);
        message.error(error.response?.data?.message || "Failed to update device");
      }
    },
    [handleRefresh],
  );

  const handleInputChange = useCallback((value, key) => {
    setEditingRecord((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleSave = useCallback(
    async (record) => {
      setSaving(true);
      try {
        await PatchStatus(record._id, { uniqueID: record.uniqueID });
        message.success("Device updated successfully!");
        handleRefresh();
        setEditingRecord(null);
      } catch (error) {
        console.error("Error updating Device:", error);
        message.error(error.response?.data?.message || "Failed to update device");
      } finally {
        setSaving(false);
      }
    },
    [handleRefresh],
  );

  const columns = [
    {
      title: "Device ID",
      dataIndex: "uniqueID",
      width: "15%",
      align: "left",
      key: "uniqueID",
      sorter: (a, b) => a.uniqueID.localeCompare(b.uniqueID),
      render: (text, record) =>
        editingRecord && editingRecord._id === record._id ? (
          <InputNumber
            className="w-full"
            value={editingRecord.uniqueID}
            onChange={(value) => handleInputChange(value.toString(), "uniqueID")}
          />
        ) : (
          text
        ),
    },
    {
      title: "Status",
      key: "isActive",
      width: "70%",
      align: "left",
      render: (_, record) => (
        <Spin spinning={loading}>
          <Switch checked={record.isActive} onChange={(checked) => handleStatus(record._id, { isActive: checked })} />
        </Spin>
      ),
    },
    {
      title: "Action",
      key: "id",
      fixed: "right",
      width: "15%",
      align: "center",
      render: (_, record) => (
        <Flex wrap="wrap" gap="small" justify="center">
          <Tooltip placement="top" title="Delete">
            <Popconfirm
              title="Delete the Device"
              description="Are you sure to delete this device?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                className="bg-transparent shadow-none"
                type="primary"
                icon={<DeleteOutlined className={`${selectedTheme === "dark" ? "text-white" : "text-black"}`} />}
              />
            </Popconfirm>
          </Tooltip>
        </Flex>
      ),
    },
  ];

  return (
    <Table
      rowClassName={() => "rowClassName1"}
      loading={loading}
      className="mt-7"
      columns={columns}
      dataSource={data}
      pagination={{
        position: ["bottomCenter"],
      }}
    />
  );
};

DeviceManagementTable.propTypes = {
  data: PropTypes.array.isRequired,
  handleRefresh: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  handleDelete: PropTypes.func.isRequired,
};

export default DeviceManagementTable;
