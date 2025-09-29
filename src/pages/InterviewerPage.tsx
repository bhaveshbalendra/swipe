import {
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Descriptions,
  Input,
  Modal,
  Progress,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import type { Answer, Candidate, Question } from "../types";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const InterviewerPage: React.FC = () => {
  const candidates = useSelector(
    (state: RootState) => state.candidates.candidates
  );

  // Debug: Log candidates to see what we have
  console.log("InterviewerPage - All candidates:", candidates);
  console.log("InterviewerPage - Candidates length:", candidates.length);
  console.log(
    "InterviewerPage - Completed candidates:",
    candidates.filter((c) => c.status === "completed")
  );
  console.log(
    "InterviewerPage - All statuses:",
    candidates.map((c) => ({ name: c.name, status: c.status, score: c.score }))
  );
  console.log(
    "InterviewerPage - Scores:",
    candidates.map((c) => ({
      name: c.name,
      score: c.score,
      hasInterviewData: !!c.interviewData,
      answersCount: c.interviewData?.answers?.length || 0,
    }))
  );

  // Debug: Check Redux store state
  const allCandidates = useSelector((state: RootState) => state.candidates);
  console.log("InterviewerPage - Redux candidates state:", allCandidates);

  // Debug: Check if store is working
  const testStore = useSelector((state: RootState) => state);
  console.log("InterviewerPage - Full store state:", testStore);

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState<"name" | "score" | "createdAt">(
    "score"
  );
  const [sortOrder, setSortOrder] = useState<"ascend" | "descend">("descend");

  const filteredAndSortedCandidates = candidates
    .filter(
      (candidate: Candidate) =>
        candidate.name.toLowerCase().includes(searchText.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a: Candidate, b: Candidate) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "score":
          aValue = a.score || 0;
          bValue = b.score || 0;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === "ascend") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green";
      case "in_progress":
        return "blue";
      case "not_started":
        return "default";
      default:
        return "default";
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "default";
    if (score >= 80) return "green";
    if (score >= 60) return "blue";
    if (score >= 40) return "orange";
    return "red";
  };

  const handleViewDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailModalOpen(true);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "25%",
      minWidth: 150,
      render: (text: string, record: Candidate) => (
        <div>
          <Text strong style={{ fontSize: "clamp(12px, 2vw, 14px)" }}>
            {text}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: "11px" }}>
            {record.email}
          </Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "15%",
      minWidth: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ fontSize: "11px" }}>
          {status.replace("_", " ").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      width: "20%",
      minWidth: 120,
      render: (score: number | undefined, record: Candidate) =>
        record.status === "completed" ? (
          <div>
            <Progress
              percent={score || 0}
              size="small"
              strokeColor={getScoreColor(score)}
              format={() => `${score || 0}/100`}
            />
          </div>
        ) : (
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Not completed
          </Text>
        ),
    },
    {
      title: "Progress",
      key: "progress",
      width: "20%",
      minWidth: 100,
      render: (record: Candidate) => (
        <div>
          <Text style={{ fontSize: "12px" }}>
            {record.interviewData?.answers.length || 0}/6
          </Text>
          <br />
          <Progress
            percent={((record.interviewData?.answers.length || 0) / 6) * 100}
            size="small"
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: "Start Time",
      dataIndex: "createdAt",
      key: "startTime",
      width: "15%",
      minWidth: 120,
      render: (time: string | undefined) => (
        <Text style={{ fontSize: "11px" }}>
          {time ? new Date(time).toLocaleDateString() : "-"}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "5%",
      minWidth: 80,
      render: (record: Candidate) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
          size="small"
          style={{ padding: "4px 8px" }}
        >
          View
        </Button>
      ),
    },
  ];

  const renderQuestionDetails = (answers: Answer[]) => {
    return answers.map((answer, index) => {
      const question = selectedCandidate?.interviewData?.questions.find(
        (q: Question) => q.id === answer.questionId
      );
      return (
        <Card
          key={answer.questionId}
          size="small"
          style={{ marginBottom: "12px" }}
        >
          <div style={{ marginBottom: "8px" }}>
            <Text strong>
              Question {index + 1}: {question?.category}
            </Text>
            <Tag
              color={
                question?.difficulty === "easy"
                  ? "green"
                  : question?.difficulty === "medium"
                  ? "orange"
                  : "red"
              }
              style={{ marginLeft: "8px" }}
            >
              {question?.difficulty?.toUpperCase()}
            </Tag>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <Text>{question?.text}</Text>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <Text strong>Answer:</Text>
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "8px",
                borderRadius: "4px",
                marginTop: "4px",
              }}
            >
              {answer.text}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <Text strong>Score: </Text>
              <Tag color={getScoreColor(answer.score)}>{answer.score}/100</Tag>
            </div>
            <div>
              <Text type="secondary">
                Time spent: {Math.round((answer.timeSpent || 0) / 60)}m{" "}
                {(answer.timeSpent || 0) % 60}s
              </Text>
            </div>
          </div>
          {answer.feedback && (
            <div style={{ marginTop: "8px" }}>
              <Text strong>Feedback:</Text>
              <div
                style={{
                  backgroundColor: "#e6f7ff",
                  padding: "8px",
                  borderRadius: "4px",
                  marginTop: "4px",
                }}
              >
                {answer.feedback}
              </div>
            </div>
          )}
        </Card>
      );
    });
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .interviewer-page .ant-table-thead > tr > th {
              padding: 8px 4px !important;
              font-size: 11px !important;
            }
            .interviewer-page .ant-table-tbody > tr > td {
              padding: 8px 4px !important;
            }
            .interviewer-page .ant-card-body {
              padding: 12px !important;
            }
            .interviewer-page .ant-modal {
              margin: 0 !important;
              max-width: 100vw !important;
            }
          }
          @media (max-width: 480px) {
            .interviewer-page .ant-table {
              font-size: 10px !important;
            }
            .interviewer-page .ant-btn {
              padding: 4px 8px !important;
              font-size: 10px !important;
            }
          }
        `}
      </style>
      <div className="interviewer-page" style={{ minHeight: "100vh" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "clamp(8px, 2vw, 16px)",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Title
            level={2}
            style={{
              marginBottom: "20px",
              fontSize: "clamp(20px, 4vw, 28px)",
              textAlign: "center",
            }}
          >
            Interview Dashboard
          </Title>

          <Card style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              {/* Header Row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <Title
                  level={4}
                  style={{ margin: 0, fontSize: "clamp(16px, 3vw, 20px)" }}
                >
                  Candidates ({candidates.length})
                </Title>
              </div>

              {/* Controls Row */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  width: "100%",
                }}
              >
                {/* Search and Sort Controls */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "12px",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <Search
                    placeholder="Search candidates..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{
                      width: "100%",
                      maxWidth: "300px",
                      minWidth: "200px",
                    }}
                    prefix={<SearchOutlined />}
                  />
                  <Select
                    value={sortField}
                    onChange={setSortField}
                    style={{
                      width: "120px",
                      minWidth: "100px",
                    }}
                  >
                    <Option value="name">Name</Option>
                    <Option value="score">Score</Option>
                    <Option value="createdAt">Start Time</Option>
                  </Select>
                  <Button
                    icon={
                      sortOrder === "ascend" ? (
                        <SortAscendingOutlined />
                      ) : (
                        <SortDescendingOutlined />
                      )
                    }
                    onClick={() =>
                      setSortOrder(
                        sortOrder === "ascend" ? "descend" : "ascend"
                      )
                    }
                    size="small"
                  >
                    {sortOrder === "ascend" ? "Asc" : "Desc"}
                  </Button>
                </div>
              </div>
            </div>

            <Table
              columns={columns}
              dataSource={filteredAndSortedCandidates}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} candidates`,
              }}
              scroll={{
                x: "max-content",
                y: "calc(100vh - 400px)",
              }}
              size="small"
              style={{
                width: "100%",
              }}
            />
          </Card>

          <Modal
            title={`Interview Details - ${selectedCandidate?.name}`}
            open={isDetailModalOpen}
            onCancel={() => setIsDetailModalOpen(false)}
            footer={null}
            width="90%"
            style={{
              maxWidth: "800px",
              top: "20px",
            }}
            bodyStyle={{
              maxHeight: "calc(100vh - 200px)",
              overflowY: "auto",
            }}
          >
            {selectedCandidate && (
              <div>
                <Descriptions
                  title="Candidate Information"
                  bordered
                  column={1}
                  size="small"
                >
                  <Descriptions.Item label="Name">
                    <UserOutlined style={{ marginRight: "8px" }} />
                    {selectedCandidate.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    <MailOutlined style={{ marginRight: "8px" }} />
                    {selectedCandidate.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    <PhoneOutlined style={{ marginRight: "8px" }} />
                    {selectedCandidate.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={getStatusColor(selectedCandidate.status)}>
                      {selectedCandidate.status.replace("_", " ").toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Final Score">
                    {selectedCandidate.status === "completed" ? (
                      <Tag color={getScoreColor(selectedCandidate.score)}>
                        {selectedCandidate.score || 0}/100
                      </Tag>
                    ) : (
                      <Text type="secondary">Not completed</Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Start Time">
                    {selectedCandidate.createdAt
                      ? new Date(selectedCandidate.createdAt).toLocaleString()
                      : "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="End Time">
                    {selectedCandidate.interviewData?.endTime
                      ? new Date(
                          selectedCandidate.interviewData.endTime
                        ).toLocaleString()
                      : "-"}
                  </Descriptions.Item>
                </Descriptions>

                {selectedCandidate.interviewData && (
                  <div style={{ marginTop: "24px" }}>
                    <Title level={4}>AI Summary</Title>
                    <Card>
                      <Text>
                        Interview completed with{" "}
                        {selectedCandidate.interviewData.answers.length} answers
                      </Text>
                    </Card>
                  </div>
                )}

                {selectedCandidate.interviewData?.answers.length &&
                  selectedCandidate.interviewData.answers.length > 0 && (
                    <div style={{ marginTop: "24px" }}>
                      <Title level={4}>Question Details</Title>
                      {renderQuestionDetails(
                        selectedCandidate.interviewData.answers
                      )}
                    </div>
                  )}
              </div>
            )}
          </Modal>
        </div>
      </div>
    </>
  );
};

export default InterviewerPage;
