import { ClockCircleOutlined, SendOutlined } from "@ant-design/icons";
import { Button, Card, Input, Progress, Spin, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import type { ChatMessage, Question } from "../types";

const { TextArea } = Input;
const { Text } = Typography;

interface ChatInterfaceProps {
  currentQuestion?: Question;
  timeRemaining: number;
  onAnswerSubmit: (answer: string) => void;
  messages: ChatMessage[];
  isEvaluating: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  currentQuestion,
  timeRemaining,
  onAnswerSubmit,
  messages,
  isEvaluating,
}) => {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Remove auto-submit from ChatInterface - handled by parent component
  // useEffect(() => {
  //   if (timeRemaining <= 0 && currentQuestion && answer.trim()) {
  //     handleSubmit();
  //   }
  // }, [timeRemaining]);

  const handleSubmit = async () => {
    if (!answer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAnswerSubmit(answer);
      setAnswer("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = (seconds: number) => {
    if (seconds <= 10) return "#ff4d4f";
    if (seconds <= 30) return "#faad14";
    return "#52c41a";
  };

  return (
    <div
      className="chat-interface"
      style={{
        height: "calc(100vh - 200px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Card
        className="chat-messages"
        style={{
          height: "calc(100vh - 400px)",
          minHeight: "300px",
          maxHeight: "400px",
          overflowY: "auto",
          flex: 1,
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: "flex",
              justifyContent:
                message.type === "user" ? "flex-end" : "flex-start",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                padding: "8px 12px",
                borderRadius: "12px",
                backgroundColor:
                  message.type === "user" ? "#1890ff" : "#f0f0f0",
                color: message.type === "user" ? "white" : "black",
              }}
            >
              <div style={{ whiteSpace: "pre-line", lineHeight: "1.5" }}>
                {message.content?.split("\n").map((line, index) => {
                  // Handle lines that start with specific patterns
                  if (line.startsWith("Question") && line.includes("/6")) {
                    return (
                      <div
                        key={index}
                        style={{
                          marginBottom: "8px",
                          fontWeight: "bold",
                          fontSize: "16px",
                          color: "#1890ff",
                        }}
                      >
                        {line}
                      </div>
                    );
                  }
                  if (
                    line.startsWith("Category:") ||
                    line.startsWith("Difficulty:") ||
                    line.startsWith("Time Limit:")
                  ) {
                    return (
                      <div
                        key={index}
                        style={{ marginBottom: "4px", fontSize: "14px" }}
                      >
                        <strong>{line.split(":")[0]}:</strong>{" "}
                        {line.split(":").slice(1).join(":").trim()}
                      </div>
                    );
                  }
                  if (line.trim() === "") {
                    return (
                      <div key={index} style={{ marginBottom: "8px" }}></div>
                    );
                  }

                  // Check if this is feedback content (starts with Score:)
                  const isFeedback = line.startsWith("Score:");

                  return (
                    <div
                      key={index}
                      style={{
                        marginBottom: "4px",
                        ...(isFeedback && {
                          fontSize: "12px",
                          color: "#666",
                          fontWeight: "500",
                          backgroundColor: "#f8f9fa",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: "1px solid #e9ecef",
                        }),
                      }}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  opacity: 0.7,
                  marginTop: "4px",
                  textAlign: message.type === "user" ? "right" : "left",
                }}
              >
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isEvaluating && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin size="large" />
            <div style={{ marginTop: "8px" }}>
              <Text>Evaluating your answer...</Text>
            </div>
          </div>
        )}

        {currentQuestion && timeRemaining > 0 && !isEvaluating && (
          <div
            style={{
              position: "sticky",
              bottom: 0,
              backgroundColor: "#fff",
              borderTop: "1px solid #f0f0f0",
              padding: "8px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ClockCircleOutlined
                style={{ color: getTimeColor(timeRemaining), fontSize: "14px" }}
              />
              <Text
                strong
                style={{
                  color: getTimeColor(timeRemaining),
                  fontSize: "14px",
                }}
              >
                Time: {formatTime(timeRemaining)}
              </Text>
            </div>
            <Progress
              percent={(timeRemaining / currentQuestion.timeLimit) * 100}
              strokeColor={getTimeColor(timeRemaining)}
              showInfo={false}
              size="small"
              style={{ width: "150px" }}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </Card>

      {currentQuestion && !isEvaluating && (
        <Card
          className="answer-input"
          style={{ marginTop: "8px", flexShrink: 0 }}
        >
          <TextArea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={3}
            disabled={isSubmitting}
            onPressEnter={(e) => {
              if (e.shiftKey) return;
              e.preventDefault();
              handleSubmit();
            }}
            style={{ resize: "none" }}
          />
          <div
            style={{
              marginTop: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Press Enter to submit, Shift+Enter for new line
            </Text>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={!answer.trim()}
              size="small"
            >
              Submit
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChatInterface;
