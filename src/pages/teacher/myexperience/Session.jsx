// Session.js
import { useState } from "react";
import { Button, Col, Form, Input, Row, Select, Spin } from "antd";
import subjectOptions from "../../../json/subject";
import { useAppSelector } from "../../../store/config/redux";

const Session = ({ uniqueGrades, handleSave, session, addLoader, setSession, _edit }) => {
  const [form] = Form.useForm();
  const selectedTheme = useAppSelector((state) => state.theme.theme);

  const handleSession = (name, value) => {
    setSession((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const textColor = {
    color: selectedTheme === "dark" ? "white" : "black",
  };

  return (
    <Spin spinning={addLoader}>
      <Form
        name="basic"
        initialValues={{
          remember: true,
          name: session.name,
          grade: session.grade || undefined,
          subject: session.subject,
        }}
        onFinish={handleSave}
        autoComplete="off"
        form={form}
        layout="vertical"
      >
        <div className="inner-glass-card">
          <Row gutter={[16, 16]} className="py-3">
            {/* <Col span={24}>
              <p className="header-text">Experience</p>
            </Col> */}
            <Col span={_edit ? 8 : 24}>
              <Form.Item
                label="Experience Name"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please input your name!",
                  },
                  {
                    min: 5,
                    message: "Experience name must be at least 5 characters!",
                  },
                ]}
              >
                <Input
                  size="large"
                  name="name"
                  placeholder="Please enter Experience name"
                  onChange={(e) => handleSession("name", e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={_edit ? 8 : 12}>
              <Form.Item
                label="Grade"
                name="grade"
                rules={[
                  {
                    required: true,
                    message: "Please input your grade!",
                  },
                ]}
              >
                <Select
                  style={{ width: "100%" }}
                  onChange={(value) => handleSession("grade", value)}
                  options={uniqueGrades.map((grade) => ({
                    label: <span style={textColor}>{grade.name}</span>,
                    value: grade.name,
                  }))}
                  placeholder="Please Select a Grade"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={_edit ? 8 : 12}>
              <Form.Item
                label="Subject"
                name="subject"
                rules={[
                  {
                    required: true,
                    message: "Please select your subject!",
                  },
                ]}
              >
                <Select
                  style={{ width: "100%" }}
                  onChange={(value) => handleSession("subject", value)}
                  options={subjectOptions.map((grade) => ({
                    label: <span style={textColor}>{grade.label}</span>,
                    value: grade.value,
                  }))}
                  placeholder="Please Select a Subject"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
        {_edit ? (
          <div className="fixed top-[-38px] right-[10px]">
            <Form.Item className="m-0">
              <Button type="primary" htmlType="submit" loading={addLoader} className="rounded-full">
                {_edit ? "Save" : "Continue"}
              </Button>
            </Form.Item>
          </div>
        ) : (
          <Col span={24}>
            <div className={`flex ${_edit ? "justify-end" : "justify-start"} ml-4 pl-4`}>
              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" loading={addLoader} className="rounded-full">
                  {_edit ? "Save" : "Continue"}
                </Button>
              </Form.Item>
            </div>
          </Col>
        )}
      </Form>
    </Spin>
  );
};

export default Session;
