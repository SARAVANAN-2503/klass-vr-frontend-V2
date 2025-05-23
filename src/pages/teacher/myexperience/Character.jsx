import { Radio, Col, Select, Typography, Row, Form, Button, Image, Spin } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState, useCallback, memo } from "react";
import CE1 from "../../../assets/addExperience/ce1.jpeg";
import CE2 from "../../../assets/addExperience/ce2.jpeg";
import CE3 from "../../../assets/addExperience/ce3.jpeg";
import { useAppSelector } from "../../../store/config/redux";

const Character = memo(({ handleSave, addLoader, _edit, content, setContent, handleBack }) => {
  const [form] = Form.useForm();
  const [readingTime, setReadingTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const wordsPerMinute = 200;
  const selectedTheme = useAppSelector((state) => state.theme.theme);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setContent((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [setContent],
  );

  const handleSelect = useCallback(
    (name, value) => {
      setContent((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [setContent],
  );

  useEffect(() => {
    if (content.script?.length > 5) {
      const words = content.script.split(/\s+/).length;
      const totalSeconds = Math.ceil((words / wordsPerMinute) * 60);

      const hours = Math.floor(totalSeconds / 3600);
      const remainingSecondsAfterHours = totalSeconds % 3600;

      const minutes = Math.floor(remainingSecondsAfterHours / 60);
      const seconds = remainingSecondsAfterHours % 60;

      setReadingTime({
        hours,
        minutes,
        seconds,
      });
    }
  }, [content.script]);

  const renderSelectOption = useCallback(
    (value, label, icon = null) => (
      <Select.Option value={value}>
        <div className="flex justify-start items-center">
          {icon && <span className="w-8 flex justify-center items-center">{icon}</span>}
          <span
            style={{
              color: selectedTheme === "dark" ? "white" : "black",
            }}
          >
            {label}
          </span>
        </div>
      </Select.Option>
    ),
    [selectedTheme],
  );

  const renderEnvironmentRadio = useCallback(
    (value, image, label) => (
      <Radio value={value} className="flex flex-col items-center gap-2">
        <Image src={image} width="100%" height={100} />
        <Typography className="text-center mb-0 capitalize">{label}</Typography>
      </Radio>
    ),
    [],
  );

  const maleIcon = (
    <svg
      width="16px"
      height="16px"
      viewBox="0 0 24 24"
      fill={selectedTheme === "dark" ? "#fff" : "#000"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M15 3C15 2.44772 15.4477 2 16 2H20C21.1046 2 22 2.89543 22 4V8C22 8.55229 21.5523 9 21 9C20.4477 9 20 8.55228 20 8V5.41288L15.4671 9.94579C15.4171 9.99582 15.363 10.0394 15.3061 10.0767C16.3674 11.4342 17 13.1432 17 15C17 19.4183 13.4183 23 9 23C4.58172 23 1 19.4183 1 15C1 10.5817 4.58172 7 9 7C10.8559 7 12.5642 7.63197 13.9214 8.69246C13.9587 8.63539 14.0024 8.58128 14.0525 8.53118L18.5836 4H16C15.4477 4 15 3.55228 15 3ZM9 20.9963C5.68831 20.9963 3.00365 18.3117 3.00365 15C3.00365 11.6883 5.68831 9.00365 9 9.00365C12.3117 9.00365 14.9963 11.6883 14.9963 15C14.9963 18.3117 12.3117 20.9963 9 20.9963Z"
        // fill="#0F0F0F"
      />
    </svg>
  );

  const femaleIcon = (
    <svg width="16px" height="16px" viewBox="0 0 24 24" fill={selectedTheme === "dark" ? "#fff" : "#000"}>
      <path d="M20 9C20 13.0803 16.9453 16.4471 12.9981 16.9383C12.9994 16.9587 13 16.9793 13 17V19H14C14.5523 19 15 19.4477 15 20C15 20.5523 14.5523 21 14 21H13V22C13 22.5523 12.5523 23 12 23C11.4477 23 11 22.5523 11 22V21H10C9.44772 21 9 20.5523 9 20C9 19.4477 9.44772 19 10 19H11V17C11 16.9793 11.0006 16.9587 11.0019 16.9383C7.05466 16.4471 4 13.0803 4 9C4 4.58172 7.58172 1 12 1C16.4183 1 20 4.58172 20 9ZM6.00365 9C6.00365 12.3117 8.68831 14.9963 12 14.9963C15.3117 14.9963 17.9963 12.3117 17.9963 9C17.9963 5.68831 15.3117 3.00365 12 3.00365C8.68831 3.00365 6.00365 5.68831 6.00365 9Z" />
    </svg>
  );

  return (
    <Spin spinning={addLoader}>
      <Form
        name="basic"
        initialValues={{
          remember: true,
          teacherCharacterGender: content.teacherCharacterGender,
          classEnvironment: content.classEnvironment,
          language: content.language,
          script: content.script,
        }}
        onFinish={handleSave}
        form={form}
        autoComplete="off"
        layout="vertical"
      >
        <div className="inner-glass-card character">
          <Row gutter={[16, 16]} className="py-3">
            <Col span={24}>
              <p className="header-text">Character</p>
            </Col>

            <Col span={12}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item
                    label="Language"
                    name="language"
                    rules={[{ required: true, message: "Please select a language!" }]}
                  >
                    <Select
                      defaultValue={content.language}
                      style={{ width: "100%" }}
                      onChange={(value) => handleSelect("language", value)}
                      size="large"
                    >
                      {renderSelectOption("english", "English")}
                      {renderSelectOption("arabic", "Arabic")}
                      {renderSelectOption("spanish", "Spanish")}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label="Character Gender"
                    name="teacherCharacterGender"
                    rules={[{ required: true, message: "Please select character gender!" }]}
                  >
                    <Select
                      defaultValue={content.teacherCharacterGender}
                      style={{ width: "100%" }}
                      onChange={(value) => handleSelect("teacherCharacterGender", value)}
                      size="large"
                    >
                      {renderSelectOption("male", "Male", maleIcon)}
                      {renderSelectOption("female", "Female", femaleIcon)}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label="Class Environment"
                    name="classEnvironment"
                    rules={[{ required: true, message: "Please select a class environment!" }]}
                  >
                    <Radio.Group
                      value={content.classEnvironment}
                      onChange={(e) => handleSelect("classEnvironment", e.target.value)}
                      size="large"
                    >
                      <div className="flex flex-row gap-4">
                        {renderEnvironmentRadio("classEnvironment 1", CE1, "Classroom")}
                        {renderEnvironmentRadio("classEnvironment 2", CE2, "Forest Classroom")}
                        {renderEnvironmentRadio("classEnvironment 3", CE3, "Forest Environment")}
                      </div>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Script"
                name="script"
                rules={[
                  { required: true, message: "Please enter your character script!" },
                  { min: 5, message: "Character script must be at least 5 characters!" },
                ]}
              >
                <TextArea
                  name="script"
                  value={content.script}
                  onChange={handleChange}
                  placeholder="Please enter your character script"
                  autoSize={{ minRows: 12, maxRows: 12 }}
                />
              </Form.Item>
              <Typography className="text-right">
                <span className="flex items-center justify-start gap-4">
                  Reading Time{" "}
                  <span className="bg-black px-8 py-2 rounded-full text-[#fff]">{readingTime.minutes} min(s)</span>
                </span>
              </Typography>
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
            <div className={`flex justify-${_edit ? "end" : "start"} gap-4 ml-4 pl-4`}>
              {!_edit && (
                <Button type="primary" onClick={() => handleBack("1")} className="rounded-full bg-[#000]" size="large">
                  Previous
                </Button>
              )}
              <Form.Item>
                <Button size="large" type="primary" className="rounded-full" htmlType="submit" loading={addLoader}>
                  {_edit ? "Save" : "Continue"}
                </Button>
              </Form.Item>
            </div>
          </Col>
        )}
      </Form>
    </Spin>
  );
});

export default Character;
