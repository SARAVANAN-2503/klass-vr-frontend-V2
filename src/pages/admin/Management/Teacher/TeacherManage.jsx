import { Button, Form, Input, Modal, Image, message, Typography, ConfigProvider, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TeacherManagementTable from "./TeacherManagementTable";
import {
  CreateTeacher,
  DeleteTeacher,
  ExportTeacher,
  GetTeacher,
  ImportTeacher,
  PatchTeacher,
} from "../../../../services/Index";
import ContentWrapper from "../../../../components/ContentWrapper";
import add_icon from "../../../../assets/icons/add_button.svg";
import rightArrow from "../../../../assets/icons/right-arrow.svg";
import ThemeConfig from "../../../../utils/ThemeConfig";
import excelsample from "../../../../assets/sampleTeacher.xlsx";
import download_icon from "../../../../assets/icons/download.svg";
import FileSaver from "file-saver";

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [isImportModal, setIsImportModal] = useState(false);
  const [importLoader, setImportLoader] = useState(false);
  const [importFile, setImportFile] = useState(null);

  const [exportLoader, setExportLoader] = useState(false);

  const nav = useNavigate();

  const handleRefresh = useCallback(() => {
    setRefresh((prev) => !prev);
  }, []);

  const handleCancel = useCallback(() => {
    form.resetFields();
    setOpen(false);
  }, [form]);

  const showModal = useCallback(() => {
    form.resetFields();
    setSelectedTeacher(null);
    setOpen(true);
  }, [form]);

  const onFinish = useCallback(
    async (values) => {
      setBtnLoading(true);
      const { name, email, password } = values;
      const requestData = {
        name,
        email,
        password,
        ...(selectedTeacher ? {} : { role: "teacher" }),
      };

      try {
        if (selectedTeacher) {
          await PatchTeacher(selectedTeacher.id, requestData);
          message.success("Teacher updated successfully!");
        } else {
          await CreateTeacher(requestData);
          message.success("Teacher created successfully!");
        }
        handleRefresh();
        setOpen(false);
        form.resetFields();
      } catch (error) {
        message.error(error.response?.data?.message || "Operation failed");
      } finally {
        setBtnLoading(false);
      }
    },
    [selectedTeacher, form, handleRefresh],
  );

  const handleDelete = useCallback(
    async (id) => {
      try {
        await DeleteTeacher(id);
        message.success("Deleted Successfully!");
        handleRefresh();
      } catch (error) {
        console.error(error);
        message.error("Failed to delete teacher");
      }
    },
    [handleRefresh],
  );

  const handleView = useCallback(
    (teacher) => {
      if (teacher) {
        form.setFieldsValue({
          name: teacher.name,
          email: teacher.email,
        });
        setSelectedTeacher(teacher);
      }
      setOpen(true);
    },
    [form],
  );

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await GetTeacher();
        setTeachers(
          res.results.map((item) => ({
            ...item,
            key: item.id,
          })),
        );
      } catch (error) {
        const errRes = error.response?.data;
        if (errRes?.code === 401) {
          message.error(errRes.message);
          nav("/login", { replace: true });
        } else {
          message.error(errRes?.message || "Failed to fetch teachers");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [refresh, nav]);

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

  const handleExport = async () => {
    setExportLoader(true);
    await ExportTeacher()
      .then((res) => {
        const base64Response = res;

        if (!base64Response) {
          throw new Error("No base64 string received from the server.");
        }

        const blob = base64ToBlob(base64Response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        FileSaver.saveAs(blob, "Teachers.xlsx");
        message.success("Teachers Exported successfully!");
      })
      .catch((err) => {
        console.error(err);
        message.error("Failed to import teachers");
      })
      .finally(() => {
        setExportLoader(false);
      });
  };
  const handleImport = async () => {
    const formData = new FormData();

    formData.append("file", importFile);

    setImportLoader(true);
    await ImportTeacher(formData)
      .then((res) => {
        message.success("Teachers imported successfully!");
        handleRefresh();
      })
      .catch((err) => {
        console.error(err);
        message.error("Failed to import teachers");
      })
      .finally(() => {
        setImportLoader(false);
        setImportFile(null);
        setIsImportModal(false);
      });
  };

  const OpenImportModal = () => {
    setIsImportModal(!isImportModal);
  };

  const handleDownloadSample = () => {
    const link = document.createElement("a");
    link.href = excelsample;
    link.download = "sampleTeacher.xlsx";
    link.click();
  };

  const handleFile = (file) => {
    setImportFile(file);
  };

  return (
    <ContentWrapper
      header="Teacher"
      extra={
        <div className="flex gap-4 items-center">
          <Button type="primary" className="bg-black" onClick={handleExport} loading={exportLoader}>
            Excel Export
          </Button>
          <Button type="primary" className="bg-black" onClick={OpenImportModal}>
            Excel Import
          </Button>
          <Button type="primary" className="bg-black" onClick={showModal}>
            Add Teacher <Image src={add_icon} className="p-0 m-0 mb-1 w-[17px]" preview={false} />
          </Button>
        </div>
      }
    >
      <ConfigProvider theme={ThemeConfig.light}>
        <Modal width={600} open={open} onCancel={handleCancel} footer={null}>
          <Typography className="text-xl text-center pt-10 text-[#2F3597] font-semibold">
            {selectedTeacher ? "Edit " : "Create "}
            Teacher
          </Typography>
          <div className="flex justify-center">
            <Form
              form={form}
              name="register"
              loading={loading}
              className="w-[536px] "
              onFinish={onFinish}
              labelCol={{
                span: 24,
              }}
              wrapperCol={{
                span: 24,
              }}
              initialValues={{
                remember: true,
              }}
              autoComplete="off"
            >
              <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-semibold mt-3 mb-1">
                Name
              </Typography>
              <Form.Item
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please input your Name!",
                  },
                ]}
              >
                <Input className=" p-3" />
              </Form.Item>
              <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-semibold mt-3 mb-1">
                E-mail
              </Typography>
              <Form.Item
                name="email"
                rules={[
                  {
                    type: "email",
                    message: "The input is not valid E-mail!",
                  },
                  {
                    required: true,
                    message: "Please input your E-mail!",
                  },
                ]}
              >
                <Input className=" p-3" />
              </Form.Item>
              <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-semibold mt-3 mb-1">
                Password
              </Typography>
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                  {
                    min: 8,
                    message: "Password must be at least 8 characters long!",
                  },
                  {
                    pattern: /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{8,}$/,
                    message: "Password must contain at least one number, one special character, and one letter!",
                  },
                ]}
                hasFeedback
              >
                <Input.Password className=" p-3" />
              </Form.Item>
              <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-semibold mt-3 mb-1">
                Confirm Password
              </Typography>
              <Form.Item
                name="confirm"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please confirm your password!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("The new password that you entered do not match!"));
                    },
                  }),
                ]}
              >
                <Input.Password className=" p-3" />
              </Form.Item>

              <Form.Item
                wrapperCol={{
                  offset: 10,
                  span: 16,
                }}
              >
                <Button type="primary" htmlType="submit" loading={btnLoading}>
                  Submit <Image src={rightArrow} alt="right arrow" preview={false} />
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Modal>
      </ConfigProvider>
      <TeacherManagementTable
        data={teachers}
        handleRefresh={handleRefresh}
        loading={loading}
        handleDelete={handleDelete}
        handleView={handleView}
      />

      <ConfigProvider theme={ThemeConfig.light}>
        <Modal width={600} open={isImportModal} onCancel={() => setIsImportModal(false)} footer={null}>
          <Typography className="text-xl text-center pt-10 text-[#2F3597] font-semibold">Import Excel</Typography>
          <div className="flex flex-col gap-4 p-4">
            <div>
              <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-semibold mt-3 mb-1">
                File
              </Typography>
              <Upload
                name="file"
                listType="picture"
                maxCount={1}
                accept=".xlsx,.csv"
                fileList={importFile ? [importFile] : []}
                beforeUpload={(file) => {
                  handleFile(file);
                  return false;
                }}
                onRemove={() => {
                  setImportFile(null);
                  return true;
                }}
                style={{ width: "100%" }}
              >
                <Button icon={<UploadOutlined />} style={{ width: "100%" }}>
                  Upload
                </Button>
              </Upload>
            </div>

            <div>
              <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-semibold mt-3 mb-1">
                Sample File
              </Typography>
              <Button type="primary" onClick={handleDownloadSample} className="" size="large">
                <Image src={download_icon} className="w-[23px] mb-1 mr-3" alt="right arrow" preview={false} /> Download
                Sample Excel
              </Button>
            </div>

            <div className="flex justify-center items-center">
              <Button type="primary" size="large" loading={importLoader} onClick={handleImport}>
                Submit
              </Button>
            </div>
          </div>
        </Modal>
      </ConfigProvider>
    </ContentWrapper>
  );
};

export default TeacherManagement;
