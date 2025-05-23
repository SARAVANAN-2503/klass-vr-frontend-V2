import { Button, ConfigProvider, Form, Modal, Select, Tabs, Typography, message } from "antd";

import FileSaver from "file-saver";
import { ExportStudents, GetGrades, GradeSectionFilter } from "../../../../services/Index";
import { useEffect, useState } from "react";
import GradeTable from "./GradeTable";
import SectionTable from "./SectionTable";
import StudentTable from "./StudentTable";
const { TabPane } = Tabs;
const { Option } = Select;
import ContentWrapper from "../../../../components/ContentWrapper";
import { useAppSelector } from "../../../../store/config/redux";
import ThemeConfig from "../../../../utils/ThemeConfig";

const StudentManagement = () => {
  // State variables
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [excelOpen, setExcelOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [gradeOpen, setGradeOpen] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const selectedTheme = useAppSelector((state) => state.theme.theme);
  const [selectedSection, setSelectedSection] = useState(null);
  const [studentOpen, setStudentOpen] = useState(false);
  // grade pagination start
  const [refresh, setRefresh] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [activeKey, setActiveKey] = useState(localStorage.getItem("activeTab_Student") || "1");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const gradeResponse = await GetGrades();
        setGrades(gradeResponse);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
        message.error(error.response ? error.response.data.message : "Error fetching data");
      }
    };

    fetchData();
  }, [refresh]);

  // Handlers for tab change and refresh
  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  // Operations buttons for each tab
  const operations = (
    <>
      <Button type="primary" onClick={() => setExportOpen(true)} className="bg-black mr-[10px]">
        Excel Export
      </Button>
      <Button type="primary" onClick={() => setExcelOpen(true)} className="bg-black mr-[10px]">
        Excel Import
      </Button>
      {activeKey === "1" && (
        <Button type="primary" onClick={() => handleAdd("grade")} className="bg-black mr-[10px]">
          Grade
        </Button>
      )}
      {activeKey === "2" && (
        <Button type="primary" onClick={() => handleAdd("section")} className="bg-black mr-[10px]">
          Section
        </Button>
      )}
      {activeKey == "3" && (
        <Button type="primary" onClick={() => handleAdd("student")} className="bg-black mr-[10px]">
          Student
        </Button>
      )}
    </>
  );

  // Handler for adding items (grade, section, student)
  const handleAdd = (type) => {
    form.resetFields();
    switch (type) {
      case "grade":
        setSelectedGrade(null);
        setGradeOpen(true);
        break;
      case "section":
        setSelectedSection(null);
        setSectionOpen(true);
        break;
      case "student":
        setSelectedStudent(null);
        setStudentOpen(true);
        break;
      default:
        break;
    }
  };

  const handleTabChange = (key) => {
    setActiveKey(key);
    localStorage.setItem("activeTab_Student", key);
  };

  const renderTabContent = () => {
    switch (activeKey) {
      case "1":
        return (
          <GradeTable
            grades={grades}
            setGradeOpen={setGradeOpen}
            handleRefresh={handleRefresh}
            gradeOpen={gradeOpen}
            setExcelOpen={setExcelOpen}
            excelOpen={excelOpen}
          />
        );
      case "2":
        return (
          <SectionTable
            grades={grades}
            sectionOpen={sectionOpen}
            setSectionOpen={setSectionOpen}
            setExcelOpen={setExcelOpen}
            excelOpen={excelOpen}
          />
        );
      case "3":
        return (
          <StudentTable
            grades={grades}
            studentOpen={studentOpen}
            setStudentOpen={setStudentOpen}
            setSelectedStudent={setSelectedStudent}
            selectedStudent={selectedStudent}
            setExcelOpen={setExcelOpen}
            excelOpen={excelOpen}
          />
        );
      default:
        return null;
    }
  };

  const base64ToBlob = (base64, contentType = "", sliceSize = 512) => {
    const base64Data = base64.includes("base64,") ? base64.split("base64,")[1] : base64;

    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  };

  const ExcelExport = async (values) => {
    const { gradeId, sectionId } = values;
    const requestData = { gradeId, sectionId };
    try {
      const response = await ExportStudents(requestData);
      const base64Response = response;

      if (!base64Response) {
        throw new Error("No base64 string received from the server.");
      }

      const blob = base64ToBlob(base64Response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

      FileSaver.saveAs(blob, "students.xlsx");

      message.success("Students exported successfully!");
      form1.resetFields();
      setExportOpen(false);
    } catch (error) {
      console.error(error);
      message.error("Failed to export students. " + (error.message || ""));
    }
  };

  const handleGradeSelect = async (value) => {
    try {
      const response = await GradeSectionFilter(value);
      setSections(response);
      form.setFieldsValue({ sectionId: undefined });
    } catch (error) {
      console.error("Failed to fetch sections for the selected grade:", error);
      message.error("Failed to fetch sections for the selected grade.");
    }
  };

  return (
    <>
      <ContentWrapper
        header="Student"
        extra={
          <div className="flex xl:gap-28 lg:gap-28 md:gap-20 sm:gap-14">
            <Tabs centered className="student_manage_tab" activeKey={activeKey} onChange={handleTabChange} type="line">
              <TabPane tab="Grade" key="1" />
              <TabPane tab="Section" key="2" />
              <TabPane tab="Students" key="3" />
            </Tabs>

            <div className="flex items-center">{operations}</div>
          </div>
        }
      >
        {renderTabContent()}
        <ConfigProvider theme={ThemeConfig.light}>
          <Modal width={600} open={exportOpen} onCancel={() => setExportOpen(false)} footer={null}>
            <Typography className="text-xl text-center pt-10 text-[#2F3597] font-semibold">Excel Export</Typography>
            <div className="flex justify-center">
              <Form
                form={form1}
                onFinish={ExcelExport}
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
                <div className="flex justify-center items-center">
                  <Form.Item>
                    <Button type="primary" htmlType="submit" size="large">
                      Export to Excel
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </div>
          </Modal>
        </ConfigProvider>
      </ContentWrapper>
    </>
  );
};

export default StudentManagement;
