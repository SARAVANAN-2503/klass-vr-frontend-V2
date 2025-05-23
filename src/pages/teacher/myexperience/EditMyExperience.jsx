import { useEffect, useRef, useState, useCallback } from "react";
import { Button, Collapse, Spin, message } from "antd";
import {
  CreateContent,
  GetExperienceById,
  GetGrades,
  PatchAssessments,
  PatchContent,
  PatchSession,
} from "../../../services/Index";
import { useNavigate, useParams } from "react-router-dom";
import Session from "./Session";
import Character from "./Character";
import Assessment from "./Assessment";
import moment from "moment";
import Video360 from "./Video360";
import Model3D from "./Model3D";
import Image360 from "./Image360";
import Simulation from "./Simulation";
import ContentWrapper from "../../../components/ContentWrapper";
import { FaChevronLeft } from "react-icons/fa6";

const EditMyExperience = () => {
  const nav = useNavigate();
  const { id } = useParams();
  const videoPlayerRef = useRef(null);
  
  const [uniqueGrades, setUniqueGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState("1");
  const [formLoader, setFormLoader] = useState(false);
  const [addLoader, setAddLoader] = useState(false);
  const [disableFields, setDisableFields] = useState(false);
  const [contentRes, setContentRes] = useState([]);
  const [responseValue, setResponseValue] = useState([]);

  const [session, setSession] = useState({
    sessionTimeAndDate: moment().format(),
    sessionStartedTime: moment().startOf("day").toISOString(),
    sessionEndedTime: moment().endOf("day").toISOString(),
    grade: "6",
    name: "",
    sessionStatus: "pending", 
    subject: "Science",
    feedback: "string",
    sessionDuration: 0,
  });

  const [content, setContent] = useState({
    sessionId: "",
    script: "",
    modelDetails: [],
    imageDetails: [],
    simulationDetails: [],
    videoDetails: [],
    classEnvironment: "",
    teacherCharacterGender: "male",
    language: "english",
    isDraft: false,
    youTubeUrl: "",
    youTubeVideoAudio: true,
    youTubeVideoScript: "",
    youTubeStartTimer: "",
    youTubeEndTimer: "",
  });

  const [assessment, setAssessment] = useState([{
    question: "",
    options: Array(4).fill().map((_, i) => ({
      text: "",
      isCorrect: i === 0
    })),
    typeOfGame: "",
    isDraft: true,
  }]);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await GetGrades();
        setUniqueGrades(res);
      } catch (err) {
        console.error("Error fetching grades:", err);
      }
    };
    fetchGrades();
  }, []);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const res = await GetExperienceById(id);
        localStorage.setItem("experienceData", JSON.stringify(res[0]));
        
        const experienceData = res[0];
        setSession({
          name: experienceData.name,
          grade: experienceData.grade,
          subject: experienceData.subject,
          sessionStartedTime: experienceData.sessionStartedTime,
          sessionEndedTime: experienceData.sessionEndedTime,
        });

        const contentData = experienceData.content[0];
        setContent({
          id: contentData._id,
          script: contentData.script,
          youTubeUrl: contentData.youTubeUrl,
          youTubeVideoAudio: contentData.youTubeVideoAudio,
          youTubeVideoScript: contentData.youTubeVideoScript,
          youTubeStartTimer: contentData.youTubeStartTimer,
          youTubeEndTimer: contentData.youTubeEndTimer,
          language: contentData.language,
          teacherCharacterGender: contentData.teacherCharacterGender,
          classEnvironment: contentData.classEnvironment,
          videoDetails: contentData.videoDetails,
          imageDetails: contentData.imageDetails,
          simulationDetails: contentData.simulationDetails,
          modelDetails: contentData.modelDetails || [],
        });

        const decodedAssessments = experienceData.assessment.map(assessment => ({
          assessmentId: assessment._id,
          question: decodeURIComponent(assessment.question),
          options: assessment.options.map(opt => ({
            text: decodeURIComponent(opt.text),
            isCorrect: opt.isCorrect,
          })),
          typeOfGame: decodeURIComponent(assessment.typeOfGame),
          isDraft: true,
        }));
        setAssessment(decodedAssessments);

      } catch (err) {
        message.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, [id]);

  const handleTabChange = useCallback((key) => {
    setActiveKey(key);
  }, []);

  const handleClose = useCallback(() => {
    nav("/myexperience", { replace: true });
  }, [nav]);

  const handleSave = useCallback(async () => {
    setFormLoader(true);
    

    try {
      // Update session if no ID exists
      if (!("id" in session)) {
        setAddLoader(true);
        const sessionRes = await PatchSession(id, session);
        setSession(sessionRes);
        setContent(prev => ({ ...prev, sessionId: sessionRes.id }));
        setAddLoader(false);
      }

      // Pause video if playing
      const player = videoPlayerRef.current?.getInternalPlayer?.();
      if (player) {
        player.pauseVideo?.() || player.pause?.();
      } else {
        videoPlayerRef.current?.pause?.();
      }

      // Prepare content data
      const mapDetails = (details, keys) => 
        Array.isArray(details) 
          ? details.map(item => 
              keys.reduce((acc, key) => ({ ...acc, [key]: item[key] }), {})
            )
          : [];

      const { id: contentId, ...contentData } = content;
      const processedContent = {
        ...contentData,
        modelDetails: mapDetails(content.modelDetails, ["_id", "modelId", "modelCoordinates", "script", "displayTime"]),
        videoDetails: mapDetails(content.videoDetails, ["_id", "script", "VideoId", "videoSound"]),
        imageDetails: mapDetails(content.imageDetails, ["_id", "script", "ImageId", "displayTime"]),
        simulationDetails: mapDetails(content.simulationDetails, ["_id", "script", "simulationId", "displayTime"]),
      };

      // Update or create content
      const contentRes = content.id
        ? await PatchContent(content.id, processedContent)
        : await CreateContent({ ...content, sessionId: session.id });

      const updatedModelDetails = Array.isArray(contentRes.modelDetails)
        ? contentRes.modelDetails.map((item, index) => ({
            contentId: contentRes.id,
            _id: item._id,
            modelUrl: content.modelDetails[index]?.modelUrl,
          }))
        : [];

      setContentRes(updatedModelDetails);
      setResponseValue(prev => [...prev, { ...content, ...contentRes }]);

      // Update assessments
      if (assessment[0]) {
        await PatchAssessments(id, assessment);
      }

      message.success("Data saved successfully");
    } catch (error) {
      console.error("Error saving data:", error);
      message.error("Failed to save data");
    } finally {
      setAddLoader(false);
      setFormLoader(false);
    }
  }, [content, session, assessment, id]);

  const items = [
    {
      key: "1",
      label: "Experience",
      children: (
        <Session
          _edit={true}
          uniqueGrades={uniqueGrades}
          addLoader={addLoader}
          session={session}
          handleBack={handleTabChange}
          handleClose={handleClose}
          handleSave={handleSave}
          setSession={setSession}
        />
      ),
    },
    {
      key: "2", 
      label: "Character",
      children: (
        <Character
          _edit={true}
          addLoader={addLoader}
          content={content}
          setContent={setContent}
          handleBack={handleTabChange}
          handleClose={handleClose}
          handleSave={handleSave}
        />
      ),
    },
    {
      key: "3",
      label: "360 Video",
      children: (
        <Video360
          _edit={true}
          addLoader={addLoader}
          videoPlayerRef={videoPlayerRef}
          content={content}
          setContent={setContent}
          handleBack={handleTabChange}
          handleClose={handleClose}
          handleSave={handleSave}
        />
      ),
    },
    {
      key: "4",
      label: "360 Images",
      children: (
        <Image360
          _edit={true}
          addLoader={addLoader}
          content={content}
          setContent={setContent}
          handleBack={handleTabChange}
          handleClose={handleClose}
          handleSave={handleSave}
        />
      ),
    },
    {
      key: "5",
      label: "3D Model",
      children: (
        <Model3D
          _edit={true}
          addLoader={addLoader}
          disableFields={disableFields}
          content={content}
          setContent={setContent}
          handleBack={handleTabChange}
          handleClose={handleClose}
          handleSave={handleSave}
        />
      ),
    },
    {
      key: "6",
      label: "Simulation",
      children: (
        <Simulation
          _edit={true}
          addLoader={addLoader}
          disableFields={disableFields}
          content={content}
          setContent={setContent}
          setDisableFields={setDisableFields}
          handleBack={handleTabChange}
          handleClose={handleClose}
          handleSave={handleSave}
        />
      ),
    },
    {
      key: "7",
      label: "Assessment",
      children: (
        <Assessment
          _edit={true}
          content={content}
          assessment={assessment}
          setAssessment={setAssessment}
          handleBack={handleTabChange}
          handleClose={handleClose}
          handleSave={handleSave}
          addLoader={addLoader}
          setDisableFields={setDisableFields}
        />
      ),
    },
  ];

  return (
    <ContentWrapper
      // className="glass-effect"
      routeTo="/myexperience"
      prefix={<FaChevronLeft />}
      header={`Edit Experience - ${session.name}`}
    >
      <div className="flex flex-col gap-4 min-h-screen">
        {loading ? (
          <div style={{ textAlign: "center" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Collapse defaultActiveKey={["1"]} items={items} />
        )}
      </div>
      {!loading && (
        <div className="mt-5 flex justify-end">
          <Button type="default" className="mr-5" onClick={handleClose}>
            Close
          </Button>
          <Button
            type="primary"
            className="ml-3"
            loading={addLoader}
            onClick={() => handleSave(false)}
            disabled={disableFields}
          >
            Save & Submit
          </Button>
        </div>
      )}
    </ContentWrapper>
  );
};

export default EditMyExperience;
