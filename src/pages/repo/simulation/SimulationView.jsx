import {
  Button,
  Card,
  Col,
  Descriptions,
  Row,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import SimulationIFrame from "../../../common/SimulationIFrame";
import ContentWrapper from "../../../components/ContentWrapper";

const SimulationView = () => {
  const { state: { file } } = useLocation();
  const navigate = useNavigate();

  const goBack = () => {
    navigate("/content_repo", { replace: true });
  };

  return (
    <ContentWrapper
      header={file.title + " Simulation"}
      extra={
        <div className="flex gap-3 items-center">
          <Button
            icon={<ArrowLeftOutlined />}
            type="primary"
            onClick={goBack}
          >
            Back
          </Button>
          
        </div>
      }
    >
       
          <Row gutter={16}>
            <Col span={24}>
              <Card>
                <Descriptions>
                  <Descriptions.Item label="Title">
                    {file.title}
                  </Descriptions.Item>
                </Descriptions>
                <Descriptions>
                  <Descriptions.Item label="Display Time">
                    {file.displayTime}
                  </Descriptions.Item>
                </Descriptions>
                <Descriptions>
                  <Descriptions.Item label="subject">
                    {file.subject}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            <Col span={24}>
              <Card>
                <div style={{ height: "100%" }}>
                  <SimulationIFrame
                    url={file.simulationURL}
                    controls
                    width="100%"
                    height="100%"
                  />
                </div>
              </Card>
            </Col>
          </Row>
    </ContentWrapper>
  );
};

export default SimulationView;
