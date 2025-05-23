// ViewMyExperience.jsx
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Col, Divider, Row, message, Spin, Image, Empty, Tag, Typography } from "antd";
import { CheckOutlined, EditOutlined } from "@ant-design/icons";
import ReactPlayer from "react-player";
import { useEffect, useState } from "react";
import ModelViewer from "../../../components/modelViewer/ModelViewer";
import { GetExperienceById } from "../../../services/Index";
import SimulationIFrame from "../../../common/SimulationIFrame";
import ContentWrapper from "../../../components/ContentWrapper";
import { FaChevronLeft } from "react-icons/fa6";
import { useAppSelector } from "../../../store/config/redux";

const ViewMyExperience = () => {
  const selectedTheme = useAppSelector((state) => state.theme.theme);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const params = useParams();

  useEffect(() => {
    GetExperienceById(params.id)
      .then((res) => {
        setData(res[0]);
        localStorage.setItem("experienceData", JSON.stringify(res[0]));
        setLoading(false);
      })
      .catch((err) => {
        message.error(err);
        setLoading(false);
      });
  }, [params.id]);

  return loading ? (
    <div className="flex justify-center items-center w-screen min-h-dvh">
      <Spin tip="Loading Application..." size="large"></Spin>
    </div>
  ) : (
    data && (
      <ContentWrapper
        // className="glass-effect"
        routeTo="/myexperience"
        prefix={<FaChevronLeft />}
        header={data.name}
        extra={<Tag color={data.isDeployed ? "green" : "blue"}>{data.isDeployed ? "Deployed" : "Not Deployed"}</Tag>}
      >
        {/* <Badge.Ribbon color={data.isDeployed ? "green" : "blue"} text={data.isDeployed ? "Deployed" : "Not Deployed"}>
          <div className="text-start">
            <Card
              title={
                <div className="flex gap-3 items-center">
                  <Button icon={<ArrowLeftOutlined />} size="default" type="primary" onClick={goBack}>
                    Back
                  </Button>
                  {data.name}
                </div>
              }
            > */}
        <div className="grid gap-5 grid-cols-1">
          {data.content.length > 0 ? (
            // data.content[0].map((cont, item) => (
            <div key={1} className="grid gap-5 grid-cols-1">
              {/* <Card className="glass-effect" type="inner" title="Character">
                <Card className="glass-effect">{data.content[0].script}</Card>
              </Card> */}
              <Row gutter={16}>
                <Col span={3}>
                  <Typography className="px-3 pt-5 m-0 text-md font-extrabold">Character:</Typography>
                </Col>
                <Col span={21}>
                  <Card className="glass-effect border-none">{data.content[0].script}</Card>
                </Col>
              </Row>
              {data.content[0].youTubeUrl != "" ? (
                <Row gutter={16}>
                  <Col span={3}>
                    <Typography className="px-3 pt-5 m-0 text-md font-extrabold">Youtube Video:</Typography>
                  </Col>
                  <Col span={21}>
                    <Card className="glass-effect border-none">
                      <Row gutter={16}>
                        <Col span={12}>
                          <div className="video-player-container">
                            <ReactPlayer
                              url={data.content[0].youTubeUrl}
                              width="100%"
                              height="100%"
                              controls={true}
                              className="react-player"
                            />
                          </div>
                        </Col>
                        <Col span={12}>{data.content[0].youTubeVideoScript}</Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              ) : (
                ""
              )}
              {data.content[0].videoDetails?.map((vid) => (
                <Row gutter={16} key={vid.id}>
                  <Col span={3}>
                    <Typography className="px-3 pt-5 m-0 text-md font-extrabold">360 Video:</Typography>
                  </Col>
                  <Col span={21}>
                    <Card className="glass-effect border-none">
                      <Row gutter={16}>
                        <Col span={12}>
                          <ReactPlayer url={vid.videoDetail?.videoURL} controls width="100%" height="auto" />
                        </Col>
                        <Col span={12}>{vid.script}</Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              ))}
              {data.content[0].imageDetails?.map((vid) => (
                <Row gutter={16} key={vid.id}>
                  <Col span={3}>
                    <Typography className="px-3 pt-5 m-0 text-md font-extrabold">360 Image:</Typography>
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
                <Row gutter={16} key={vid.id}>
                  <Col span={3}>
                    <Typography className="px-3 pt-5 m-0 text-md font-extrabold">Simulations:</Typography>
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
              {data.content[0].modelDetails.length > 0 &&
                data.content[0].modelDetails.map((mod) => (
                  <Row gutter={16} key={mod.id}>
                    <Col span={3}>
                      <Typography className="px-3 pt-5 m-0 text-md font-extrabold">3D Model:</Typography>
                    </Col>
                    <Col span={21}>
                      <Card className="glass-effect border-none">
                        <Row gutter={16}>
                          <Col span={16}>
                            <ModelViewer
                              className="glass-effect border-none"
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
                            {/* <Button
                              className="rounded-full h-[40px]"
                              type="primary"
                              onClick={() =>
                                handleDownload(
                                  mod._id,
                                  mod.modelData.modelUrl,
                                  data.content[0]._id,
                                  data._id,
                                  mod.modelCoordinates
                                )
                              }
                            >
                              <EditOutlined />
                            </Button> */}
                          </Col>
                          <Col span={8} className="text-lg h-[150px] overflow-scroll">
                            {mod.script}
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  </Row>
                ))}
            </div>
          ) : (
            //  ))
            <Empty />
          )}
          {data.assessment.length > 0 &&
            data.assessment.map((ass, index) => (
              <Row gutter={16} key={index}>
                <Col span={3}>
                  <Typography className="px-3 pt-5 m-0 text-md font-extrabold">Assessment:</Typography>
                </Col>
                <Col span={21}>
                  <Card className="glass-effect border-none">
                    <Typography className="mb-3 text-lg">{`${index + 1}. ${ass.question}`}</Typography>
                    <div className="grid gap-5 grid-cols-2">
                      {ass.options.map((option, ind) => (
                        <Card
                          className={`bg-[#FFFFFF29] ${option.isCorrect ? "border-green-500" : "border-none"}`}
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

export default ViewMyExperience;
