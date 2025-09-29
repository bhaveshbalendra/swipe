import { CheckCircleOutlined, FileTextOutlined } from "@ant-design/icons";
import { Upload as AntUpload, Card, Spin, Typography } from "antd";
import { useState } from "react";
import type { ParsedResume } from "../types";
import { resumeParser } from "../utils/resumeParser";

const { Title, Text } = Typography;
const { Dragger } = AntUpload;

interface ResumeUploadProps {
  onResumeParsed: (parsed: ParsedResume) => void;
  onError: (error: string) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onResumeParsed,
  onError,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadedFile(file);

    try {
      const parsed = await resumeParser.parseResume(file);
      onResumeParsed(parsed);
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Failed to parse resume"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: ".pdf,.docx",
    beforeUpload: (file: File) => {
      handleFileUpload(file);
      return false; // Prevent default upload
    },
    showUploadList: false,
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .resume-upload-card .ant-card-body {
              padding: 16px !important;
            }
            .resume-upload-card .ant-upload-drag {
              height: 150px !important;
            }
            .resume-upload-card .ant-upload-drag-icon {
              font-size: 32px !important;
            }
            .resume-upload-card .ant-upload-text {
              font-size: 14px !important;
            }
            .resume-upload-card .ant-upload-hint {
              font-size: 12px !important;
            }
          }
          @media (max-width: 480px) {
            .resume-upload-card .ant-upload-drag {
              height: 120px !important;
            }
            .resume-upload-card .ant-upload-drag-icon {
              font-size: 24px !important;
            }
            .resume-upload-card .ant-upload-text {
              font-size: 12px !important;
            }
            .resume-upload-card .ant-upload-hint {
              font-size: 10px !important;
            }
          }
        `}
      </style>
      <Card
        className="resume-upload-card"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "clamp(16px, 3vw, 24px)",
            width: "100%",
          }}
        >
          <Title
            level={3}
            style={{
              fontSize: "clamp(18px, 4vw, 24px)",
              marginBottom: "clamp(8px, 2vw, 16px)",
            }}
          >
            Upload Your Resume
          </Title>
          <Text
            type="secondary"
            style={{
              fontSize: "clamp(12px, 2.5vw, 14px)",
              display: "block",
              marginBottom: "clamp(16px, 3vw, 24px)",
              lineHeight: "1.5",
            }}
          >
            Please upload your resume in PDF or DOCX format. We'll extract your
            contact information to get started.
          </Text>

          <div
            style={{
              marginTop: "clamp(16px, 3vw, 24px)",
              position: "relative",
            }}
          >
            <Dragger
              {...uploadProps}
              style={{
                height: "clamp(150px, 25vw, 200px)",
                minHeight: "120px",
                opacity: isUploading ? 0.6 : 1,
                pointerEvents: isUploading ? "none" : "auto",
              }}
            >
              <p className="ant-upload-drag-icon">
                <FileTextOutlined
                  style={{
                    fontSize: "clamp(32px, 6vw, 48px)",
                    color: "#1890ff",
                  }}
                />
              </p>
              <p
                className="ant-upload-text"
                style={{
                  fontSize: "clamp(12px, 2.5vw, 16px)",
                  margin: "8px 0",
                }}
              >
                {isUploading
                  ? "Processing file..."
                  : "Click or drag file to this area to upload"}
              </p>
              <p
                className="ant-upload-hint"
                style={{
                  fontSize: "clamp(10px, 2vw, 14px)",
                  margin: "4px 0",
                }}
              >
                Support for PDF and DOCX files
              </p>
            </Dragger>

            {isUploading && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  padding: "16px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  zIndex: 10,
                }}
              >
                <Spin
                  size="large"
                  style={{
                    fontSize: "clamp(16px, 3vw, 24px)",
                  }}
                />
                <div
                  style={{
                    marginTop: "clamp(6px, 1vw, 8px)",
                    textAlign: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: "clamp(12px, 2.5vw, 14px)",
                    }}
                  >
                    Parsing your resume...
                  </Text>
                </div>
              </div>
            )}
          </div>

          {uploadedFile && !isUploading && (
            <div
              style={{
                marginTop: "clamp(12px, 2vw, 16px)",
                textAlign: "center",
              }}
            >
              <CheckCircleOutlined
                style={{
                  color: "#52c41a",
                  fontSize: "clamp(20px, 4vw, 24px)",
                }}
              />
              <div
                style={{
                  marginTop: "clamp(6px, 1vw, 8px)",
                }}
              >
                <Text
                  strong
                  style={{
                    fontSize: "clamp(12px, 2.5vw, 14px)",
                    wordBreak: "break-word",
                  }}
                >
                  File uploaded: {uploadedFile.name}
                </Text>
              </div>
            </div>
          )}
        </div>
      </Card>
    </>
  );
};

export default ResumeUpload;
