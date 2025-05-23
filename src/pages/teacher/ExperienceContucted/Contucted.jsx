import { Pagination } from "antd";
import { useEffect, useState, useCallback } from "react";
import { ExperienceContected } from "../../../services/Index";
import ContuctedTable from "./ContuctedTable";
import ContentWrapper from "../../../components/ContentWrapper";

const Contucted = () => {
  const [experienceData, setExperienceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ExperienceContected({
        limit: pagination.pageSize,
        page: pagination.current,
      });
      
      setExperienceData(res.results.map((item, index) => ({
        ...item,
        key: index
      })));
      setPagination(prev => ({ ...prev, total: res.totalResults }));
    } catch (error) {
      console.error("Failed to fetch experiences:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const handleSizeChange = (_, size) => {
    setPagination(prev => ({
      ...prev,
      current: 1,
      pageSize: size
    }));
  };

  return (
    <ContentWrapper header="Experience Reports">
      <div>
        <ContuctedTable data={experienceData} loading={loading} />
        <Pagination
          {...pagination}
          onChange={handlePageChange}
          onShowSizeChange={handleSizeChange}
          style={{ marginTop: "20px" }}
          showSizeChanger={false}
          showQuickJumper={false}
          align="center"
        />
      </div>
    </ContentWrapper>
  );
};

export default Contucted;
