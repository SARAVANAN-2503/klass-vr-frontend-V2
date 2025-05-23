import { message } from "antd";
import { useEffect, useState, useCallback } from "react";
import DeviceManagementTable from "./DeviceManagementTable";
import { DeleteDevice, GetDevice } from "../../../../services/Index";
import ContentWrapper from "../../../../components/ContentWrapper";

const DeviceManagement = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefresh(prev => !prev);
  }, []);

  const handleDelete = useCallback(async (id) => {
    try {
      await DeleteDevice(id);
      message.success("Deleted Successfully!");
      handleRefresh();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete device");
    }
  }, [handleRefresh]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await GetDevice();
        setDevices(res.map(item => ({
          ...item,
          key: item.id
        })));
      } catch (err) {
        const errRes = err.response?.data;
        message.error(errRes?.message || "Failed to fetch devices");
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [refresh]);

  return (
    <ContentWrapper header="Device Management">
      <DeviceManagementTable
        data={devices}
        handleRefresh={handleRefresh}
        loading={loading}
        handleDelete={handleDelete}
      />
    </ContentWrapper>
  );
};

export default DeviceManagement;