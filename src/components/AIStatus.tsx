import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Card, Space, Typography } from "antd";
import { gemini } from "../config/envConfig";
import { useGeminiApi } from "../hooks/useGeminiApi";
import { resumeParser } from "../utils/resumeParser";
import ErrorDisplay from "./ErrorDisplay";

const { Text } = Typography;

const AIStatus: React.FC = () => {
  const {
    isLoadingQuestions: isGeneratingQuestions,
    isEvaluating,
    isGeneratingSummary,
    questionsError,
    evaluationError,
    summaryError,
  } = useGeminiApi();

  const hasApiKey = !!(
    gemini.GEMINI_API_KEY ||
    localStorage.getItem("gemini_api_key") ||
    (typeof window !== "undefined" &&
      (window as { env?: { VITE_GEMINI_API_KEY?: string } }).env
        ?.VITE_GEMINI_API_KEY)
  );

  // Check if resumeParser is also initialized
  const isResumeParserReady =
    resumeParser && typeof resumeParser.parseResume === "function";

  if (!hasApiKey) {
    return (
      <Card size="small" style={{ marginBottom: "16px" }}>
        <Space>
          <ExclamationCircleOutlined style={{ color: "#faad14" }} />
          <div>
            <Text>AI features disabled - Configure API key to enable</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Set VITE_GEMINI_API_KEY in your environment or use the API Config
              tab
            </Text>
          </div>
        </Space>
      </Card>
    );
  }

  const isLoading =
    isGeneratingQuestions || isEvaluating || isGeneratingSummary;

  const hasError = !!(questionsError || evaluationError || summaryError);

  // Show centralized error display
  if (hasError) {
    return (
      <div style={{ marginBottom: "16px" }}>
        <ErrorDisplay showAll={true} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <Card size="small" style={{ marginBottom: "16px" }}>
        <Space>
          <LoadingOutlined />
          <Text>AI is processing...</Text>
        </Space>
      </Card>
    );
  }

  return (
    <Card size="small" style={{ marginBottom: "16px" }}>
      <Space>
        <CheckCircleOutlined style={{ color: "#52c41a" }} />
        <div>
          <Text>AI service ready</Text>
          {isResumeParserReady && (
            <div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Resume parsing enabled
              </Text>
            </div>
          )}
        </div>
      </Space>
    </Card>
  );
};

export default AIStatus;
