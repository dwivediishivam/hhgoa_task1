"use client";

/* Blob URLs from local uploads cannot use Next's image optimizer. */
/* eslint-disable @next/next/no-img-element */

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  ChevronRight,
  ImagePlus,
  LoaderCircle,
  Move,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  UsersRound,
  WandSparkles,
  X,
  ZoomIn,
} from "lucide-react";
import { CanvasPreview } from "@/components/canvas-preview";
import { canvasToBlob, normalizeImage } from "@/lib/image";
import { outputDimensions, renderGraphic } from "@/lib/render";
import { makeBuilderTitle } from "@/lib/title";
import { DEFAULT_CROP, type BuilderProfile, type Member, type StudioMode, type Theme } from "@/lib/types";

type ToastKind = "success" | "error" | "info";
type Toast = { type: ToastKind; message: string } | null;

const MODES: Array<{ id: StudioMode; kicker: string; title: string; description: string; aspect: string }> = [
  { id: "id", kicker: "01 / POST IT", title: "Builder ID", description: "Your social-first passport to the build station.", aspect: "4:5" },
  { id: "pfp", kicker: "02 / WEAR IT", title: "PFP Frame", description: "Face-safe HH Goa framing for your X profile.", aspect: "1:1" },
  { id: "crew", kicker: "03 / BRING THE CREW", title: "Crew Manifest", description: "Put your team on one unmistakably Goa poster.", aspect: "4:3" },
];

const THEMES: Array<{ id: Theme; label: string; colors: string[] }> = [
  { id: "tide", label: "Tide", colors: ["#FFFBE8", "#0B6839", "#FEE101"] },
  { id: "heat", label: "Heat", colors: ["#FEE101", "#0B6839", "#FF0080"] },
  { id: "night", label: "After dark", colors: ["#0B6839", "#FEE101", "#FF0080"] },
];

const initialProfile: BuilderProfile = {
  name: "",
  role: "",
  title: makeBuilderTitle("", "", 0),
  titleSeed: 0,
  image: null,
  crop: DEFAULT_CROP,
  theme: "tide",
  crewName: "",
  members: [],
};

function fileName(mode: StudioMode, name: string) {
  const label = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "builder";
  const suffix = mode === "id" ? "builder-id" : mode === "pfp" ? "pfp-frame" : "crew-manifest";
  return `hh-goa-2026-${label}-${suffix}.jpg`;
}

function modeName(mode: StudioMode) {
  return mode === "id" ? "Builder ID" : mode === "pfp" ? "PFP Frame" : "Crew Manifest";
}

