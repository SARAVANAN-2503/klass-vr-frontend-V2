import { DeleteOutlined } from "@ant-design/icons";
import { Button, Flex, Popconfirm, Table, Tooltip, Image } from "antd";
import PropTypes from "prop-types";
import edit from "../../../../assets/icons/edit.svg";
import { useAppSelector } from "../../../../store/config/redux";
import { GrEdit } from "react-icons/gr";

const TeacherManagementTable = ({ data, loading, handleDelete, handleView }) => {
  const selectedTheme = useAppSelector((state) => state.theme.theme);
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "40%",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "45%",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Action",
      key: "id",
      align: "center",
      width: "15%",
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
              title="Delete the Teacher"
              description="Are you sure to delete this teacher?"
              onConfirm={() => handleDelete(record.id)}
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

TeacherManagementTable.propTypes = {
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  handleDelete: PropTypes.func,
  handleView: PropTypes.func,
};

export default TeacherManagementTable;
