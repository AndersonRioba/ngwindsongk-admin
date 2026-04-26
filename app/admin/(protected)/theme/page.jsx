"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTheme } from "@/app/context/ThemeContext";
import { load } from "@/app/lib/storage";

const COLOR_FIELDS = [
  { key: "primary_color",    label: "Primary",    cssVar: "--color-primary"    },
  { key: "secondary_color",  label: "Secondary",  cssVar: "--color-secondary"  },
  { key: "accent_color",     label: "Accent",     cssVar: "--color-accent"     },
  { key: "background_color", label: "Background", cssVar: "--color-background" },
  { key: "text_color",       label: "Text",       cssVar: "--color-text"       },
  { key: "success_color",    label: "Success",    cssVar: "--color-success"    },
  { key: "warning_color",    label: "Warning",    cssVar: "--color-warning"    },
  { key: "error_color",      label: "Error",      cssVar: "--color-error"      },
];

export default function ThemePage() {
  const { theme, refreshTheme, applyVariables } = useTheme();
  const [themes, setThemes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const token = load("adminToken") || load("token");
  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  }), [token]);

  const fetchThemes = useCallback(async () => {
    const res = await fetch(`${baseUrl}/v1/admin/themes`, { headers });
    const { data } = await res.json();
    setThemes(data || []);
  }, [baseUrl, headers]);

  useEffect(() => { fetchThemes(); }, [fetchThemes]);

  function startEditing(t) {
    setEditing({ ...t });
    setFeedback("");
  }

  function handleColorChange(key, value) {
    setEditing(prev => ({ ...prev, [key]: value }));
    // Live preview — apply CSS var immediately
    const field = COLOR_FIELDS.find(f => f.key === key);
    if (field) document.documentElement.style.setProperty(field.cssVar, value);
  }

  async function saveTheme() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`${baseUrl}/v1/admin/themes/${editing.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(editing),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback("✅ Theme saved successfully");
        await fetchThemes();
        await refreshTheme();
      } else {
        setFeedback("❌ " + (json.message || "Save failed"));
      }
    } finally {
      setSaving(false);
    }
  }

  async function activateTheme(id) {
    const res = await fetch(`${baseUrl}/v1/admin/themes/${id}/activate`, {
      method: "PUT",
      headers,
    });
    const json = await res.json();
    if (json.success) {
      setFeedback(`✅ ${json.data?.name || "Theme"} is now active`);
      await fetchThemes();
      await refreshTheme();
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Theme Settings</h1>
      <p className="text-gray-500 text-sm mb-8">
        Changes apply in real-time across admin and shop. No redeployment needed.
      </p>

      {feedback && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-gray-100 text-sm font-medium text-gray-700">
          {feedback}
        </div>
      )}

      {/* Theme List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {themes.map(t => (
          <div
            key={t.id}
            className={`rounded-2xl border-2 p-5 cursor-pointer transition-all ${
              t.is_active
                ? "border-primary shadow-lg shadow-primary/10"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {/* Color preview strip */}
            <div className="flex gap-1 mb-4 rounded-lg overflow-hidden h-8">
              {[t.primary_color, t.secondary_color, t.accent_color, t.background_color].map((c, i) => (
                <div key={i} className="flex-1" style={{ background: c }} />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{t.name}</p>
                {t.is_active && (
                  <span className="text-xs text-primary font-medium">● Active</span>
                )}
              </div>
              <div className="flex gap-2">
                {!t.is_active && (
                  <button
                    onClick={() => activateTheme(t.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition"
                  >
                    Activate
                  </button>
                )}
                <button
                  onClick={() => startEditing(t)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inline editor */}
      {editing && (
        <div className="rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Editing: <span className="text-primary">{editing.name}</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            {COLOR_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-500 mb-2">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editing[key] || "#000000"}
                    onChange={e => handleColorChange(key, e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 !block"
                    style={{ display: "block" }}
                  />
                  <span className="text-xs text-gray-400 font-mono">{editing[key]}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Font family */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-500 mb-2">Font Family</label>
            <input
              type="text"
              value={editing.font_family || ""}
              onChange={e => setEditing(prev => ({ ...prev, font_family: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 !block"
              style={{ display: "block" }}
              placeholder="e.g. 'Inter', sans-serif"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => { setEditing(null); refreshTheme(); }}
              className="px-5 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={saveTheme}
              disabled={saving}
              className="px-5 py-2 text-sm rounded-lg bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50 transition"
            >
              {saving ? "Saving…" : "Save Theme"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