export function Studio() {
  const [mode, setMode] = useState<StudioMode>("id");
  const [profile, setProfile] = useState<BuilderProfile>(initialProfile);
  const [busy, setBusy] = useState<"download" | "share" | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [isDropping, setIsDropping] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const memberInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const activeMode = useMemo(() => MODES.find((entry) => entry.id === mode)!, [mode]);
  const outputLabel = modeName(mode);

  const notify = (message: string, type: ToastKind = "info") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 4400);
  };

  const setIdentity = (field: "name" | "role", value: string) => {
    setProfile((current) => {
      const next = { ...current, [field]: value };
      return { ...next, title: makeBuilderTitle(next.name, next.role, next.titleSeed) };
    });
  };

  const loadPrimaryPhoto = async (file?: File) => {
    if (!file) return;
    try {
      notify(/hei[cf]$/i.test(file.name) ? "Converting your iPhone photo locally…" : "Photo loaded. Drag it to frame it.");
      const normalized = await normalizeImage(file);
      const image = URL.createObjectURL(normalized);
      setProfile((current) => ({ ...current, image, crop: DEFAULT_CROP }));
      notify("Photo ready — drag directly on the preview to frame it.", "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "We couldn't use that photo.", "error");
    }
  };

  const changePrimaryPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    await loadPrimaryPhoto(event.target.files?.[0]);
    event.target.value = "";
  };

  const updateMember = (id: string, update: Partial<Member>) => {
    setProfile((current) => ({
      ...current,
      members: current.members.map((member) => (member.id === id ? { ...member, ...update } : member)),
    }));
  };

  const changeMemberPhoto = async (memberId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const normalized = await normalizeImage(file);
      updateMember(memberId, { image: URL.createObjectURL(normalized), crop: DEFAULT_CROP });
      notify("Crew photo locked in.", "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "We couldn't use that teammate photo.", "error");
    } finally {
      event.target.value = "";
    }
  };

  const addMember = () => {
    if (profile.members.length >= 3) {
      notify("This poster is tuned for you + three teammates.", "info");
      return;
    }
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `member-${Date.now()}`;
    setProfile((current) => ({
      ...current,
      members: [...current.members, { id, name: "", role: "", image: null, crop: DEFAULT_CROP }],
    }));
  };

  const createCanvas = async (social = false) => {
    const canvas = document.createElement("canvas");
    if ("fonts" in document) await document.fonts.ready;
    await renderGraphic(canvas, mode, profile, social ? { social: true } : outputDimensions(mode));
    return canvas;
  };

  const download = async () => {
    if (!profile.image) {
      notify("Add a photo first — then your download unlocks.", "info");
      photoInput.current?.click();
      return;
    }
    setBusy("download");
    try {
      const canvas = await createCanvas();
      const blob = await canvasToBlob(canvas, 0.94);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName(mode, profile.name);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify("High-resolution image downloaded.", "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Export failed. Please try again.", "error");
    } finally {
      setBusy(null);
    }
  };

  const shareToX = async () => {
    if (!profile.image) {
      notify("Add a photo first — then we can make your X preview.", "info");
      photoInput.current?.click();
      return;
    }
    let shareWindow: Window | null = null;
    try {
      shareWindow = window.open("", "_blank");
      setBusy("share");
      const canvas = await createCanvas(true);
      const blob = await canvasToBlob(canvas, 0.89);
      const form = new FormData();
      form.append("image", new File([blob], "hh-goa-social-card.jpg", { type: "image/jpeg" }));
      form.append("name", profile.name || "HH Goa builder");
      form.append("title", profile.title);
      form.append("mode", mode);
      const response = await fetch("/api/share", { method: "POST", body: form });
      const data = (await response.json().catch(() => ({}))) as { shareUrl?: string; error?: string };
      if (!response.ok || !data.shareUrl) throw new Error(data.error || "Could not create your share card.");
      const caption = `I just made my HH Goa 2026 ${modeName(mode)}. See you at the build station. 🌴\n\nMake yours →`;
      const intent = new URL("https://x.com/intent/tweet");
      intent.searchParams.set("text", `${caption}\n#FrameInGoa`);
      intent.searchParams.set("url", data.shareUrl);
      if (shareWindow) shareWindow.location.href = intent.toString();
      else window.location.assign(intent.toString());
      notify("Your X post is ready — make sure to hit Post.", "success");
    } catch (error) {
      shareWindow?.close();
      const message = error instanceof Error ? error.message : "Could not create your X share card.";
      notify(message.includes("not configured") ? "Share isn’t configured on this deployment yet. Download still works." : message, "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="studio-page">
      <div className="sun-stamp" aria-hidden="true" />
      <div className="wave-line wave-one" aria-hidden="true" />
      <div className="wave-line wave-two" aria-hidden="true" />
      <header className="topbar shell">
        <a className="brand-lockup" href="#studio" aria-label="HH Goa Builder House">
          <img src="/brand/hh-goa-lockup.svg" alt="Hacker House Goa" />
          <span>BUILDER HOUSE<br />2026</span>
        </a>
        <div className="topbar-center"><span className="status-dot" /> OPEN TRIAL / TASK 01</div>
        <a className="site-link" href="#how-it-works">HOW IT WORKS <ArrowUpRight size={16} /></a>
      </header>

      <section className="hero shell" id="studio">
        <div className="hero-copy">
          <p className="eyebrow">GOA, INDIA &nbsp;•&nbsp; 28—31 OCT 2026</p>
          <h1>MAKE YOUR<br /><em>BUILDER SIGNAL</em><br />UNMISSABLE.</h1>
          <p className="hero-description">One photo in. A personal HH Goa identity out. Frame your PFP, issue your Builder ID, then bring the whole crew into the picture.</p>
          <div className="hero-proof">
            <span><Check size={15} /> no login</span>
            <span><Check size={15} /> made for mobile</span>
            <span><Check size={15} /> ready in seconds</span>
          </div>
          <a className="hero-cta" href="#builder">MAKE YOUR ID <ArrowDownToLine size={16} /></a>
        </div>
        <div className="hero-side-note">
          <div className="note-arrow">↘</div>
          <p>THE INTERNET<br />WILL KNOW YOU<br />WERE HERE.</p>
          <small>SCROLL TO ISSUE<br />YOUR PASSPORT</small>
        </div>
      </section>

      <section className="studio-shell shell" id="builder" aria-labelledby="studio-heading">
        <div className="studio-title-row">
          <div>
            <p className="eyebrow">IDENTITY STUDIO / 0247</p>
            <h2 id="studio-heading">CHOOSE YOUR <em>FORMAT.</em></h2>
          </div>
          <p className="studio-title-hint">Your original stays on your device.<br />We only create a public image when you hit Share to X.</p>
        </div>

        <div className="mode-selector" role="tablist" aria-label="Choose a graphic format">
          {MODES.map((item, index) => (
            <motion.button
              key={item.id}
              type="button"
              className={`mode-card ${mode === item.id ? "is-active" : ""}`}
              onClick={() => setMode(item.id)}
              role="tab"
              aria-selected={mode === item.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="mode-index">{item.kicker}</span>
              <span className="mode-title">{item.title}</span>
              <span className="mode-description">{item.description}</span>
              <span className="mode-arrow"><ChevronRight size={24} /></span>
              <span className={`mode-art art-${index}`} aria-hidden="true" />
              <b>{item.aspect}</b>
            </motion.button>
          ))}
        </div>

        <div className="workbench">
          <section className="controls-panel" aria-label="Build your graphic">
            <div className="editor-heading">
              <div className="panel-kicker"><span>01</span> YOUR SIGNAL</div>
              <p>Start with the photo. Everything else is optional polish.</p>
            </div>
            <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" onChange={changePrimaryPhoto} hidden />
            <button
              className={`photo-upload ${profile.image ? "has-image" : ""} ${isDropping ? "is-dropping" : ""}`}
              type="button"
              onClick={() => photoInput.current?.click()}
              onDragEnter={(event) => { event.preventDefault(); setIsDropping(true); }}
              onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }}
              onDragLeave={(event) => { if (event.currentTarget === event.target) setIsDropping(false); }}
              onDrop={(event) => { event.preventDefault(); setIsDropping(false); void loadPrimaryPhoto(event.dataTransfer.files?.[0]); }}
            >
              {profile.image ? <img src={profile.image} alt="Selected builder" /> : <span className="upload-portrait" aria-hidden="true" />}
              <span className="upload-copy">
                <strong>{profile.image ? "SWAP YOUR PHOTO" : "DROP YOUR PHOTO"}</strong>
                <small>or tap to browse • JPG, PNG, HEIC</small>
              </span>
              <ImagePlus size={23} />
            </button>
            <p className="privacy-line"><Check size={14} /> Original stays on your device until you choose Share.</p>

            <div className="field-grid">
              <label className="field-label">
                <span>YOUR NAME</span>
                <input value={profile.name} onChange={(event) => setIdentity("name", event.target.value)} placeholder="e.g. Aanya Shah" maxLength={28} />
              </label>
              <label className="field-label">
                <span>STACK / ROLE</span>
                <input value={profile.role} onChange={(event) => setIdentity("role", event.target.value)} placeholder="e.g. Product designer" maxLength={42} />
              </label>
            </div>

            <div className="builder-class">
              <div>
                <span>YOUR GENERATED BUILDER CLASS</span>
                <strong>{profile.title}</strong>
              </div>
              <button type="button" onClick={() => setProfile((current) => {
                const seed = current.titleSeed + 1;
                return { ...current, titleSeed: seed, title: makeBuilderTitle(current.name, current.role, seed) };
              })} aria-label="Reroll builder class"><RefreshCw size={18} /></button>
            </div>

            {mode === "crew" && (
              <div className="crew-editor">
                <div className="crew-editor-head">
                  <div><span className="panel-kicker"><span>02</span> THE CREW</span><p>You’re slot one. Add up to three teammates.</p></div>
                  <button type="button" className="small-add" onClick={addMember}><Plus size={16} /> ADD</button>
                </div>
                <div className="crew-members">
                  {profile.members.map((member, index) => (
                    <div className="member-row" key={member.id}>
                      <button type="button" className={`member-photo ${member.image ? "has-image" : ""}`} onClick={() => memberInputs.current[member.id]?.click()} aria-label={`Upload teammate ${index + 2} photo`}>
                        <input ref={(node) => { memberInputs.current[member.id] = node; }} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" onChange={(event) => changeMemberPhoto(member.id, event)} hidden />
                        {member.image ? <img src={member.image} alt="Teammate" /> : <ImagePlus size={16} />}
                      </button>
                      <input value={member.name} onChange={(event) => updateMember(member.id, { name: event.target.value })} placeholder={`Builder ${index + 2}`} maxLength={28} />
                      <input value={member.role} onChange={(event) => updateMember(member.id, { role: event.target.value })} placeholder="Role" maxLength={30} />
                      <button type="button" className="remove-member" aria-label="Remove teammate" onClick={() => setProfile((current) => ({ ...current, members: current.members.filter((item) => item.id !== member.id) }))}><X size={16} /></button>
                    </div>
                  ))}
                  {profile.members.length === 0 && <button type="button" className="add-crew-empty" onClick={addMember}><UsersRound size={20} /> Add the people you ship with <Plus size={17} /></button>}
                </div>
                <label className="field-label crew-name-field"><span>CREW NAME <i>OPTIONAL</i></span><input value={profile.crewName} onChange={(event) => setProfile((current) => ({ ...current, crewName: event.target.value }))} placeholder="e.g. Deadline Department" maxLength={35} /></label>
              </div>
            )}

            <div className="theme-pick">
              <span>CHOOSE YOUR WEATHER</span>
              <div>
                {THEMES.map((theme) => (
                  <button key={theme.id} type="button" onClick={() => setProfile((current) => ({ ...current, theme: theme.id }))} className={profile.theme === theme.id ? "selected" : ""} aria-pressed={profile.theme === theme.id}>
                    <i>{theme.colors.map((color) => <b key={color} style={{ background: color }} />)}</i>{theme.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="preview-panel" aria-label={`${outputLabel} preview`}>
            <div className="preview-head">
              <span className="panel-kicker"><span>PREVIEW</span> {activeMode.kicker}</span>
              <span className={`live-pill ${profile.image ? "" : "is-waiting"}`}><i /> {profile.image ? "LIVE COMPOSITE" : "AWAITING PHOTO"}</span>
            </div>
            <CanvasPreview
              mode={mode}
              profile={profile}
              onCropChange={(crop) => setProfile((current) => ({ ...current, crop }))}
              onResetCrop={() => setProfile((current) => ({ ...current, crop: DEFAULT_CROP }))}
              isExporting={busy !== null}
            />
            <div className="preview-tools">
              {!profile.image ? <span><ImagePlus size={16} /> UPLOAD A PHOTO TO UNLOCK YOUR LIVE PREVIEW</span> : <>
                {mode === "crew" ? <span><UsersRound size={16} /> YOU + {profile.members.length} CREW {profile.members.length === 1 ? "MATE" : "MATES"}</span> : <span><Move size={16} /> DRAG TO REPOSITION</span>}
                {mode !== "crew" && <span><ZoomIn size={16} /> ZOOM CONTROLS</span>}
              </>}
            </div>
          </section>

          <aside className="output-panel">
            <div className="panel-kicker"><span>03</span> MAKE IT REAL</div>
            <h3>{profile.image ? <>READY TO <em>POST.</em></> : <>ADD A PHOTO<br /><em>TO START.</em></>}</h3>
            <p>{profile.image ? `Your ${outputLabel} is live. Download the full-quality image or open a real X preview.` : "Upload one photo to unlock a full-resolution download and X-ready preview."}</p>
            {!profile.image && <button type="button" className="unlock-button" onClick={() => photoInput.current?.click()}><ImagePlus size={17} /> ADD A PHOTO TO UNLOCK</button>}
            <button type="button" className="download-button" onClick={download} disabled={busy !== null || !profile.image}>
              {busy === "download" ? <LoaderCircle className="spin" size={19} /> : <ArrowDownToLine size={19} />} DOWNLOAD IMAGE
            </button>
            <button type="button" className="share-button" onClick={shareToX} disabled={busy !== null || !profile.image}>
              {busy === "share" ? <LoaderCircle className="spin" size={19} /> : <Send size={18} />} SHARE TO X <span>↗</span>
            </button>
            <div className="output-divider" />
            <div className="share-note"><Sparkles size={17} /><span><strong>One tap, proper preview.</strong> We generate a unique public preview only when you choose Share, so X shows your actual graphic.</span></div>
            <div className="submission-checklist">
              <span>SUBMISSION CHECK</span>
              <p><Check size={15} /> Download your result</p>
              <p><Check size={15} /> Post it with <b>#FrameInGoa</b></p>
              <p><Check size={15} /> Add a quick “make yours” line</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="shell how-inner">
          <div><p className="eyebrow">YOUR 30-SECOND RITUAL</p><h2>ONE PHOTO.<br /><em>ALL SIGNAL.</em></h2></div>
          <ol>
            <li><span>01</span><div><strong>Drop a photo.</strong><p>JPG, PNG, or right from your iPhone. No crop prep.</p></div></li>
            <li><span>02</span><div><strong>Claim your class.</strong><p>We turn your stack into a builder identity worth posting.</p></div></li>
            <li><span>03</span><div><strong>Make noise.</strong><p>Download it or share the real card to X with #FrameInGoa.</p></div></li>
          </ol>
        </div>
      </section>

      <footer className="footer shell">
        <img src="/brand/hh-goa-lockup.svg" alt="Hacker House Goa" />
        <p>HACKER HOUSE GOA / 2026<br />LESS NOISE. MORE SIGNAL.</p>
        <p>MADE FOR THE OPEN TRIAL<br />#FRAMEINGOA</p>
      </footer>

      <AnimatePresence>
        {toast && (
          <motion.div className={`toast toast-${toast.type}`} initial={{ opacity: 0, y: 24, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: .96 }}>
            {toast.type === "success" ? <Check size={17} /> : toast.type === "error" ? <X size={17} /> : <WandSparkles size={17} />} {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
