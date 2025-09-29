import { MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import type { Rule } from "antd/es/form";
import { useState } from "react";

const { Title, Text } = Typography;

interface MissingFieldsCollectorProps {
  missingFields: string[];
  onComplete: (data: { name: string; email: string; phone: string }) => void;
}

const MissingFieldsCollector: React.FC<MissingFieldsCollectorProps> = ({
  missingFields,
  onComplete,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: {
    name: string;
    email: string;
    phone: string;
  }) => {
    setIsSubmitting(true);
    try {
      await onComplete(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldLabel = (field: string) => {
    switch (field) {
      case "name":
        return "Full Name";
      case "email":
        return "Email Address";
      case "phone":
        return "Phone Number";
      default:
        return field;
    }
  };

  const getFieldIcon = (field: string) => {
    switch (field) {
      case "name":
        return <UserOutlined />;
      case "email":
        return <MailOutlined />;
      case "phone":
        return <PhoneOutlined />;
      default:
        return null;
    }
  };

  const getFieldRules = (field: string) => {
    const rules: Rule[] = [
      {
        required: true,
        message: `Please provide your ${getFieldLabel(field).toLowerCase()}`,
      },
    ];

    if (field === "email") {
      rules.push({
        type: "email",
        message: "Please enter a valid email address",
      });
    }

    if (field === "phone") {
      rules.push({
        pattern: /^[+]?[1-9][\d]{0,15}$/,
        message: "Please enter a valid phone number",
      });
    }

    return rules;
  };

  return (
    <Card className="missing-fields-card">
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Title level={3}>Complete Your Profile</Title>
        <Text type="secondary">
          We need a few more details to get started with your interview.
        </Text>

        <Alert
          message="Missing Information"
          description={`We couldn't extract the following information from your resume: ${missingFields.join(
            ", "
          )}. Please provide these details below.`}
          type="info"
          showIcon
          style={{ margin: "16px 0" }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: "400px", margin: "0 auto" }}
        >
          {missingFields.map((field) => (
            <Form.Item
              key={field}
              name={field}
              label={getFieldLabel(field)}
              rules={getFieldRules(field)}
            >
              <Input
                prefix={getFieldIcon(field)}
                placeholder={`Enter your ${getFieldLabel(field).toLowerCase()}`}
                size="large"
              />
            </Form.Item>
          ))}

          <Form.Item style={{ marginTop: "24px" }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isSubmitting}
              block
            >
              Continue to Interview
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Card>
  );
};

export default MissingFieldsCollector;
