import { CheckCircleOutlined, KeyOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Divider,
  Form,
  Input,
  Space,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { resumeParser } from "../utils/resumeParser";

const { Title, Text, Paragraph } = Typography;

interface APIConfigProps {
  onConfigComplete: () => void;
}

const APIConfig: React.FC<APIConfigProps> = ({ onConfigComplete }) => {
  const [form] = Form.useForm();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Check if API key is already configured
    const existingKey = localStorage.getItem("gemini_api_key");
    if (existingKey) {
      setHasApiKey(true);
    }
  }, []);

  const handleSubmit = async (values: { apiKey: string }) => {
    setIsConfiguring(true);
    try {
      // Store API key in localStorage
      localStorage.setItem("gemini_api_key", values.apiKey);

      // Update environment variable for current session
      if (typeof window !== "undefined") {
        const windowWithEnv = window as {
          env?: { VITE_GEMINI_API_KEY?: string };
        };
        windowWithEnv.env = {
          ...windowWithEnv.env,
          VITE_GEMINI_API_KEY: values.apiKey,
        };
      }

      // Update the resumeParser with the new API key
      resumeParser.updateApiKey(values.apiKey);

      setHasApiKey(true);
      onConfigComplete();
    } catch (error) {
      console.error("Error configuring API key:", error);
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleSkip = () => {
    onConfigComplete();
  };

  if (hasApiKey) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "20px" }}>
          <CheckCircleOutlined
            style={{ fontSize: "48px", color: "#52c41a", marginBottom: "16px" }}
          />
          <Title level={3}>API Configured</Title>
          <Text>Google Gemini API is ready to use!</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card className="api-config-card">
      <div style={{ textAlign: "center", padding: "20px" }}>
        <KeyOutlined
          style={{ fontSize: "48px", color: "#1890ff", marginBottom: "16px" }}
        />
        <Title level={3}>Configure Google Gemini AI</Title>
        <Text type="secondary">
          To enable AI-powered question generation and evaluation, please
          provide your Google Gemini API key.
        </Text>

        <Alert
          message="Get Your API Key"
          description={
            <div>
              <Paragraph>
                1. Visit{" "}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google AI Studio
                </a>
              </Paragraph>
              <Paragraph>2. Create a new API key</Paragraph>
              <Paragraph>3. Copy and paste it below</Paragraph>
            </div>
          }
          type="info"
          showIcon
          style={{ margin: "16px 0", textAlign: "left" }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: "500px", margin: "0 auto" }}
        >
          <Form.Item
            name="apiKey"
            label="Google Gemini API Key"
            rules={[
              { required: true, message: "Please enter your API key" },
              { min: 20, message: "API key seems too short" },
            ]}
          >
            <Input.Password
              placeholder="Enter your Google Gemini API key"
              size="large"
            />
          </Form.Item>

          <Space direction="vertical" style={{ width: "100%" }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isConfiguring}
              block
            >
              Configure AI Service
            </Button>

            <Divider>OR</Divider>

            <Button size="large" onClick={handleSkip} block>
              Continue with Mock AI (Limited Features)
            </Button>
          </Space>
        </Form>

        <Alert
          message="Privacy Notice"
          description="Your API key is stored locally in your browser and is only used to communicate with Google's Gemini API. It is not sent to any other servers."
          type="warning"
          showIcon
          style={{ marginTop: "16px" }}
        />
      </div>
    </Card>
  );
};

export default APIConfig;
