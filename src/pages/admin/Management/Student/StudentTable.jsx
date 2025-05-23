import React, { useEffect, useState, useCallback } from "react";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  ConfigProvider,
  Flex,
  Form,
  Image,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Table,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import PropTypes from "prop-types";
import {
  CreateStudents,
  DeleteStudents,
  GetStudents,
  GradeSectionFilter,
  ImportStudents,
  PatchStudents,
  SearchStudents,
} from "../../../../services/Index";
import excelsample from "../../../../assets/samplestudent.xlsx";
import download_icon from "../../../../assets/icons/download.svg";
import { useAppSelector } from "../../../../store/config/redux";
import { GrEdit } from "react-icons/gr";
import ThemeConfig from "../../../../utils/ThemeConfig";

const { Option } = Select;

const StudentTable = ({
  setStudentOpen,
  studentOpen,
  selectedStudent,
  setSelectedStudent,
  excelOpen,
  grades,
  setExcelOpen,
}) => {
  const [files, setFiles] = useState([]);
  const [disable, setDisable] = useState(false);
  const [disable1, setDisable1] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState({
    gradeId: "",
    sectionId: "",
  });
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [refresh, setRefresh] = useState(false);
  const [sections, setSections] = useState([]);
  const selectedTheme = useAppSelector((state) => state.theme.theme);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      if (searchValue.gradeId && searchValue.sectionId) {
        const searchResults = await SearchStudents(searchValue);
        setStudents(searchResults);
      } else {
        const response = await GetStudents();
        setStudents(response.results || response);
      }
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  }, [searchValue]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents, refresh]);

  const handleSearch = async (value, name) => {
    setSearchValue((prev) => ({ ...prev, [name]: value }));

    if (name === "gradeId") {
      try {
        const sections = await GradeSectionFilter(value);
        setSections(sections);
      } catch (error) {
        setSections([]);
        message.error("Failed to fetch sections");
      }
    }
  };
  const handleCancel = () => {
    setExcelOpen(false);
    form1.resetFields();
  };
  const handleGradeSelect = async (value) => {
    try {
      const sections = await GradeSectionFilter(value);
      setSections(sections);
      form.setFieldsValue({ sectionId: undefined });
    } catch (error) {
      message.error("Failed to fetch sections");
    }
  };

  const handleStudentDelete = async (id) => {
    try {
      await DeleteStudents(id);
      message.success("Deleted Successfully!");
      setRefresh((prev) => !prev);
    } catch (error) {
      message.error("Failed to delete student");
    }
  };

  const handleStudentEdit = (student) => {
    form.setFieldsValue({
      name: student.name,
      gradeId: student.gradeId?.id,
      sectionId: student.sectionId?.id,
    });
    setSelectedStudent(student);
    setStudentOpen(true);
  };

  const columns = [
    {
      title: "Grade Name",
      dataIndex: ["grade", "name"],
      key: "grade",
      render: (text) => text || "N/A",
    },
    {
      title: "Section Name",
      dataIndex: ["section", "name"],
      key: "section",
      render: (text) => text || "N/A",
    },
    {
      title: "Student Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: "15%",
      render: (_, record) => (
        <Flex wrap="wrap" gap="small" justify="center">
          <Tooltip placement="top" title="Edit">
            <Button
              type="primary"
              className="bg-transparent shadow-none"
              icon={<GrEdit className={`${selectedTheme === "dark" ? "text-white" : "text-black"}`} />}
              onClick={() => handleStudentEdit(record)}
            />
          </Tooltip>
          <Tooltip placement="top" title="Delete">
            <Popconfirm
              title="Delete the Student"
              description="Are you sure to delete this Student?"
              onConfirm={() => handleStudentDelete(record._id)}
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

  const onStudentFinish = async (values) => {
    setDisable(true);
    try {
      const requestData = { ...values };
      if (selectedStudent) {
        await PatchStudents(selectedStudent._id, requestData);
        message.success("Student updated successfully!");
      } else {
        await CreateStudents(requestData);
        message.success("Student created successfully!");
      }
      setStudentOpen(false);
      setRefresh((prev) => !prev);
      form.resetFields();
    } catch (error) {
      message.error("Failed to save Student");
    } finally {
      setDisable(false);
    }
  };

  const ExcelUpload = async (values) => {
    setDisable1(true);
    const formData = new FormData();
    formData.append("file", files);
    formData.append("gradeId", values.gradeId);
    formData.append("sectionId", values.sectionId);

    try {
      await ImportStudents(formData);
      message.success("Students imported successfully!");
      setExcelOpen(false);
      setRefresh((prev) => !prev);
      form1.resetFields();
    } catch (error) {
      message.error("Failed to import students");
    } finally {
      setDisable1(false);
    }
  };

  const handleDownloadSample = () => {
    const link = document.createElement("a");
    link.href = excelsample;
    link.download = "samplestudent.xlsx";
    link.click();
  };

  return (
    <>
      <ConfigProvider theme={ThemeConfig.light}>
        <Modal
          width={600}
          open={studentOpen}
          onCancel={() => {
            setStudentOpen(false);
            form.resetFields();
          }}
          footer={null}
        >
          <Typography className="text-xl text-center pt-10 text-[#2F3597] font-semibold">
            {selectedStudent ? "Edit " : "Create "}
            Student
          </Typography>

          <div className="flex justify-center">
            <Form
              form={form}
              className="w-[536px] "
              onFinish={onStudentFinish}
              labelCol={{
                span: 24,
              }}
              wrapperCol={{
                span: 24,
              }}
              autoComplete="off"
            >
              {!selectedStudent ? (
                <>
                  <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-semibold mt-3 mb-1">
                    Grade
                  </Typography>

                  <Form.Item name="gradeId" rules={[{ required: true, message: "Choose grade" }]}>
                    <Select placeholder="Choose grade" onChange={handleGradeSelect} className="h-[50px]">
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

                  <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-semibold mt-3 mb-1">
                    Section
                  </Typography>

                  <Form.Item name="sectionId" rules={[{ required: true, message: "Please select section!" }]}>
                    <Select placeholder="Please select a section" className="h-[50px]">
                      {sections.map((section) => (
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
                </>
              ) : null}

              <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-semibold mt-3 mb-1">
                Name
              </Typography>

              <Form.Item name="name" rules={[{ required: true, message: "Please input section name!" }]}>
                <Input size="large" className="F" />
              </Form.Item>

              <Form.Item wrapperCol={{ offset: 9, span: 16 }}>
                <Button type="primary" htmlType="submit" loading={disable} size="large">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Modal>
      </ConfigProvider>
      <ConfigProvider theme={ThemeConfig.light}>
        <Modal width={600} open={excelOpen} onCancel={handleCancel} footer={null}>
          <Typography className="text-xl text-center pt-10 text-[#2F3597] font-semibold">
            <Typography className="text-xl text-center pt-10 text-[#2F3597] font-semibold">
              Import Student
              {selectedStudent ? " Edit" : " Create"} Student
            </Typography>
          </Typography>

          <div className="flex justify-center">
            <Form
              form={form1}
              onFinish={ExcelUpload}
              labelCol={{
                span: 24,
              }}
              wrapperCol={{
                span: 24,
              }}
              className="w-[536px] "
              autoComplete="off"
            >
              <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-semibold mt-3 mb-1">
                Grade
              </Typography>

              <Form.Item name="gradeId" rules={[{ required: true, message: "Please select grade!" }]}>
                <Select className="h-[50px]" placeholder="Choose grade" onChange={handleGradeSelect}>
                  {grades &&
                    grades.map((grade) => (
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
                  {sections &&
                    sections.map((section) => (
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

              <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-semibold mt-3 mb-1">
                File
              </Typography>

              <Form.Item rules={[{ required: true, message: "Please Enter file!" }]}>
                <Upload
                  name="file"
                  listType="picture"
                  maxCount={1}
                  accept=".xlsx,.csv"
                  beforeUpload={(file) => {
                    handleFile(file);

                    return false;
                  }}
                  onRemove={() => handleRemovefile()}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>

              <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-semibold mt-3 mb-1">
                Sample File
              </Typography>

              <Form.Item>
                <Button type="primary" onClick={handleDownloadSample} className="" size="large">
                  <Image src={download_icon} className="w-[23px] mb-1 mr-3" alt="right arrow" preview={false} />{" "}
                  Download Sample Excel
                </Button>
              </Form.Item>

              <Form.Item wrapperCol={{ offset: 9, span: 16 }}>
                <Button type="primary" htmlType="submit" size="large" loading={disable1}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Modal>
      </ConfigProvider>
      <div className="flex items-center justify-between mt-3">
        <Row gutter={16} className="text-left">
          <Col span={12}>
            <Select
              showSearch
              placeholder="Select a Grade"
              allowClear
              className="min-w-72 h-[50px]"
              onChange={(value) => handleSearch(value, "gradeId")}
            >
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
          </Col>
          <Col span={12}>
            <Select
              showSearch
              placeholder="Select a Section"
              allowClear
              className="min-w-72 h-[50px]"
              onChange={(value) => handleSearch(value, "sectionId")}
            >
              {sections.map((section) => (
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
          </Col>
        </Row>
      </div>

      <Table
        rowClassName="rowClassName1"
        loading={loading}
        className="mt-7"
        columns={columns}
        dataSource={students}
        pagination={{
          position: ["bottomCenter"],
        }}
      />
    </>
  );
};

StudentTable.propTypes = {
  setStudentOpen: PropTypes.func.isRequired,
  studentOpen: PropTypes.bool.isRequired,
  selectedStudent: PropTypes.object,
  setSelectedStudent: PropTypes.func.isRequired,
  excelOpen: PropTypes.bool.isRequired,
  grades: PropTypes.array.isRequired,
  setExcelOpen: PropTypes.func.isRequired,
};

export default StudentTable;
