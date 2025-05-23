import { DeleteOutlined, DownloadOutlined, EditOutlined, EyeOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Button,
  ConfigProvider,
  Flex,
  Form,
  Image,
  Input,
  Modal,
  Pagination,
  Popconfirm,
  Select,
  Switch,
  Table,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import PropTypes from "prop-types";
import { useEffect, useState, useCallback } from "react";
import {
  CreateGrades,
  DeleteGrades,
  GetGrades,
  GradeSectionFilter,
  ImportStudents,
  PatchGrades,
} from "../../../../services/Index";
import excelsample from "../../../../assets/samplestudent.xlsx";
import edit from "../../../../assets/icons/edit.svg";
import rightArrow from "../../../../assets/icons/right-arrow.svg";
import download_icon from "../../../../assets/icons/download.svg";
import { useAppSelector } from "../../../../store/config/redux";
import { GrEdit } from "react-icons/gr";
import ThemeConfig from "../../../../utils/ThemeConfig";

const { Option } = Select;

const GradeTable = ({ grades, gradeOpen, setGradeOpen, setExcelOpen, excelOpen, handleRefresh }) => {
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [loading, setLoading] = useState(false);
  const [onEdit, setEdit] = useState(false);
  const [files, setFiles] = useState([]);
  const [disable, setDisable] = useState(false);
  const [sections, setSections] = useState([]);
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const selectedTheme = useAppSelector((state) => state.theme.theme);

  const handleView = useCallback(
    (grade) => {
      form1.setFieldsValue({
        name: grade.name,
      });
      setSelectedGrade(grade);
      setEdit(true);
    },
    [form1],
  );

  const handleDelete = useCallback(
    (id) => {
      DeleteGrades(id)
        .then(() => {
          message.success("Deleted Successfully!");
          handleRefresh();
        })
        .catch((err) => {
          console.error(err);
          message.error("Failed to delete grade");
        });
    },
    [handleRefresh],
  );

  const columns = [
    {
      title: "Grade Name",
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
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip placement="top" title="Delete">
            <Popconfirm
              title="Delete the Grade"
              description="Are you sure to delete this Grade?"
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

  const onAddFinish = useCallback(
    async (values) => {
      setDisable(true);
      try {
        await CreateGrades({ name: values.name });
        message.success("Grade created successfully!");
        handleRefresh();
        setGradeOpen(false);
        form.resetFields();
      } catch (error) {
        console.error(error);
        message.error("Failed to save grade");
      } finally {
        setDisable(false);
      }
    },
    [form, handleRefresh, setGradeOpen],
  );

  const onEditFinish = useCallback(
    async (values) => {
      setDisable(true);
      try {
        await PatchGrades(selectedGrade.id, { name: values.name });
        message.success("Grade updated successfully!");
        handleRefresh();
        setEdit(false);
        form1.resetFields();
      } catch (error) {
        console.error(error);
        message.error("Failed to save grade");
      } finally {
        setDisable(false);
      }
    },
    [selectedGrade, form1, handleRefresh],
  );

  const handleCancel = useCallback(() => {
    setGradeOpen(false);
    setExcelOpen(false);
    setEdit(false);
    form.resetFields();
  }, [form, setGradeOpen, setExcelOpen]);

  const handleCancel1 = useCallback(() => {
    setGradeOpen(false);
    setExcelOpen(false);
    setEdit(false);
    form1.resetFields();
  }, [form1, setGradeOpen, setExcelOpen]);

  const handleCancel2 = useCallback(() => {
    setGradeOpen(false);
    setExcelOpen(false);
    setEdit(false);
    form2.resetFields();
  }, [form2, setGradeOpen, setExcelOpen]);

  const ExcelUpload = useCallback(
    async (values) => {
      setDisable(true);
      const formData = new FormData();
      formData.append("file", files);
      formData.append("gradeId", values.gradeId);
      formData.append("sectionId", values.sectionId);
      try {
        await ImportStudents(formData);
        message.success("Student Import successfully!");
        setExcelOpen(false);
        handleRefresh();
        form2.resetFields();
      } catch (error) {
        message.error("Failed to save Student");
      } finally {
        setDisable(false);
      }
    },
    [files, form2, handleRefresh, setExcelOpen],
  );

  const handleGradeSelect = useCallback(
    async (value) => {
      try {
        const response = await GradeSectionFilter(value);
        setSections(response);
        form2.setFieldsValue({ sectionId: undefined });
      } catch (error) {
        console.error("Failed to fetch sections for the selected grade:", error);
        message.error("Failed to fetch sections for the selected grade.");
      }
    },
    [form2],
  );

  const handleDownloadSample = useCallback(() => {
    const link = document.createElement("a");
    link.href = excelsample;
    link.setAttribute("download", "samplestudent.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <>
    <ConfigProvider theme={ThemeConfig.light}>
      <Modal width={600} open={gradeOpen} onCancel={handleCancel} centered footer={null}>
        <Typography className="text-2xl text-center pt-10 text-[#9B4CFF] font-semibold">Create Grade</Typography>
        <div className="flex justify-center">
          <Form
            form={form}
            className="w-[536px]"
            onFinish={onAddFinish}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            autoComplete="off"
          >
            <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-semibold mt-3 mb-1">Name</Typography>
            <Form.Item name="name" rules={[{ required: true, message: "Please input grade name!" }]}>
              <Input className="bg-white text-black p-3" />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 9, span: 16 }}>
              <Button type="primary" htmlType="submit" disabled={disable} size="large">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      <Modal width={600} open={onEdit} onCancel={handleCancel1} footer={null}>
        <Typography className="text-2xl text-center pt-10 text-[#9B4CFF] font-semibold">Edit Grade</Typography>
        <div className="flex justify-center">
          <Form
            form={form1}
            className="w-[536px]"
            onFinish={onEditFinish}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            autoComplete="off"
            initialValues={{
              name: selectedGrade?.name,
            }}
          >
            <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-semibold mt-3 mb-1">Name</Typography>
            <Form.Item name="name" rules={[{ required: true, message: "Please input grade name!" }]}>
              <Input className="bg-white text-black p-3" />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 9, span: 16 }}>
              <Button type="primary" htmlType="submit" disabled={disable} size="large">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      <Modal width={600} open={excelOpen} onCancel={handleCancel2} footer={null}>
        <Typography className="text-xl text-center pt-10 text-[#2F3597] font-semibold">Import Student</Typography>
        <div className="flex justify-center">
          <Form
            form={form2}
            className="w-[536px]"
            onFinish={ExcelUpload}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            autoComplete="off"
          >
            <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-semibold mt-3 mb-1">
              Grade
            </Typography>
            <Form.Item name="gradeId" rules={[{ required: true, message: "Please select grade!" }]}>
              <Select placeholder="Choose grade" onChange={handleGradeSelect} className="h-[50px]">
                {grades?.map((grade) => (
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
            <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-semibold mt-3 mb-1">
              Section
            </Typography>
            <Form.Item name="sectionId" rules={[{ required: true, message: "Please select section!" }]}>
              <Select placeholder="Please select a section" className="h-[50px]">
                {sections?.map((section) => (
                  <Option key={section.id} value={section.id}>
                    <span
                      style={{
                        color: selectedTheme === "dark" ? "white" : "black",
                      }}
                    >
                      {section.name}
                    </span>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-semibold mt-3 mb-1">File</Typography>
            <Form.Item rules={[{ required: true, message: "Please Enter file!" }]}>
              <Upload
                name="file"
                listType="picture"
                maxCount={1}
                accept=".xlsx,.csv"
                beforeUpload={(file) => {
                  setFiles(file);
                  return false;
                }}
                onRemove={() => setFiles([])}
              >
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </Form.Item>
            <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-semibold mt-3 mb-1">
              Sample File
            </Typography>
            <Form.Item>
              <Button type="primary" onClick={handleDownloadSample} size="large" icon={<DownloadOutlined />}>
                Download Sample Excel
              </Button>
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 10, span: 16 }}>
              <Button type="primary" htmlType="submit" disabled={disable} size="large">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
      </ConfigProvider>

      <Table
        rowClassName={() => "rowClassName1"}
        loading={loading}
        className="mt-7"
        columns={columns}
        dataSource={grades}
        pagination={{
          position: ["bottomCenter"],
        }}
      />
    </>
  );
};

GradeTable.propTypes = {
  grades: PropTypes.array.isRequired,
  gradeOpen: PropTypes.bool.isRequired,
  setGradeOpen: PropTypes.func.isRequired,
  setExcelOpen: PropTypes.func.isRequired,
  excelOpen: PropTypes.bool.isRequired,
  handleRefresh: PropTypes.func.isRequired,
};

export default GradeTable;
