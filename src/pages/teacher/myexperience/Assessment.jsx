import { Button, Card, Col, Row, Input, Radio, Switch, Form, Spin } from "antd";
import { useEffect, useState, useCallback, memo } from "react";
import { DeleteFilled, PlusOutlined } from "@ant-design/icons";
import { DeleteAssessments } from "../../../services/Index";
import archery from "../../../assets/dashboard/Archery.png";
import mcq from "../../../assets/dashboard/mcqs.png";
import basketball from "../../../assets/dashboard/basket_ball.png";
import "./style.css";
import { useAppSelector } from "../../../store/config/redux";

const Assessment = memo(({ _edit, addLoader, assessment, setAssessment, setDisableFields }) => {
  const [loading, setLoading] = useState([]);
  const selectedTheme = useAppSelector((state) => state.theme.theme);
  const createNewQuestion = useCallback(
    () => ({
      question: "",
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      isDraft: true,
      typeOfGame: "",
    }),
    [],
  );

  useEffect(() => {
    const isAllValid = assessment.every((item, index) => {
      const isQuestionValid = item.question.trim().length > 5;
      const isGameValid = index === 0 ? item.typeOfGame.trim() !== "" : true;
      const isCorrectValid = item.options.some((ans) => ans.isCorrect);
      const isTextValid = item.options.every((ans) => ans.text.trim() !== "");

      return isQuestionValid && isTextValid && isCorrectValid && isGameValid;
    });

    setDisableFields(!isAllValid);
  }, [assessment, setDisableFields]);

  const handleChange = useCallback(
    (e, index, ansIndex) => {
      const { name, value } = e.target;
      setAssessment((prev) => {
        const updated = [...prev];
        if (name === "question") {
          updated[index][name] = value;
        } else {
          updated[index].options[ansIndex].text = value;
        }
        return updated;
      });
    },
    [setAssessment],
  );

  const handleSwitch = useCallback(
    (value, index, ansIndex) => {
      setAssessment((prev) => {
        const updated = [...prev];
        if (value) {
          updated[index].options.forEach((option, i) => {
            option.isCorrect = i === ansIndex;
          });
        } else {
          updated[index].options[ansIndex].isCorrect = value;
        }
        return updated;
      });
    },
    [setAssessment],
  );

  const addNewQuestion = useCallback(() => {
    setAssessment((prev) => [...prev, createNewQuestion()]);
  }, [createNewQuestion, setAssessment]);

  const handleDelete = useCallback(
    async (index) => {
      setLoading((prev) => {
        const newLoading = [...prev];
        newLoading[index] = true;
        return newLoading;
      });

      try {
        const assessmentId = assessment[index].assessmentId;
        if (assessmentId) {
          await DeleteAssessments(assessmentId);
        }

        setAssessment((prev) => prev.filter((_, i) => i !== index));
      } catch (error) {
        console.error("Failed to delete assessment:", error);
      } finally {
        setLoading((prev) => {
          const newLoading = [...prev];
          newLoading[index] = false;
          return newLoading;
        });
      }
    },
    [assessment, setAssessment],
  );

  const handleGameTypeChange = useCallback(
    (e, index) => {
      const selectedValue = e.target.value;
      setAssessment((prev) => {
        const updated = [...prev];
        updated[index].typeOfGame = selectedValue;
        return updated;
      });
    },
    [setAssessment],
  );

  const renderGameTypeRadio = useCallback(
    (index, typeOfGame) => (
      <Row className="flex flex-col gap-3 mb-8 mt-8">
        <p className="text-[#000] text-[14px] font-[400] m-0">Choose type of Game</p>
        <Radio.Group
          onChange={(e) => handleGameTypeChange(e, index)}
          value={typeOfGame}
          className="flex gap-6 justify-start items-center custom-radio-group"
        >
          {[
            { value: "Archery", icon: archery },
            { value: "MCQ", icon: mcq },
            { value: "Basketball", icon: basketball },
          ].map(({ value, icon }) => (
            <Radio key={value} value={value} className="flex items-center gap-2">
              <span>{value}</span>
              <img src={icon} alt={value.toLowerCase()} height={30} width={30} />
            </Radio>
          ))}
        </Radio.Group>
      </Row>
    ),
    [handleGameTypeChange],
  );

  const renderOptions = useCallback(
    (options, index, selectedTheme) => (
      <Row gutter={16}>
        {options.map((ans, i) => (
          <Col span={12} key={i} className="mb-4">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-[10px] ${
                selectedTheme === "dark" ? "bg-[#FFFFFF29]" : "bg-[#fff]"
              }`}
            >
              <div
                className={`flex items-center justify-center gap-2 rounded-full w-[32px] h-[32px] ${
                  selectedTheme === "dark" ? "bg-[#FFFFFF29]" : "bg-[#ffffff1c]"
                }`}
              >
                <p className="text-[#000] text-[14px] font-bold py-2 px-3">{String.fromCharCode(65 + i)}</p>
              </div>
              <Input
                value={ans.text}
                placeholder="Enter the Answer"
                onChange={(e) => handleChange(e, index, i)}
                variant="filled"
                className="bg-transparent"
              />
              <Switch checked={ans.isCorrect} onChange={(e) => handleSwitch(e, index, i)} />
            </div>
          </Col>
        ))}
      </Row>
    ),
    [handleChange, handleSwitch],
  );

  return (
    <Spin spinning={addLoader}>
      {/* <Card className="glass-effect assessment mb-12">
        <p className="text-[24px] text-[#000] font-bold m-0 mb-3">
          Assessment
        </p>
      </Card> */}
      {/* <Card className="glass-effect assessment"> */}
      <Row className="flex justify-between">
        <Col span={24}>
          <Form.List name="questions">
            {() => (
              <>
                {assessment.map((item, index) => (
                  <Card
                    key={index}
                    size="small"
                    className="my-5 glass-effect"
                    title={<span className="text-[24px] font-[700]">MCQ {index + 1}</span>}
                    extra={
                      loading[index] ? (
                        <Spin />
                      ) : (
                        <Button
                          type="primary"
                          onClick={() => handleDelete(index)}
                          icon={<DeleteFilled />}
                          className="delete-button"
                        />
                      )
                    }
                  >
                    {renderGameTypeRadio(index, item.typeOfGame)}
                    <Row className="flex mb-8">
                      <p>Question</p>
                      <Input
                        className="w-full"
                        name="question"
                        value={item.question}
                        placeholder="Enter the question"
                        onChange={(e) => handleChange(e, index)}
                      />
                    </Row>
                    {renderOptions(item.options, index, selectedTheme)}
                  </Card>
                ))}
                {!_edit ? (
                  <Button
                    type="primary"
                    onClick={addNewQuestion}
                    icon={<PlusOutlined />}
                    className="rounded-full bg-white text-[#000]"
                    size="large"
                  >
                    Add Question
                  </Button>
                ) : (
                  <div className="fixed top-[-38px] right-[10px]">
                    <Button
                      type="primary"
                      onClick={addNewQuestion}
                      icon={<PlusOutlined />}
                      className="rounded-full"
                    ></Button>
                  </div>
                )}
              </>
            )}
          </Form.List>
        </Col>
      </Row>
      {/* </Card> */}
    </Spin>
  );
});

export default Assessment;
