import { DeleteOutlined } from "@ant-design/icons";
import { Button, ConfigProvider, Flex, Form, Image, Input, Modal, Popconfirm, Select, Table, Tooltip, Typography, message } from "antd";
import PropTypes from "prop-types";
import { CreateSections, DeleteSections, GetSections, PatchSections } from "../../../../services/Index";
import { useEffect, useState, useCallback } from "react";
import edit from "../../../../assets/icons/edit.svg";
import { useAppSelector } from "../../../../store/config/redux";
import { GrEdit } from "react-icons/gr";
import ThemeConfig from "../../../../utils/ThemeConfig";

const { Option } = Select;

const SectionTable = ({ setSectionOpen, sectionOpen, grades }) => {
  const [refresh, setRefresh] = useState(false);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onEdit, setEdit] = useState(false);
  const [disable, setDisable] = useState(false);
  const [form] = Form.useForm();
  const [selectedSection, setSelectedSection] = useState(null);
  const selectedTheme = useAppSelector((state) => state.theme.theme);

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      const sectionResponse = await GetSections();
      setSections(sectionResponse);
    } catch (error) {
      console.error(error);
      message.error(error.response ? error.response.data.message : "Error fetching data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [refresh, fetchSections]);

  const columns = [
    {
      title: "Grade Name",
      dataIndex: ["gradeId", "name"],
      key: "grade",
      render: (text) => text || "N/A",
    },
    {
      title: "Section Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
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
              onClick={() => handleSectionEdit(record)}
            />
          </Tooltip>
          <Tooltip placement="top" title="Delete">
            <Popconfirm
              title="Delete the Section"
              description="Are you sure to delete this Section?"
              onConfirm={() => handleSectionDelete(record.id)}
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

  const handleSubmit = async (values, isEdit = false) => {
    setDisable(true);
    const { name, gradeId } = values;
    const requestData = { name, gradeId };

    try {
      if (isEdit) {
        await PatchSections(selectedSection.id, requestData);
        message.success("Section updated successfully!");
        setEdit(false);
      } else {
        await CreateSections(requestData);
        message.success("Section created successfully!");
        setSectionOpen(false);
      }
      setRefresh(!refresh);
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error(`Failed to ${isEdit ? "update" : "save"} section`);
    } finally {
      setDisable(false);
    }
  };

  const handleSectionDelete = async (id) => {
    try {
      await DeleteSections(id);
      message.success("Deleted Successfully!");
      setRefresh(!refresh);
    } catch (error) {
      console.error(error);
      message.error("Failed to delete section");
    }
  };

  const handleSectionEdit = (section) => {
    form.setFieldsValue({
      name: section.name,
      gradeId: section.gradeId.id,
    });
    setSelectedSection(section);
    setEdit(true);
  };

  const handleCancel = () => {
    setEdit(false);
    setSectionOpen(false);
    form.resetFields();
  };

  const SectionForm = ({ title, onFinish }) => (
    <>
      <Typography className="text-xl text-center pt-10 text-[#2F3597] font-semibold">{title}</Typography>
      <div className="flex justify-center">
        <Form
          form={form}
          className="w-[536px]"
          onFinish={onFinish}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          autoComplete="off"
        >
          <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-semibold mt-3 mb-1">Grade</Typography>
          <Form.Item name="gradeId" rules={[{ required: true, message: "Choose grade!" }]}>
            <Select placeholder="Choose grade" className="h-[50px]">
              {grades.map((grade) => (
                <Option key={grade.id} value={grade.id}>
                  <span
                    style={{
                      color: selectedTheme === "dark" ? "white" : "black",
                    }}
                  >
                    {grade.name}
                  </span>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-semibold mt-3 mb-1">Name</Typography>
          <Form.Item name="name" rules={[{ required: true, message: "Please input section name!" }]}>
            <Input className="bg-white text-black p-3" />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 9, span: 16 }}>
            <Button type="primary" htmlType="submit" disabled={disable} size="large">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );

  return (
    <>
      <Table
        rowClassName={() => "rowClassName1"}
        loading={loading}
        className="mt-7"
        columns={columns}
        dataSource={sections}
        pagination={{
          position: ["bottomCenter"],
        }}
      />
      <ConfigProvider theme={ThemeConfig.light}>
        <Modal width={600} open={sectionOpen} onCancel={handleCancel} footer={null}>
          <SectionForm title="Create Section" onFinish={(values) => handleSubmit(values, false)} />
        </Modal>
        <Modal width={600} open={onEdit} onCancel={handleCancel} footer={null}>
          <SectionForm title="Edit Section" onFinish={(values) => handleSubmit(values, true)} />
        </Modal>
      </ConfigProvider>
    </>
  );
};

SectionTable.propTypes = {
  setSectionOpen: PropTypes.func.isRequired,
  sectionOpen: PropTypes.bool.isRequired,
  grades: PropTypes.array.isRequired,
};

export default SectionTable;
