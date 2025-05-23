import { Button, Card, Col, Divider, Row } from "antd";
import ModelViewer from "../../../components/modelViewer/ModelViewer";
import React, { useCallback } from "react";
import { EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const Anotation = ({ contentRes = [], sessionId }) => {
  const navigate = useNavigate();

  const handleDownload = useCallback(
    (modelid, url, contentId) => {
      const token = localStorage.getItem("accessToken");
      localStorage.setItem("contentId", modelid);
      localStorage.setItem("model", url);
      localStorage.setItem("experienceData", JSON.stringify({ modelid, url, token }));

      navigate("/unity", {
        state: {
          contentId,
          model: url,
          modelId: modelid,
          token,
          _id: sessionId,
          sessionId,
          modelCoordinates: "",
          provider: {
            loaderUrl: "../../../assets/WEBGLbuild/build84.loader.js",
            dataUrl: "../../../assets/WEBGLbuild/build84.data.unityweb",
            frameworkUrl: "../../../assets/WEBGLbuild/build84.framework.js.unityweb",
            codeUrl: "../../../assets/WEBGLbuild/build84.wasm.unityweb",
          },
        },
        replace: true,
      });
    },
    [navigate, sessionId],
  );

  const handleClose = useCallback(() => {
    navigate("/myexperience", { replace: true });
  }, [navigate]);

  return (
    <>
      <div className="inner-glass-card">
        <p className="header-text font-[700] text-[24px]">3D Model Editor</p>
        {contentRes.length === 0 ? (
          <div className="dashed-button">No 3d model for now</div>
        ) : (
          contentRes.map((mod) => (
            <React.Fragment key={mod._id}>
              <Row gutter={16}>
                <Col span={24}>
                  <Card>
                    <div className="flex flex-col gap-0 items-center h-96">
                      {mod.modelUrl ? (
                        <ModelViewer
                          modelUrl={mod.modelUrl}
                          style={{
                            width: "100%",
                            height: "100%",
                            focus: true,
                          }}
                        />
                      ) : (
                        "No 3d model for now"
                      )}
                      <Button
                        className="mt-5"
                        type="primary"
                        onClick={() => handleDownload(mod._id, mod.modelUrl, mod.contentId)}
                      >
                        <EditOutlined /> Edit
                      </Button>
                    </div>
                  </Card>
                </Col>
              </Row>
              <Divider />
            </React.Fragment>
          ))
        )}
      </div>
      <div className="flex justify-start gap-4 mt-5 pl-4">
        <Button type="primary" className="form-button" size="large" onClick={handleClose}>
          Finish
        </Button>
      </div>
    </>
  );
};

export default Anotation;
