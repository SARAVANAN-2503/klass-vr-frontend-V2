import React, { Fragment, useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Unity, useUnityContext } from "react-unity-webgl";
import ContentWrapper from "../../components/ContentWrapper";
import { FaChevronLeft } from "react-icons/fa";

const loaderUrl = new URL(
  "../../../public/assets/WEBGLbuild/Build89.loader.js",
  import.meta.url
).href;
const dataUrl = new URL(
  "../../../public/assets/WEBGLbuild/Build89.data.unityweb",
  import.meta.url
).href;
const frameworkUrl = new URL(
  "../../../public/assets/WEBGLbuild/Build89.framework.js.unityweb",
  import.meta.url
).href;
const codeUrl = new URL(
  "../../../public/assets/WEBGLbuild/Build89.wasm.unityweb",
  import.meta.url
).href;

const ViewFrameModel = () => {
  const Nav = useNavigate();
  const location = useLocation();
  const { _id, contentId, model, token, modelId, sessionId, modelCoordinates } =
    location.state;
  console.log(location.state);
  const { unityProvider, sendMessage, loadingProgression, isLoaded } =
    useUnityContext({
      loaderUrl,
      dataUrl,
      frameworkUrl,
      codeUrl,
    });

  const [intervalExecuted, setIntervalExecuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const syncWithReactApi = useCallback(() => {
    sendMessage(
      "ApiManager",
      "SyncWithReactApi",
      JSON.stringify({ contentId, model, token, modelId, modelCoordinates })
    );
  }, [contentId, model, token, sendMessage]);

  useEffect(() => {
    if (isLoaded) {
      syncWithReactApi();
    }
    syncWithReactApi();
    const intervalId = setInterval(() => {
      if (!intervalExecuted) {
        setLoading(true);
        syncWithReactApi();
        setIntervalExecuted(false);
        clearInterval(intervalId);
      }
    }, 2500); // Set interval to run every 1 second

    return () => {
      clearInterval(intervalId); // Cleanup interval on component unmount
    };
  }, [syncWithReactApi, intervalExecuted]);

  const goBack = () => {
    Nav(`/viewmyexperience/${_id}`);
  };

  return loading ? (
    <ContentWrapper
      // className="glass-effect"
      routeTo={`/viewmyexperience/${_id}`}
      prefix={<FaChevronLeft />}
      header="Add Annotations"
    >
      <div className="add-experience">
        <div className="flex flex-col gap-4">
          <Card>
            <div
              className="canvas-container" // Consider using a more descriptive class name
              style={{ height: "calc(100vh - 53px)" }}
            >
              <Fragment>
                {!isLoaded && (
                  <p>
                    Loading Application...{" "}
                    {Math.round(loadingProgression * 100)}%
                  </p>
                )}
                <Unity
                  unityProvider={unityProvider}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    visibility: isLoaded ? "visible" : "hidden",
                  }}
                />
              </Fragment>
            </div>
          </Card>
        </div>
      </div>
    </ContentWrapper>
  ) : (
    <div className="flex justify-center items-center w-screen min-h-dvh">
      <Spin tip="Loading Application..." size="large"></Spin>
    </div>
  );
};

export default ViewFrameModel;
