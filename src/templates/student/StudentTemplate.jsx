import MinimalTemplate from "../minimal/MinimalTemplate.jsx";

export default function StudentTemplate(props) {
  return (
    <div className="h-full">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 opacity-90" />
      <MinimalTemplate {...props} />
    </div>
  );
}
