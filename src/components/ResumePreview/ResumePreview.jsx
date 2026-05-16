import { formatPhone } from "../../utils/format.js";
import MinimalTemplate from "../../templates/minimal/MinimalTemplate.jsx";
import ModernTemplate from "../../templates/modern/ModernTemplate.jsx";
import GradientTemplate from "../../templates/gradient/GradientTemplate.jsx";
import StudentTemplate from "../../templates/student/StudentTemplate.jsx";

export default function ResumePreview({ values }) {
  const { templateId, resumeType } = values;

  if (templateId === "modern")
    return <ModernTemplate values={values} resumeType={resumeType} />;
  if (templateId === "gradient")
    return <GradientTemplate values={values} resumeType={resumeType} />;
  if (templateId === "student")
    return <StudentTemplate values={values} resumeType={resumeType} />;
  return <MinimalTemplate values={values} resumeType={resumeType} />;
}
