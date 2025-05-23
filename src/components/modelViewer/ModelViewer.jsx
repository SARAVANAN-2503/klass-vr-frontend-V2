import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas } from "react-three-fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import { Badge, Button, Card, Col, Image, Row, Statistic, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";
import edit from "../../assets/icons/edit.svg";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/config/redux";
const ModelViewer = ({ modelUrl, scaleFactor = 0.7, _edit, _view, mod_id, content_id, _id, cordinate }) => {
  const controls = useRef();
  const navigate = useNavigate();
  const [polygonCount, setPolygonCount] = useState(0);
  const selectedTheme = useAppSelector((state) => state.theme.theme);
  const calculatePolygonCount = (model) => {
    let count = 0;
    model.traverse((object) => {
      if (object.isMesh) {
        const geometry = object.geometry;
        count += geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3;
      }
    });
    return count;
  };
  const handleDownload = () => {
    const token = localStorage.getItem("accessToken");
    localStorage.setItem("contentId", mod_id);
    localStorage.setItem("model", modelUrl);
    localStorage.setItem("experienceData", JSON.stringify({ mod_id, modelUrl, token }));
      navigate("/unity", {
        state: {
          contentId: content_id,
          model: modelUrl,
          modelId: mod_id,
          token,
          _id,
          modelCoordinates: cordinate || "[]",
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

  const enableScroll = () => {
    document.body.style.overflow = "auto";
  };

  const disableScroll = () => {
    document.body.style.overflow = "hidden";
  };

  useEffect(() => {
    return () => {
      enableScroll();
    };
  }, []);
  const Statistic = ({ title, value, valueStyle }) => {
    return (
      <div>
        <h3 className={`text-lg ${selectedTheme === "dark" ? "text-white" : "text-black"}`}>{title}</h3>
        <p className={valueStyle}>{value}</p>
      </div>
    );
  };
  return (
    <>
      {_edit ? (
        <Row className="w-full gap-5 relative">
          <Col span={12}>
            <Card type="inner" className="glass-effect border-none">
              <Canvas
                shadows
                className="h-[150px]"
                onCreated={({ gl, camera, scene }) => {
                  gl.setClearColor("#f0f0f0");

                  const ambientLight = new THREE.AmbientLight(0xffffff, 2);
                  scene.add(ambientLight);

                  const loader = new GLTFLoader();
                  loader.load(
                    modelUrl,
                    (gltf) => {
                      gltf.scene.scale.set(scaleFactor, scaleFactor, scaleFactor);

                      const boundingBox = new THREE.Box3().setFromObject(gltf.scene);
                      const center = boundingBox.getCenter(new THREE.Vector3());
                      const size = boundingBox.getSize(new THREE.Vector3());

                      const maxDim = Math.max(size.x, size.y, size.z);
                      const fov = camera.fov * (Math.PI / 180);
                      const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

                      camera.position.copy(center);
                      camera.position.z += cameraZ;
                      camera.near = cameraZ / 100;
                      camera.far = cameraZ * 500;
                      camera.updateProjectionMatrix();

                      scene.add(gltf.scene);
                      const count = calculatePolygonCount(gltf.scene);
                      setPolygonCount(count);
                    },
                    undefined,
                    (error) => {
                      console.error(error);
                    },
                  );
                }}
                onMouseEnter={disableScroll}
                onMouseLeave={enableScroll}
              >
                <Suspense fallback={null}>
                  <group />
                </Suspense>

                <OrbitControls ref={controls} />
              </Canvas>
            </Card>
            {_edit && (
              <Button
                className="rounded-full h-11 w-11 flex items-center justify-center absolute top-6 right-8 shadow-none bg-transparent border-2 border-blue-800"
                type="primary"
                onClick={() => handleDownload()}
              >
                <Image src={edit} className="p-0 m-0 w-[14px]" preview={false} />
              </Button>
            )}
          </Col>
          <Col span={11}>
            <Card type="inner" className="w-full h-full flex items-end glass-effect border-none">
              <Statistic
                title="Polygon Count"
                value={polygonCount}
                valueStyle={`text-4xl font-bold ${selectedTheme === "dark" ? "text-white" : "text-black"}`}
              />
            </Card>
          </Col>
        </Row>
      ) : (
        <Row className="w-full gap-5 relative">
          {_view != "repository" && (
            <Col span={24}>
              <Statistic
                className={`${selectedTheme === "dark" ? "text-white" : "text-black"}`}
                title="Polygon Count"
                value={polygonCount}
                valueStyle={`text-4xl font-bold ${selectedTheme === "dark" ? "text-white" : "text-black"}`}
              />
            </Col>
          )}
          <Col span={24}>
            <Card type="inner" className="glass-effect">
              <Canvas
                shadows
                className="h-[210px]"
                onCreated={({ gl, camera, scene }) => {
                  gl.setClearColor("#f0f0f0");

                  const ambientLight = new THREE.AmbientLight(0xffffff, 2);
                  scene.add(ambientLight);

                  const loader = new GLTFLoader();
                  loader.load(
                    modelUrl,
                    (gltf) => {
                      gltf.scene.scale.set(scaleFactor, scaleFactor, scaleFactor);

                      const boundingBox = new THREE.Box3().setFromObject(gltf.scene);
                      const center = boundingBox.getCenter(new THREE.Vector3());
                      const size = boundingBox.getSize(new THREE.Vector3());

                      const maxDim = Math.max(size.x, size.y, size.z);
                      const fov = camera.fov * (Math.PI / 180);
                      const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

                      camera.position.copy(center);
                      camera.position.z += cameraZ;
                      camera.near = cameraZ / 100;
                      camera.far = cameraZ * 500;
                      camera.updateProjectionMatrix();

                      scene.add(gltf.scene);
                      const count = calculatePolygonCount(gltf.scene);
                      setPolygonCount(count);
                    },
                    undefined,
                    (error) => {
                      console.error(error);
                    },
                  );
                }}
                onMouseEnter={disableScroll}
                onMouseLeave={enableScroll}
              >
                <Suspense fallback={null}>
                  <group />
                </Suspense>

                <OrbitControls ref={controls} />
              </Canvas>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
  s;
};

export default ModelViewer;
