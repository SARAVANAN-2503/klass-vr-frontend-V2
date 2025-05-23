import {
  Button,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Modal,
  Switch,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import {
  CreateSubscription,
  DeleteSubscriptions,
  GetSubscription,
  PatchSubscription,
} from "../../../services/Index";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import SubscriptionTable from "./SubscriptionTable";
import { PlusOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import moment from "moment";
import { resetApplication } from "../../../redux/features/counter/applicationSlice";
import { resetUserData } from "../../../redux/features/counter/adminSlice";
import ContentWrapper from "../../../components/ContentWrapper";
import ThemeConfig from "../../../utils/ThemeConfig";

const { RangePicker } = DatePicker;

const Subscription = () => {
  const [subscription, setSubscription] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const nav = useNavigate();

  const handleRefresh = () => setRefresh((prev) => !prev);

  const onClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const showModal = () => {
    form.resetFields();
    setSelectedSubscription(null);
    setOpen(true);
  };

  const onFinish = async (values) => {
    const { name, range, isActive, description } = values;
    const requestData = {
      name,
      startDate: range[0],
      endDate: range[1],
      isActive,
      description,
    };

    try {
      if (selectedSubscription) {
        await PatchSubscription(selectedSubscription._id, requestData);
        message.success("Subscription updated successfully!");
      } else {
        await CreateSubscription(requestData);
        message.success("Subscription created successfully!");
      }
      handleRefresh();
      onClose();
    } catch (err) {
      message.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await DeleteSubscriptions(id);
      message.success("Deleted Successfully!");
      handleRefresh();
    } catch (err) {
      message.error("Delete failed");
    }
  };

  const handleView = (subscription) => {
    if (subscription) { 
      form.setFieldsValue({
        name: subscription.name,
        range: [moment(), moment().add(subscription.term, 'days')],
        isActive: subscription.isActive,
        description: subscription.description,
      });
      setSelectedSubscription(subscription);
    }
    setOpen(true);
  };

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await GetSubscription();
        setSubscription(res.map((item) => ({ ...item, key: item.id })));
        setLoading(false);
      } catch (err) {
        const errRes = err.response?.data;
        if (errRes?.code === 401) {
          message.error(errRes.message);
          dispatch(resetApplication());
          dispatch(resetUserData());
          nav("/login", { replace: true });
        } else {
          message.error(errRes?.message || "Failed to fetch subscriptions");
          setLoading(false);
        }
      }
    };

    fetchSubscriptions();
  }, [refresh, dispatch, nav]);

  return (
    <ContentWrapper
      header="Subscription"
      extra={
        <Tooltip placement="top" title="Add Subscription">
          <Button type="primary" onClick={showModal} icon={<PlusOutlined />}>
            Add Subscription
          </Button>
        </Tooltip>
      }
    >
      <ConfigProvider theme={ThemeConfig.light}>
      <Modal width={600} open={open} onCancel={onClose} footer={null}>
        <Typography className="text-xl text-[#2F3597] text-center pt-10">
          {selectedSubscription ? "Edit" : "Create"} Subscription
        </Typography>
        <div className="flex justify-center">
          <Form
            form={form}
            name="subscription_form"
            className="w-[536px]"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
              Name
            </Typography>
            <Form.Item
              name="name"
              rules={[{ required: true, message: "Please input name" }]}
            >
              <Input
                className="bg-white p-3"
                placeholder="Please enter the name"
              />
            </Form.Item>

            <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
              RangePicker
            </Typography>
            <Form.Item
              name="range"
              rules={[
                {
                  required: !selectedSubscription,
                  message: "Please select date range",
                },
              ]}
            >
              <RangePicker className="w-full p-3" />
            </Form.Item>

            {!selectedSubscription && (
              <>
                <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
                  Status
                </Typography>
                <Form.Item name="isActive">
                  <Switch />
                </Form.Item>
              </>
            )}

            <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
              Description
            </Typography>
            <Form.Item
              name="description"
              rules={[{ required: true, message: "Please enter description" }]}
            >
              <TextArea
                className="bg-white resize-none"
                placeholder="Please enter the description"
              />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 10, span: 16 }}>
              <Button type="primary" htmlType="submit" size="large">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
      </ConfigProvider>

      <SubscriptionTable
        data={subscription}
        handleRefresh={handleRefresh}
        loading={loading}
        handleDelete={handleDelete}
        handleView={handleView}
      />
    </ContentWrapper>
  );
};

export default Subscription;
