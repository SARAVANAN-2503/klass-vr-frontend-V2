// ViewExperience.jsx
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Col,
  Row,
  message,
  Spin,
  Image,
  Empty,
  Tag,
  Typography,
} from "antd";
import ReactPlayer from "react-player";
import { useEffect, useState } from "react";
import ModelViewer from "../../../../components/modelViewer/ModelViewer";
import { GetExperienceById } from "../../../../services/Index";
import SimulationIFrame from "../../../../common/SimulationIFrame";
import ContentWrapper from "../../../../components/ContentWrapper";
import { FaChevronLeft } from "react-icons/fa6";

const ViewExperience = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    name: '',
    content: [],
    assessment: [],
    isDeployed: false
  }); // Initialize with empty object containing required fields
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!params.id) {
      message.error('Experience ID is required');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await GetExperienceById(params.id);
        if (!response || !response[0]) {
          throw new Error('No data found');
        }
        setData(response[0]);
        localStorage.setItem("experienceData", JSON.stringify(response[0]));
      } catch (err) {
        message.error(err.message || 'Failed to fetch experience data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleDownload = (
    modelid,
    url,
    contentId,
    sessionId,
    modelCoordinates
  ) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      message.error('Authentication token not found');
      return;
    }

    localStorage.setItem("contentId", modelid);
    localStorage.setItem("model", url);
    localStorage.setItem(
      "experienceData",
      JSON.stringify({ modelid, url, token })
    );
    navigate("/unity", {
      state: {
        contentId,
        model: url,
        modelId: modelid,
        token,
        sessionId,
        modelCoordinates: modelCoordinates || "[]",
        provider: {
          loaderUrl: "../assets/WEBGLbuild/build44.loader.js",
          dataUrl: "../assets/WEBGLbuild/build44.data.unityweb",
          frameworkUrl: "../assets/WEBGLbuild/build44.framework.js.unityweb",
          codeUrl: "../assets/WEBGLbuild/build44.wasm.unityweb",
        },
      },
      replace: true,
    });
  };


  return loading?(
    <div className="flex justify-center items-center w-screen min-h-dvh">
      <Spin tip="Loading Application..." size="large"></Spin>
    </div>
  ) : (
    data && (<ContentWrapper
        // className="glass-effect"
        routeTo="/experience"
        prefix={<FaChevronLeft />}
        header={data.name}
        extra={
          <Tag color={data.isDeployed ? "green" : "blue"}>
            {data.isDeployed ? "Deployed" : "Not Deployed"}
          </Tag>
        }
      >
        <div className="grid gap-5 grid-cols-1">
          {data.content && data.content.length > 0 ? (
            <div key={1} className="grid gap-5 grid-cols-1">
              <Row gutter={16}>
                <Col span={3}>
                  <Typography className="px-3 pt-5 m-0 text-md font-bold">
                    Character:{" "}
                  </Typography>
                </Col>
                <Col span={21}>
                  <Card className="glass-effect border-none">
                    {data.content[0].script}
                  </Card>
                </Col>
              </Row>
              {data.content[0].youTubeUrl && (
                <Row gutter={16}>
                  <Col span={3}>
                    <Typography className="px-3 pt-5 m-0 text-md font-bold">
                      Youtube Video:{" "}
                    </Typography>
                  </Col>
                  <Col span={21}>
                    <Card className="glass-effect border-none">
                      <Row gutter={16}>
                        <Col span={12}>
                          <ReactPlayer
                            url={data.content[0].youTubeUrl}
                            width="100%"
                            height="100%"
                            controls={true}
                            className="react-player"
                          />
                        </Col>
                        <Col span={12}>
                          {data.content[0].youTubeVideoScript}
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              )}
              {data.content[0].videoDetails?.map((vid) => (
                <Row gutter={16} key={vid._id || vid.id}>
                  <Col span={3}>
                    <Typography className="px-3 pt-5 m-0 text-md font-bold">
                      360 Video:
                    </Typography>
                  </Col>
                  <Col span={21}>
                    <Card className="glass-effect border-none">
                      <Row gutter={16}>
                        <Col span={12}>
                          <ReactPlayer
                            url={vid.videoDetail?.videoURL}
                            controls
                            width="100%"
                            height="auto"
                          />
                        </Col>
                        <Col span={12}>{vid.script}</Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              ))}
              {data.content[0].imageDetails?.map((vid) => (
                <Row gutter={16} key={vid._id || vid.id}>
                  <Col span={3}>
                    <Typography className="px-3 pt-5 m-0 text-md font-bold">
                      360 Image:
                    </Typography>
                  </Col>
                  <Col span={21}>
                    <Card className="glass-effect border-none">
                      <Row gutter={16}>
                        <Col span={12}>
                          <Image src={vid.imageDetail?.imageURL} />
                        </Col>
                        <Col span={12}>{vid.script}</Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              ))}
              {data.content[0].simulationDetails?.map((vid) => (
                <Row gutter={16} key={vid._id || vid.id}>
                  <Col span={3}>
                    <Typography className="px-3 pt-5 m-0 text-md font-bold">
                      Simulations:
                    </Typography>
                  </Col>
                  <Col span={21}>
                    <Card className="glass-effect border-none">
                      <Row gutter={16}>
                        <Col span={24}>
                          <SimulationIFrame
                            url={vid.simulationDetail?.simulationURL}
                            title={vid.simulationDetail?.title}
                            
                          />
                        </Col>
                        <Col span={24}>{vid.script}</Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              ))}
              {data.content[0].modelDetails?.length > 0 &&
                data.content[0].modelDetails.map((mod) => (
                  <Row gutter={16} key={mod._id || mod.id}>
                    <Col span={3}>
                      <Typography className="px-3 pt-5 m-0 text-md font-extrabold">
                        3D Model:
                      </Typography>
                    </Col>
                    <Col span={21}>
                      <Card className="glass-effect border-none">
                        <Row gutter={16}>
                          <Col span={16}>
                            <ModelViewer
                              _edit={true}
                              mod_id={mod._id}
                              content_id={data.content[0]._id}
                              _id={data._id}
                              cordinate={mod.modelCoordinates}
                              modelUrl={mod.modelData?.modelUrl}
                              style={{
                                width: "100%",
                                height: "100%",
                              }}
                            />
                          </Col>
                          <Col
                            span={8}
                            className="text-lg h-[150px] overflow-scroll"
                          >
                            {mod.script}
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  </Row>
                ))}
            </div>
          ) : (
            <Empty />
          )}
          {data.assessment?.length > 0 &&
            data.assessment.map((ass, index) => (
              <Row gutter={16} key={ass._id || index}>
                <Col span={3}>
                  <Typography className="px-3 pt-5 m-0 text-md font-bold">
                    Assessment:
                  </Typography>
                </Col>
                <Col span={21}>
                  <Card className="glass-effect border-none">
                    <Typography className="mb-3 text-lg">{`${index + 1}. ${
                      ass.question
                    }`}</Typography>
                    <div className="grid gap-5 grid-cols-2">
                      {ass.options.map((option, ind) => (
                        <Card
                          className={`bg-[#FFFFFF29] ${
                            option.isCorrect
                              ? "border-green-500"
                              : "border-none"
                          }`}
                          key={ind}
                          type="inner"
                          size="small"
                        >
                          <div className="flex justify-between">
                            <p className="m-0">
                              <b className="bg-[#000000] bg-opacity-5 w-[20px] h-[20px] rounded-full mr-4 p-2 pl-3">
                                {String.fromCharCode(65 + ind)}{" "}
                              </b>
                              {option.text}
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>
                </Col>
              </Row>
            ))}
        </div>
      </ContentWrapper>
     )
    );
};

export default ViewExperience;
