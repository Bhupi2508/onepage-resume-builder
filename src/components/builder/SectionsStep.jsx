import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { ITEM_FIELDS, MAX_SECTIONS, SECTION_CATALOG, SECTION_TYPES, itemIsEmpty } from "../../../shared/sections.js";
import * as ops from "../../../shared/resumeOps.js";
import { Button, ConfirmDialog, Field, IconButton } from "../ui.jsx";

function ItemEditor({ section, item, index, total, edit, errors, path }) {
  const def = SECTION_TYPES[section.type];
  const set = (key) => (e) => edit((r) => ops.patchItem(r, section.id, item.id, { [key]: e.target.value }));
  const field = (key, extra = {}) => {
    const d = def.fields[key];
    if (!d) return null;
    return <Field key={key} label={d.label} name={`${item.id}-${key}`} id={`${item.id}-${key}`} value={item[key]} max={d.max} multiline={d.multiline} placeholder={d.placeholder} hint={d.hint} error={errors[`${path}.${key}`]} onChange={set(key)} {...extra} />;
  };
  const inline = def.layout === "inline";
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
      {def.maxItems > 1 ? (
        <div className="mb-2 flex items-center justify-between">
          <span className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500">{inline ? "Group" : "Entry"} {index + 1}{item.heading ? ` · ${item.heading}` : ""}</span>
          <div className="flex shrink-0">
            <IconButton label="Move entry up" disabled={index === 0} onClick={() => edit((r) => ops.moveItem(r, section.id, item.id, -1))}><ArrowUp className="h-4 w-4" /></IconButton>
            <IconButton label="Move entry down" disabled={index === total - 1} onClick={() => edit((r) => ops.moveItem(r, section.id, item.id, 1))}><ArrowDown className="h-4 w-4" /></IconButton>
            <IconButton label="Remove entry" onClick={() => edit((r) => ops.removeItem(r, section.id, item.id))}><Trash2 className="h-4 w-4" /></IconButton>
          </div>
        </div>
      ) : null}
      <div className="space-y-3">
        {inline ? (
          <>
            {field("heading")}
            {field("text")}
          </>
        ) : (
          <>
            {field("heading")}
            {field("subheading")}
            {def.fields.date || def.fields.meta ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {field("date")}
                {field("meta")}
              </div>
            ) : null}
            {field("text")}
          </>
        )}
      </div>
    </div>
  );
}

function SectionCard({ section, index, total, open, setOpen, edit, errors, onDelete }) {
  const def = SECTION_TYPES[section.type];
  const filled = section.items.filter((i) => !itemIsEmpty(i, section.type)).length;
  const bodyId = `sec-body-${section.id}`;
  return (
    <div id={`sec-${section.id}`} className={"rounded-2xl border bg-white dark:bg-slate-900 " + (section.visible ? "border-slate-200 dark:border-slate-800" : "border-dashed border-slate-300 dark:border-slate-700 opacity-80")}>
      <div className="flex items-center gap-1 p-2">
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={bodyId} aria-label={`${open ? "Collapse" : "Expand"} ${section.title}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <ChevronDown className={"h-4 w-4 transition-transform " + (open ? "" : "-rotate-90")} />
        </button>
        <div className="min-w-0 flex-1">
          <input aria-label="Section title" value={section.title} maxLength={60} onChange={(e) => edit((r) => ops.patchSection(r, section.id, { title: e.target.value }))} className="w-full rounded-lg bg-transparent px-2 py-1 text-sm font-semibold focus:bg-slate-100 dark:focus:bg-slate-800" />
          <p className="px-2 text-xs text-slate-500">{!section.visible ? "Hidden from resume" : filled ? `${filled} ${filled === 1 ? "entry" : "entries"}` : "Empty — won't appear on the resume"}</p>
        </div>
        <IconButton label={section.visible ? "Hide section from resume" : "Show section on resume"} aria-pressed={section.visible} onClick={() => edit((r) => ops.patchSection(r, section.id, { visible: !section.visible }))}>{section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</IconButton>
        <IconButton label="Move section up" disabled={index === 0} onClick={() => edit((r) => ops.moveSection(r, section.id, -1))}><ArrowUp className="h-4 w-4" /></IconButton>
        <IconButton label="Move section down" disabled={index === total - 1} onClick={() => edit((r) => ops.moveSection(r, section.id, 1))}><ArrowDown className="h-4 w-4" /></IconButton>
        <IconButton label="Delete section" onClick={onDelete}><Trash2 className="h-4 w-4" /></IconButton>
      </div>
      {open ? (
        <div id={bodyId} className="space-y-3 border-t border-slate-100 dark:border-slate-800 p-3">
          {section.items.map((item, i) => (
            <ItemEditor key={item.id} section={section} item={item} index={i} total={section.items.length} edit={edit} errors={errors} path={`sections.${index}.items.${i}`} />
          ))}
          {section.items.length < def.maxItems ? (
            <Button size="sm" onClick={() => edit((r) => ops.addItem(r, section.id))}><Plus className="h-4 w-4" />{def.layout === "inline" ? "Add skill group" : "Add entry"}</Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function SectionsStep({ resume, edit, errors, focusId }) {
  const [openId, setOpenId] = useState(resume.sections[0]?.id);
  const [toDelete, setToDelete] = useState(null);
  useEffect(() => {
    if (!focusId) return;
    setOpenId(focusId);
    setTimeout(() => document.getElementById(`sec-${focusId}`)?.scrollIntoView({ block: "center", behavior: "smooth" }), 50);
  }, [focusId]);
  const target = resume.sections.find((s) => s.id === toDelete);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold">Resume sections</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Fill in what applies to you. Empty sections never appear. Use the arrows to reorder, and the eye to hide a section without losing it.</p>
      </div>
      <div className="space-y-2">
        {resume.sections.map((s, i) => (
          <SectionCard key={s.id} section={s} index={i} total={resume.sections.length} open={openId === s.id} setOpen={(o) => setOpenId(o ? s.id : null)} edit={edit} errors={errors} onDelete={() => setToDelete(s.id)} />
        ))}
        {!resume.sections.length ? <p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">No sections yet. Add one below.</p> : null}
      </div>
      <details className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 text-sm font-semibold"><Plus className="h-4 w-4" /> Add a section <span className="ml-auto text-xs font-normal text-slate-500">{resume.sections.length}/{MAX_SECTIONS}</span></summary>
        <div className="grid grid-cols-1 gap-2 border-t border-slate-100 dark:border-slate-800 p-3 sm:grid-cols-2">
          {SECTION_CATALOG.map((c) => (
            <button key={c.title} type="button" disabled={resume.sections.length >= MAX_SECTIONS} onClick={() => { const r = ops.addSection(resume, c.type, c.title); edit(() => r); setOpenId(r.sections[r.sections.length - 1].id); }} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40">
              {c.title}
            </button>
          ))}
        </div>
      </details>
      <ConfirmDialog open={!!target} danger title="Delete this section?" message={target ? `“${target.title}” and everything in it will be removed. To keep the content but not show it, hide the section instead.` : ""} confirmLabel="Delete section" onCancel={() => setToDelete(null)} onConfirm={() => { edit((r) => ops.removeSection(r, toDelete)); setToDelete(null); }} />
    </div>
  );
}
export { ITEM_FIELDS };
