import { Button, Card, Form, Space } from "antd";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { addCandidate } from "../../store/slices/candidateSlice";
import { logger } from "../../utils/logger";
import type { CandidateFormData } from "../../utils/validation";
import { candidateSchema, resumeUploadSchema } from "../../utils/validation";
import { ValidatedForm } from "./ValidatedForm";
import { ValidatedInput } from "./ValidatedInput";
import { ValidatedUpload } from "./ValidatedUpload";

export const CandidateForm: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleSubmit = async (
    data: CandidateFormData & { resume?: File | null }
  ) => {
    try {
      logger.info("Creating new candidate", "candidate-form", { data });

      const candidate = {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        resumeText: "",
        score: 0,
        status: "pending" as const,
        createdAt: new Date().toISOString(),
        resumeUrl: data.resume ? URL.createObjectURL(data.resume) : undefined,
        interviewStatus: "not_started" as const,
        currentQuestionIndex: 0,
        questions: [],
        answers: [],
        startTime: new Date().toISOString(),
      };

      dispatch(addCandidate(candidate));

      logger.info("Candidate created successfully", "candidate-form", {
        candidateId: candidate.id,
      });
    } catch (error) {
      logger.error("Failed to create candidate", "candidate-form", {
        error,
        data,
      });
    }
  };

  // Combined schema for form validation
  const formSchema = candidateSchema.extend({
    resume: resumeUploadSchema.shape.file.optional(),
  });

  return (
    <Card title="Add New Candidate" style={{ maxWidth: 600, margin: "0 auto" }}>
      <ValidatedForm
        schema={formSchema}
        onSubmit={handleSubmit}
        layout="vertical"
      >
        {(form) => (
          <>
            <ValidatedInput
              form={form}
              name="name"
              label="Full Name"
              placeholder="Enter candidate's full name"
              validateOnChange={true}
              validateOnBlur={true}
            />

            <ValidatedInput
              form={form}
              name="email"
              label="Email Address"
              type="email"
              placeholder="Enter candidate's email"
              validateOnChange={true}
              validateOnBlur={true}
            />

            <ValidatedInput
              form={form}
              name="phone"
              label="Phone Number"
              placeholder="Enter candidate's phone number"
              validateOnChange={true}
              validateOnBlur={true}
            />

            <ValidatedUpload
              form={form}
              name="resume"
              label="Resume (PDF or DOCX)"
              accept=".pdf,.docx"
              maxCount={1}
              validateOnChange={true}
            />

            <Form.Item>
              <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                <Button type="default" onClick={() => form.reset()}>
                  Reset
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={form.formState.isSubmitting}
                >
                  Add Candidate
                </Button>
              </Space>
            </Form.Item>
          </>
        )}
      </ValidatedForm>
    </Card>
  );
};

export default CandidateForm;
