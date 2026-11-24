// The resume itself. Rendered identically in the live preview, in print, and
// on the server (react-dom/server) for PDF export, so output cannot drift.
import { SECTION_TYPES, itemIsEmpty, sectionHasContent, splitLines, splitList } from "../../shared/sections.js";
import { getTemplate } from "../../shared/templates.js";
import { displayUrl, isSafeUrl, normalizeUrl } from "../../shared/url.js";

function Link({ value }) {
  const v = String(value || "").trim();
  if (!v) return null;
  return isSafeUrl(v) ? (
    <a href={normalizeUrl(v)}>{displayUrl(v)}</a>
  ) : (
    <span>{v}</span>
  );
}

function Contacts({ basics }) {
  const parts = [
    basics.email && <a href={`mailto:${basics.email.trim()}`}>{basics.email.trim()}</a>,
    basics.phone && <span>{basics.phone.trim()}</span>,
    basics.location && <span>{basics.location.trim()}</span>,
    basics.linkedin && <Link value={basics.linkedin} />,
    basics.github && <Link value={basics.github} />,
    basics.website && <Link value={basics.website} />,
  ].filter(Boolean);
  if (!parts.length) return null;
  return (
    <div className="rp-contact">
      {parts.map((p, i) => (
        <span key={i} className="rp-contact-item">
          {i > 0 ? <span className="rp-sep"> | </span> : null}
          {p}
        </span>
      ))}
    </div>
  );
}

function Bullets({ text, bullets }) {
  const lines = splitLines(text);
  if (!lines.length) return null;
  if (!bullets && lines.length === 1) return <p className="rp-text">{lines[0]}</p>;
  return (
    <ul className="rp-list">
      {lines.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ul>
  );
}

function Entry({ item, def }) {
  const { heading, subheading, date, meta, text } = item;
  const metaIsLink = def.fields.meta?.url;
  const hasTop = heading || date;
  const hasSub = subheading || meta;
  return (
    <div className="rp-entry">
      {hasTop ? (
        <div className="rp-row">
          <span className="rp-h">{heading}</span>
          {date ? <span className="rp-date">{date}</span> : null}
        </div>
      ) : null}
      {hasSub ? (
        <div className="rp-row rp-subrow">
          <span className="rp-sub">{subheading}</span>
          {meta ? <span className="rp-meta">{metaIsLink ? <Link value={meta} /> : meta}</span> : null}
        </div>
      ) : null}
      <Bullets text={text} bullets={def.bullets} />
    </div>
  );
}

function InlineItem({ item }) {
  const list = splitList(item.text);
  if (!list.length) return null;
  return (
    <p className="rp-inline">
      {item.heading ? <strong>{item.heading}: </strong> : null}
      {list.join(", ")}
    </p>
  );
}

export function visibleSections(resume) {
  return resume.sections.filter((s) => s.visible && sectionHasContent(s));
}

export default function ResumeDocument({ resume, density = 0 }) {
  const { basics } = resume;
  const tpl = getTemplate(resume.templateId);
  const name = (basics.name || "").trim();
  const title = (basics.title || "").trim();
  const sections = visibleSections(resume);
  const longName = name.length > 34;

  return (
    <div className={`rp tpl-${tpl.id} hdr-${tpl.header}`} data-density={density} data-resume-page>
      <div className="rp-body" data-resume-body>
        <header className="rp-head" data-section-id="header">
          <h1 className={`rp-name${longName ? " rp-name-long" : ""}`}>{name || "Your Name"}</h1>
          {title ? <div className="rp-title">{title}</div> : null}
          <Contacts basics={basics} />
        </header>
        {basics.summary?.trim() ? (
          <section className="rp-sec" data-section-id="summary">
            <h2 className="rp-sec-title">Summary</h2>
            <p className="rp-text">{basics.summary.trim()}</p>
          </section>
        ) : null}
        {sections.map((s) => {
          const def = SECTION_TYPES[s.type];
          const items = s.items.filter((i) => !itemIsEmpty(i, s.type));
          return (
            <section className="rp-sec" key={s.id} data-section-id={s.id}>
              <h2 className="rp-sec-title">{s.title || def.label}</h2>
              {def.layout === "inline"
                ? items.map((i) => <InlineItem key={i.id} item={i} />)
                : items.map((i) => <Entry key={i.id} item={i} def={def} />)}
            </section>
          );
        })}
      </div>
    </div>
  );
}
