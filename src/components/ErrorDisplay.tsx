import {
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, Card, Space, Typography } from "antd";

const { Text } = Typography;

interface ErrorDisplayProps {
  context?: string;
  showGlobal?: boolean;
  showAll?: boolean;
  onRetry?: () => void;
  className?: string;
  errors?: Array<{
    key: string;
    message: string;
    severity?: string;
    isDismissed?: boolean;
  }>;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  context,
  showGlobal = true,
  showAll = false,
  onRetry,
  className,
  errors = [],
}) => {
  const getErrorIcon = (severity?: string) => {
    switch (severity) {
      case "critical":
        return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
      case "high":
        return <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />;
      case "medium":
        return <ExclamationCircleOutlined style={{ color: "#faad14" }} />;
      case "low":
        return <InfoCircleOutlined style={{ color: "#1890ff" }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: "#faad14" }} />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "critical":
        return "#ff4d4f";
      case "high":
        return "#fa8c16";
      case "medium":
        return "#faad14";
      case "low":
        return "#1890ff";
      default:
        return "#faad14";
    }
  };

  // Filter errors based on props
  const filteredErrors = errors.filter((error) => {
    if (showAll) return true;
    if (context && error.key.includes(context)) return true;
    if (showGlobal && error.key.includes("global")) return true;
    return false;
  });

  if (filteredErrors.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {filteredErrors.map((error) => (
        <Card
          key={error.key}
          size="small"
          style={{
            marginBottom: "8px",
            borderLeft: `4px solid ${getSeverityColor(error.severity)}`,
          }}
        >
          <Space>
            {getErrorIcon(error.severity)}
            <div style={{ flex: 1 }}>
              <Text strong style={{ color: getSeverityColor(error.severity) }}>
                {error.key}
              </Text>
              <br />
              <Text>{error.message}</Text>
            </div>
            {onRetry && (
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={onRetry}
                size="small"
              >
                Retry
              </Button>
            )}
          </Space>
        </Card>
      ))}
    </div>
  );
};

export default ErrorDisplay;
