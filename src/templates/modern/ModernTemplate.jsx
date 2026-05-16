import MinimalTemplate from "../minimal/MinimalTemplate.jsx";

export default function ModernTemplate(props) {
  return (
    <div className="h-full">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-500 opacity-80" />
      <MinimalTemplate {...props} />
    </div>
  );
}
