import MinimalTemplate from "../minimal/MinimalTemplate.jsx";

export default function GradientTemplate(props) {
  return (
    <div className="h-full relative">
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(79,70,229,0.10), rgba(20,184,166,0.10), rgba(99,102,241,0.06))",
          pointerEvents: "none",
        }}
      />
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-600 via-cyan-500 to-fuchsia-500" />
        <MinimalTemplate {...props} />
      </div>
    </div>
  );
}
