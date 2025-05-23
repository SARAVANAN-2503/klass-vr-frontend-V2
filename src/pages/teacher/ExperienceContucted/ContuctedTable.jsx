import React, { useState, useMemo } from "react";
import { Button, Flex, message, Table, Tooltip } from "antd";
import moment from "moment";
import PropTypes from "prop-types";
import { FileExcelFilled, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { PerformanceReport } from "../../../services/Index";
import FileSaver from "file-saver";

const ConductedTable = ({ data, loading }) => {
  const [loadingButtons, setLoadingButtons] = useState({});

  const handleReportDownload = async (id) => {
    setLoadingButtons((prev) => ({ ...prev, [id]: true }));
    try {
      const base64Response = await PerformanceReport(id);

      if (!base64Response) {
        throw new Error("No base64 string received from the server.");
      }

      const blob = base64ToBlob(
        base64Response,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      FileSaver.saveAs(blob, "students.xlsx");
      message.success("Exported successfully!");
    } catch (error) {
      message.error(`Failed to export students. ${error.message || ""}`);
    } finally {
      setLoadingButtons((prev) => ({ ...prev, [id]: false }));
    }
  };

  const base64ToBlob = (base64, contentType = "", sliceSize = 512) => {
    const base64Data = base64.includes("base64,")
      ? base64.split("base64,")[1]
      : base64;

    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: contentType });
  };

  const columns = useMemo(
    () => [
      {
        title: "Experience Name",
        dataIndex: ["sessionID", "name"],
        align: "left",
        key: "experienceName",
        render: (text) => text || "N/A",
      },
      {
        title: "Active device count",
        align: "left",
        dataIndex: "totalDevicesActive",
        key: "totalDevicesActive",
      },
      {
        title: "Total attendance",
        align: "left",
        dataIndex: "totalStudentsAttended",
        key: "totalStudentsAttended",
      },
      {
        title: "Class hours conducted",
        align: "left",
        dataIndex: "classConductedHours",
        key: "classConductedHours",
      },
      {
        title: "Status",
        align: "center",
        dataIndex: "feedback",
        key: "feedback",
        render: (text) => (
          <div className="w-auto flex justify-center">
            <p
              className={`px-5 py-1 capitalize text-white w-[140px] rounded-[40px] m-0 ${
                text ? "bg-violet-500" : "bg-pink-500"
              }`}
            >
              {text ? "Completed" : "Not Completed"}
            </p>
          </div>
        ),
      },
      {
        title: "Conducted Date",
        align: "left",
        dataIndex: "conductedDate",
        key: "conductedDate",
        render: (text) => moment(text).format("D-MMM-YYYY"),
      },
    ],
    []
  );

  const expandedColumns = useMemo(
    () => [
      {
        title: "Teacher Name",
        dataIndex: ["teacherID", "name"],
        key: "teacherID",
        render: (text) => text || "N/A",
      },
      {
        title: "School Name",
        dataIndex: ["schoolID", "schoolName"],
        key: "schoolName",
        render: (text) => text || "N/A",
      },
      {
        title: "Section Name",
        dataIndex: ["sectionID", "name"],
        key: "sectionname",
        render: (text) => text || "N/A",
      },
      {
        title: "Grade Name",
        dataIndex: ["gradeID", "name"],
        key: "gradeID",
        render: (text) => text || "N/A",
      },
    ],
    []
  );

  const expandedRowRender = (record) => {
    const childRecord = data.find((item) => item.parentID === record.parentID);
    if (!childRecord) return null;

    return (
      <Table
        rowClassName={() => "rowClassName1"}
        columns={expandedColumns}
        dataSource={[childRecord]}
        pagination={false}
      />
    );
  };

  return (
    <Table
      rowClassName={() => "rowClassName1"}
      columns={columns}
      expandable={{
        expandedRowRender,
        defaultExpandedRowKeys: ["0"],
        expandIcon: ({ expanded, onExpand, record }) =>
          expanded ? (
            <MinusOutlined
              onClick={(e) => onExpand(record, e)}
              className="text-black"
            />
          ) : (
            <PlusOutlined
              onClick={(e) => onExpand(record, e)}
              className="text-black"
            />
          ),
      }}
      loading={loading}
      pagination={false}
      dataSource={data}
      size="middle"
    />
  );
};

ConductedTable.propTypes = {
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
};

export default ConductedTable;
