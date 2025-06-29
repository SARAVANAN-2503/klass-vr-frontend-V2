import { DeleteOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Flex, Popconfirm, Switch, Table, Tooltip, message, Spin, InputNumber } from "antd";
import PropTypes from "prop-types";
import { PatchStatus } from "../../../../services/Index";
import { useState } from "react";

const DeviceManagementTable = ({ data, loading, handleDelete, handleRefresh }) => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [switchLoadingId, setSwitchLoadingId] = useState(null);
  const [localStatusMap, setLocalStatusMap] = useState({}); // Optimistic toggle state

  const handleEdit = (record) => {
    setEditingRecord({ ...record });
  };

  const handleInputChange = (value, key) => {
    setEditingRecord((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async (record) => {
    setSaving(true);
    try {
      const data1 = { uniqueID: record.uniqueID };
      await PatchStatus(record._id, data1);
      message.success("Device updated successfully!");
      handleRefresh();
      setEditingRecord(null);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to update device");
      console.error("Error updating Device:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (record, newStatus) => {
    const id = record._id;
    setSwitchLoadingId(id);
    setLocalStatusMap((prev) => ({
      ...prev,
      [id]: newStatus,
    }));

    try {
      await PatchStatus(id, { isActive: newStatus });
      message.success("Device status updated!");
      handleRefresh();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to update status");
      // Revert if error
      setLocalStatusMap((prev) => ({
        ...prev,
        [id]: !newStatus,
      }));
    } finally {
      setSwitchLoadingId(null);
    }
  };

  const normalizeID = (val) => val?.toString().replace(/^0+/, "") || "";

  const isDuplicateUniqueID = (value, currentId) => {
    const normalizedValue = normalizeID(value);
    return data.some((item) => {
      const normalizedItemID = normalizeID(item.uniqueID);
      return item._id !== currentId && normalizedItemID === normalizedValue;
    });
  };

  const columns = [
    {
      title: "Device ID",
      dataIndex: "uniqueID",
      key: "uniqueID",
      sorter: (a, b) => a.uniqueID.localeCompare(b.uniqueID),
      render: (text, record) =>
        editingRecord && editingRecord._id === record._id ? (
          <InputNumber
            className="w-full"
            value={editingRecord.uniqueID}
            onChange={(value) => handleInputChange(value.toString(), "uniqueID")}
            status={isDuplicateUniqueID(editingRecord.uniqueID, editingRecord._id) ? "error" : ""}
          />
        ) : (
          text
        ),
    },
    {
      title: "Status",
      key: "isActive",
      align: "center",
      render: (_, record) => {
        const currentStatus = localStatusMap[record._id] !== undefined ? localStatusMap[record._id] : record.isActive;

        return (
          // <Spin spinning={switchLoadingId === record._id}>
            <Switch checked={currentStatus} onChange={(checked) => handleStatusToggle(record, checked)} loading={switchLoadingId === record._id} />
          // </Spin>
        );
      },
    },
    {
      title: "Action",
      key: "id",
      align: "center",
      render: (_, record) => (
        <Flex wrap="wrap" gap="small" justify="center">
          {editingRecord && editingRecord._id === record._id ? (
            <Tooltip
              title={
                isDuplicateUniqueID(editingRecord.uniqueID, editingRecord._id)
                  ? "This ID already exists."
                  : "Save changes"
              }
            >
              <Button
                type="primary"
                onClick={() => handleSave(editingRecord)}
                icon={<SaveOutlined />}
                loading={saving}
                disabled={isDuplicateUniqueID(editingRecord.uniqueID, editingRecord._id)}
              />
            </Tooltip>
          ) : (
            <Tooltip placement="top" title="Edit">
              <Button type="primary" onClick={() => handleEdit(record)}>
                <EditOutlined />
              </Button>
            </Tooltip>
          )}
          <Tooltip placement="top" title="Delete">
            <Popconfirm
              title="Delete the Device"
              description="Are you sure to delete this device?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary" icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Tooltip>
        </Flex>
      ),
    },
  ];

  return (
    <Table
      loading={loading}
      className="mt-4"
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
  handleRefresh: PropTypes.func,
  loading: PropTypes.bool,
  handleDelete: PropTypes.func,
};

export default DeviceManagementTable;
