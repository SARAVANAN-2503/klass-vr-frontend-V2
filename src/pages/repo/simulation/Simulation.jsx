import React, { useEffect, useState, useCallback } from "react";
import { Card, Col, Row, Typography, Modal, Pagination, Spin, Tooltip, Button, Image } from "antd";
import { DeleteSimulation, GetSimulation } from "../../../services/Index";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Simulation = ({ searchValue }) => {
  const user = useSelector((state) => state.auth.auth);
  const [simulations, setSimulations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const imgStyle = {
    display: "block",
    width: "100%",
    height: 200,
  };

  const style = {
    padding: "8px 0",
  };

  const fetchSimulations = useCallback(async () => {
    setLoading(true);
    try {
      const filteredSearchValue = Object.fromEntries(Object.entries(searchValue).filter(([_, value]) => value !== ""));

      const params =
        Object.keys(filteredSearchValue).length > 0 && searchValue.modelName !== ""
          ? {
              title: searchValue.modelName,
              subject: searchValue.subject,
            }
          : {
              limit: pageSize,
              page: currentPage,
            };

      const response = await GetSimulation(params);
      setSimulations(response.results);
      setTotalResults(response.totalResults);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchValue]);

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

  const handleSimulationClick = useCallback(
    (file) => {
      nav("/simulation-view", { state: { file }, replace: true });
    },
    [nav],
  );

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleSizeChange = useCallback((_, size) => {
    setCurrentPage(1);
    setPageSize(size);
  }, []);

  const renderSimulationCard = useCallback(
    (val, index) => (
      <Col key={index} className="gutter-row" span={8}>
        <div style={style}>
          <Card hoverable className="glass-effect-card">
            <Row>
              <img alt="thumbnail" src={val.thumbnailURL} style={imgStyle} />
            </Row>
            <Row align="flex-end" justify="space-between" style={{ padding: 10 }}>
              <Typography>{val.title}</Typography>
              <Row>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => handleSimulationClick(val)}
                  size="medium"
                />
              </Row>
            </Row>
          </Card>
        </div>
      </Col>
    ),
    [handleSimulationClick],
  );

  return (
    <div className="overflow-x-hidden h-full relative">
      {user.role === "teacher" && (
        <div className="flex items-center justify-between">
          <span className="text-xl m-0">Simulations</span>
        </div>
      )}

      <div className="max-h-[65vh] overflow-y-auto overflow-x-hidden">
        {loading ? (
          <div className="flex justify-center items-center w-full min-h-[80vh]">
            <Spin size="large" />
          </div>
        ) : (
          <Row
            gutter={{
              xs: 8,
              sm: 16,
              md: 24,
              lg: 32,
            }}
          >
            {simulations?.map(renderSimulationCard)}
          </Row>
        )}{" "}
      </div>
      <div className="flex justify-between items-center fixed bottom-[10px] w-[97%]">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalResults}
          onChange={handlePageChange}
          onShowSizeChange={handleSizeChange}
          style={{ marginTop: "20px", textAlign: "center" }}
          showSizeChanger
          showQuickJumper={false}
        />
      </div>
    </div>
  );
};

export default Simulation;
