import { Button, Tabs, message } from "antd";
import { useRef, useState, useEffect, useCallback } from "react";
import Session from "./Session";
import Character from "./Character";
import Model3D from "./Model3D";
import Video360 from "./Video360";
import Assessment from "./Assessment";
import moment from "moment";
import TabPane from "antd/es/tabs/TabPane";
import {
  CreateContent,
  CreateSession,
  GetGrades,
  PatchAssessments,
  PatchContent,
  PatchSession,
} from "../../../services/Index";
import Anotation from "./Anotation";
import { useNavigate } from "react-router-dom";
import Image360 from "./Image360";
import Simulation from "./Simulation";
import ContentWrapper from "../../../components/ContentWrapper";
import { FaChevronLeft } from "react-icons/fa";

const AddMyExperience = () => {
  const nav = useNavigate();
  const videoPlayerRef = useRef(null);

  const [uniqueGrades, setUniqueGrades] = useState([]);
  const [activeKey, setActiveKey] = useState("1");
  const [formLoader, setFormLoader] = useState(false);
  const [addLoader, setAddLoader] = useState(false);
  const [contentId, setContentId] = useState();
  const [contentRes, setContentRes] = useState([]);
  const [responseValue, setResponseValue] = useState([]);
  const [disableFields, setDisableFields] = useState(true);

  const [session, setSession] = useState({
    sessionTimeAndDate: moment().format(),
    sessionStartedTime: moment().startOf("day").toISOString(),
    sessionEndedTime: moment().endOf("day").toISOString(),
    grade: "",
    name: "",
    sessionStatus: "pending",
    subject: "Science",
    feedback: "string",
    sessionDuration: 0,
  });
  useEffect(() => {
    const hasVisited = sessionStorage.getItem("hasVisited");

    if (!hasVisited) {
      sessionStorage.setItem("hasVisited", "true");
      // window.location.reload();
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("hasVisited");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const [content, setContent] = useState({
    sessionId: "",
    script: "",
    modelDetails: [],
    videoDetails: [],
    imageDetails: [],
    teacherCharacterGender: "male",
    classEnvironment: "",
    language: "english",
    isDraft: false,
    youTubeUrl: "",
    youTubeVideoAudio: true,
    youTubeVideoScript: "",
    youTubeStartTimer: "00:00",
    youTubeEndTimer: "00:00",
  });

  const [assessment, setAssessment] = useState([
    {
      question: "",
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      isDraft: true,
      typeOfGame: "",
    },
  ]);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await GetGrades();
        setUniqueGrades(res);
      } catch (error) {
        console.error("Error fetching grades:", error);
      }
    };
    fetchGrades();
  }, []);

  const handleTabChange = useCallback((key) => {
    setActiveKey(key);
  }, []);

  const handleClose = useCallback(() => {
    nav("/myexperience", { replace: true });
  }, [nav]);

  const handlePatchContentUpdate = useCallback(
    async (contentId, contentDetails, keys, contentKey) => {
      const mappedDetails = Array.isArray(contentDetails)
        ? contentDetails.map((item) =>
            keys.reduce((acc, key) => ({ ...acc, [key]: item[key] }), {})
          )
        : [];

      const updatedContent = { ...content, [contentKey]: mappedDetails };
      const res = await PatchContent(contentId, updatedContent);

      const updatedValue = Array.isArray(res[contentKey])
        ? res[contentKey].map((item, index) => ({
            contentId: res.id,
            _id: item._id,
            modelUrl: content[contentKey][index]?.modelUrl,
          }))
        : [];

      setContentRes(updatedValue);
      setResponseValue((prev) => [...prev, { ...content, ...res }]);
    },
    [content]
  );

  const handleContentSave = useCallback(async () => {
    setFormLoader(true);
    try {
      const res = await CreateContent({
        ...content,
        sessionId: session.id,
      });

      const updatedValue = res.modelDetails.map((item, index) => ({
        contentId: res.id,
        _id: item._id,
        modelUrl: content.modelDetails[index]?.modelUrl,
      }));

      setContentRes(updatedValue);
      setResponseValue((prev) => [...prev, { ...content, ...res }]);
      handleTabChange("7");
    } catch (error) {
      message.error("Failed to save content");
    } finally {
      setFormLoader(false);
    }
  }, [content, session.id, handleTabChange]);

  const handleSave = useCallback(async () => {
    setFormLoader(true);
    try {
      let nextTabKey = activeKey;

      const actions = {
        1: async () => {
          setAddLoader(true);
          const sessionData = session.id
            ? {
                name: session.name,
                grade: session.grade,
                subject: session.subject,
              }
            : { ...session, isDraft: false };

          const sessionRes = session.id
            ? await PatchSession(content.sessionId, sessionData)
            : await CreateSession(sessionData);

          setSession(sessionRes);
          setContent((prev) => ({ ...prev, sessionId: sessionRes.id }));
          setAddLoader(false);
          return "2";
        },

        2: async () => {
          setAddLoader(true);
          if (contentId) {
            await PatchContent(contentId, {
              ...content,
              sessionId: session.id,
              isDraft: false,
            });
            setAddLoader(false);
          } else {
            const contentIds = await CreateContent({
              ...content,
              sessionId: session.id,
              isDraft: false,
            });
            setContentId(contentIds.id);
            setAddLoader(false);
          }
          return "3";
        },

        7: async () => {
          setAddLoader(true);
          if (assessment.length) {
            await PatchAssessments(session.id, assessment);
          }
          setAddLoader(false);
          message.success("Data saved successfully");
          return "8";
        },
      };

      if (["3", "4", "5", "6"].includes(activeKey)) {
        setAddLoader(true);
        const contentDetailsMap = {
          3: {
            key: "videoDetails",
            keys: ["_id", "script", "VideoId", "videoSound"],
          },
          4: {
            key: "imageDetails",
            keys: ["_id", "script", "ImageId", "displayTime"],
          },
          5: {
            key: "modelDetails",
            keys: [
              "_id",
              "modelId",
              "modelCoordinates",
              "script",
              "displayTime",
            ],
          },
          6: {
            key: "simulationDetails",
            keys: ["_id", "script", "simulationId", "displayTime"],
          },
        };

        const { key, keys } = contentDetailsMap[activeKey];
        await handlePatchContentUpdate(contentId, content[key], keys, key);
        setAddLoader(false);
        nextTabKey = String(Number(activeKey) + 1);
      } else {
        setAddLoader(true);
        nextTabKey = await (
          actions[activeKey] || (() => String(Number(activeKey) + 1))
        )();
      }

      handleTabChange(nextTabKey);
    } catch (error) {
      console.error(error);
      message.error("Failed to save");
    } finally {
      setFormLoader(false);
    }
  }, [
    activeKey,
    assessment,
    content,
    contentId,
    handlePatchContentUpdate,
    handleTabChange,
    session,
  ]);

  const handleSkip = useCallback(async () => {
    setAddLoader(true);
    setFormLoader(true);
    try {
      const res = await CreateContent({
        ...content,
        sessionId: session.id,
        isDraft: false,
      });

      const updatedValue = res.modelDetails.map((item, index) => ({
        contentId: res.id,
        _id: item._id,
        modelUrl: content.modelDetails[index]?.modelUrl,
      }));

      setContentRes(updatedValue);
      setResponseValue((prev) => [...prev, { ...content, ...res }]);
      message.success("Data saved successfully");
      handleTabChange("8");
    } catch (error) {
      message.error("Failed to skip");
    } finally {
      setFormLoader(false);
      setAddLoader(false);
    }
  }, [content, session.id, handleTabChange]);

  return (
    <ContentWrapper
      // className="glass-effect"
      routeTo="/myexperience"
      prefix={<FaChevronLeft />}
      header="Add Experience"
    >
      <div className="add-experience">
        <div className="flex flex-col gap-4">
          <Tabs activeKey={activeKey} onChange={handleTabChange} centered>
            <TabPane tab="Experience" key="1">
              <Session
                addLoader={addLoader}
                uniqueGrades={uniqueGrades}
                handleClose={handleClose}
                session={session}
                setSession={setSession}
                setDisableFields={setDisableFields}
                handleSave={handleSave}
              />
            </TabPane>
            <TabPane tab="Character" key="2" disabled>
              <Character
                addLoader={addLoader}
                content={content}
                setContent={setContent}
                setDisableFields={setDisableFields}
                handleBack={handleTabChange}
                handleClose={handleClose}
                handleSave={handleSave}
              />
            </TabPane>
            <TabPane tab="360 Video" key="3" disabled>
              <Video360
                addLoader={addLoader}
                setActiveKey={setActiveKey}
                videoPlayerRef={videoPlayerRef}
                handleBack={handleTabChange}
                handleClose={handleClose}
                handleSave={handleSave}
                content={content}
                setContent={setContent}
                setDisableFields={setDisableFields}
              />
            </TabPane>
            <TabPane tab="360 Image" key="4" disabled>
              <Image360
                addLoader={addLoader}
                setActiveKey={setActiveKey}
                handleBack={handleTabChange}
                handleClose={handleClose}
                handleSave={handleSave}
                content={content}
                setContent={setContent}
                setDisableFields={setDisableFields}
              />
            </TabPane>
            <TabPane tab="3D Model" key="5" disabled>
              <Model3D
                addLoader={addLoader}
                disableFields={disableFields}
                content={content}
                setContent={setContent}
                setActiveKey={setActiveKey}
                setDisableFields={setDisableFields}
                handleBack={handleTabChange}
                handleClose={handleClose}
                handleSave={handleSave}
              />
            </TabPane>
            <TabPane tab="Simulation" key="6" disabled>
              <Simulation
                addLoader={addLoader}
                setActiveKey={setActiveKey}
                disableFields={disableFields}
                content={content}
                setContent={setContent}
                setDisableFields={setDisableFields}
                handleBack={handleTabChange}
                handleClose={handleClose}
                handleSave={handleSave}
              />
            </TabPane>
            <TabPane tab="Assessment" key="7" disabled>
              <Assessment
                _edit={false}
                addLoader={addLoader}
                content={content}
                assessment={assessment}
                setAssessment={setAssessment}
                handleContentSave={handleContentSave}
                handleBack={handleTabChange}
                handleClose={handleClose}
                handleSave={handleSave}
                setDisableFields={setDisableFields}
              />
            </TabPane>
            <TabPane tab="3D Model Editor" key="8" disabled>
              <Anotation
                responseValue={responseValue}
                contentRes={contentRes}
                sessionId={content.sessionId}
              />
            </TabPane>
          </Tabs>
        </div>
        <div className="flex justify-start gap-4 ml-4 pl-4 my-8">
          {activeKey === "7" && (
            <>
              <Button
                type="primary"
                onClick={() => handleTabChange("6")}
                size="large"
                className="rounded-full bg-[#000]"
              >
                Previous
              </Button>
              <Button
                type="primary"
                className="form-button"
                size="large"
                loading={addLoader}
                onClick={() => handleSave(false)}
                disabled={disableFields}
              >
                Continue
              </Button>
              <Button
                type="primary"
                className="form-button skip-button"
                size="large"
                onClick={() => setActiveKey("8")}
                disabled={!disableFields || addLoader}
              >
                Skip
              </Button>
            </>
          )}
        </div>
      </div>
    </ContentWrapper>
  );
};

export default AddMyExperience;
