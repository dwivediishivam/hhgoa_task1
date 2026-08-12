"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, RotateCcw } from "lucide-react";
import type { BuilderProfile, Crop, StudioMode } from "@/lib/types";
import { clampCrop } from "@/lib/image";
import { outputDimensions, renderGraphic } from "@/lib/render";

type CanvasPreviewProps = {
  mode: StudioMode;
  profile: BuilderProfile;
  onCropChange: (crop: Crop) => void;
  onResetCrop: () => void;
  isExporting?: boolean;
};

const ASPECT: Record<StudioMode, string> = {
  id: "4 / 5",
  pfp: "1 / 1",
  crew: "4 / 3",
};

export function CanvasPreview({ mode, profile, onCropChange, onResetCrop, isExporting = false }: CanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ startX: number; startY: number; crop: Crop } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRendering, setIsRendering] = useState(true);
  const deferredProfile = useDeferredValue(profile);

  const previewSize = useMemo(() => {
    const source = outputDimensions(mode);
    const max = mode === "pfp" ? 920 : 1000;
    const scale = Math.min(1, max / Math.max(source.width, source.height));
    return { width: Math.round(source.width * scale), height: Math.round(source.height * scale) };
  }, [mode]);

  useEffect(() => {
    let disposed = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsRendering(true);
    const paint = async () => {
      try {
        if ("fonts" in document) await document.fonts.ready;
        await renderGraphic(canvas, mode, deferredProfile, previewSize);
      } finally {
        if (!disposed) setIsRendering(false);
      }
    };
    void paint();
    return () => {
      disposed = true;
    };
  }, [deferredProfile, mode, previewSize]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (mode === "crew" || !profile.image) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, startY: event.clientY, crop: profile.crop };
    setIsDragging(true);
  }, [mode, profile.crop, profile.image]);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const multiplier = mode === "pfp" ? 1.55 : 1.15;
    onCropChange(clampCrop({
      ...drag.current.crop,
      x: drag.current.crop.x + ((event.clientX - drag.current.startX) / rect.width) * multiplier,
      y: drag.current.crop.y + ((event.clientY - drag.current.startY) / rect.height) * multiplier,
    }));
  }, [mode, onCropChange]);

  const stopDragging = useCallback(() => {
    drag.current = null;
    setIsDragging(false);
  }, []);

  const onWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    if (mode === "crew" || !profile.image) return;
    event.preventDefault();
    onCropChange(clampCrop({ ...profile.crop, zoom: profile.crop.zoom + (event.deltaY < 0 ? 0.07 : -0.07) }));
  }, [mode, onCropChange, profile.crop, profile.image]);

  const adjustZoom = useCallback((amount: number) => {
    if (!profile.image || mode === "crew") return;
    onCropChange(clampCrop({ ...profile.crop, zoom: profile.crop.zoom + amount }));
  }, [mode, onCropChange, profile.crop, profile.image]);

  return (
    <div className="preview-shell">
      <motion.div
        className={`preview-frame mode-${mode} ${profile.image && mode !== "crew" ? "is-crop-ready" : ""} ${isDragging ? "is-dragging" : ""}`}
        style={{ aspectRatio: ASPECT[mode] }}
        animate={{ rotate: isDragging ? 0 : mode === "id" ? -0.6 : 0, y: isDragging ? -2 : 0 }}
        transition={{ type: "spring", stiffness: 250, damping: 24 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onWheel={onWheel}
        role={mode === "crew" || !profile.image ? undefined : "application"}
        aria-label={mode === "crew" || !profile.image ? undefined : "Drag to reposition your photo. Use the zoom controls to adjust it."}
      >
        <canvas ref={canvasRef} />
        {mode === "pfp" && <div className="circle-safe-zone" aria-hidden="true" />}
        {mode === "id" && <div className="photo-safe-zone" aria-hidden="true" />}
        {!profile.image && (
          <div className="preview-empty" aria-hidden="true">
            <span>01</span>
            <strong>ADD A PHOTO<br />TO BEGIN</strong>
            <small>Your card develops here.</small>
          </div>
        )}
        {mode !== "crew" && profile.image && (
          <div className="crop-tip" aria-hidden="true">
            <span>↔</span> DRAG TO REPOSITION
          </div>
        )}
        {(isRendering || isExporting) && <div className="preview-loading" aria-live="polite"><span className="spinner" /> {isExporting ? "EXPORTING" : "COMPOSING"}</div>}
      </motion.div>
      {mode !== "crew" && profile.image && (
        <div className="crop-controls" aria-label="Photo position controls">
          <span>FRAME PHOTO</span>
          <div>
            <button type="button" aria-label="Zoom out" onClick={() => adjustZoom(-0.1)}><Minus size={14} /></button>
            <button type="button" className="crop-reset" onClick={onResetCrop}><RotateCcw size={13} /> RESET</button>
            <button type="button" aria-label="Zoom in" onClick={() => adjustZoom(0.1)}><Plus size={14} /></button>
          </div>
        </div>
      )}
      <div className="preview-shadow" aria-hidden="true" />
    </div>
  );
}
