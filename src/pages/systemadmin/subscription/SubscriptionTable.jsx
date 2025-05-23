import { DeleteOutlined } from "@ant-design/icons";
import { Button, Flex, Image, Popconfirm, Switch, Table, Tooltip, message } from "antd";
import PropTypes from "prop-types";
import { PatchSubscription } from "../../../services/Index";
import edit from "../../../assets/icons/edit.svg";
import { GrEdit } from "react-icons/gr";
import { useAppSelector } from "../../../store/config/redux";

const SubscriptionTable = ({ data, loading, handleDelete, handleRefresh, handleView }) => {
  const selectedTheme = useAppSelector((state) => state.theme.theme);
  const handleStatus = async (record, checked) => {
    try {
      await PatchSubscription(record._id, { isActive: checked });
      message.success("Subscription updated successfully!");
      handleRefresh();
    } catch (error) {
      message.error("Error updating subscription");
      console.error(error);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Term",
      dataIndex: "term",
      key: "term",
      sorter: (a, b) => a.term.localeCompare(b.term),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => a.description.localeCompare(b.description),
    },
    {
      title: "Status",
      key: "isActive",
      align: "left",
      render: (_, record) => <Switch checked={record.isActive} onChange={(checked) => handleStatus(record, checked)} />,
    },
    {
      title: "Action",
      key: "id",
      align: "center",
      render: (_, record) => (
        <Flex wrap="wrap" gap="small" justify="center">
          <Tooltip placement="top" title="Edit">
            <Button
              type="primary"
              className="bg-transparent shadow-none"
              icon={<GrEdit className={`${selectedTheme === "dark" ? "text-white" : "text-black"}`} />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip placement="top" title="Delete">
            <Popconfirm
              title="Delete the Subscription"
              description="Are you sure to delete this Subscription?"
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
      rowClassName="rowClassName1"
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

SubscriptionTable.propTypes = {
  data: PropTypes.array.isRequired,
  handleRefresh: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleView: PropTypes.func.isRequired,
};

export default SubscriptionTable;
