import type { Editor } from "grapesjs";

const HERO_TYPE = "oerc-homepage-hero";
const HERO_BLOCK_ID = "homepage-hero";
const HERO_CATEGORY_ID = "homepage-hero-category";
const HERO_CATEGORY_LABEL = "Homepage Hero";
const HERO_BG_TYPE = "oerc-homepage-hero-bg";

const HERO_FORM_TYPE = "oerc-homepage-hero-form";
const HERO_FORM_BLOCK_ID = "homepage-hero-form";

const HERO_MEDIA = `
<svg width="54" height="38" viewBox="0 0 54 38" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b1d2e"/>
      <stop offset="1" stop-color="#123b5a"/>
    </linearGradient>
  </defs>
  <rect x="1" y="1" width="52" height="36" rx="4" fill="url(#g)" stroke="rgba(255,255,255,.35)"/>
  <rect x="9" y="9" width="36" height="5" rx="2.5" fill="rgba(255,255,255,.95)"/>
  <rect x="14" y="17" width="26" height="3" rx="1.5" fill="rgba(255,255,255,.7)"/>
  <rect x="6" y="24" width="30" height="8" rx="2" fill="rgba(255,255,255,.95)"/>
  <rect x="38" y="24" width="10" height="8" rx="2" fill="#0a7a40"/>
</svg>
`;

const HERO_FORM_MEDIA = `
<svg width="54" height="38" viewBox="0 0 54 38" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="52" height="36" rx="4" fill="#ffffff" stroke="rgba(0,0,0,.25)"/>
  <rect x="7" y="10" width="22" height="6" rx="2" fill="rgba(0,0,0,.12)"/>
  <rect x="31" y="10" width="16" height="6" rx="2" fill="rgba(0,0,0,.12)"/>
  <rect x="7" y="20" width="16" height="6" rx="2" fill="rgba(0,0,0,.12)"/>
  <rect x="25" y="20" width="16" height="6" rx="2" fill="rgba(0,0,0,.12)"/>
  <rect x="43" y="20" width="4" height="6" rx="2" fill="#0a7a40"/>
</svg>
`;

const px = (v: unknown, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? `${n}px` : `${fallback}px`;
};

const HOMEPAGE_HERO_BASE_CSS_MARKER = "/* oerc-homepage-hero-base */";
const HOMEPAGE_HERO_BASE_CSS = `
${HOMEPAGE_HERO_BASE_CSS_MARKER}
.oerc-homepage-hero,
.oerc-homepage-hero * {
  font-family: var(--font-family-main, inherit) !important;
}
.oerc-homepage-hero .oerc-hero-btn{
  background-color: var(--button-primary-color, #3a853a) !important;
  border: 1px solid var(--button-primary-color, #3a853a) !important;
  color: #fff !important;
}
.oerc-homepage-hero .oerc-hero-btn:hover{
  background-color: var(--button-primary-color-hover, var(--button-primary-color, #3a853a)) !important;
  border-color: var(--button-primary-color-hover, var(--button-primary-color, #3a853a)) !important;
}
`.trim();

export const homepageHeroBlocks = (editor: Editor) => {
  const bm = editor.BlockManager;
  const dc = editor.DomComponents;
  const CMD_SELECT_HERO_BG = "oerc:select-hero-bg";

  const ensureHeroBaseCss = () => {
    try {
      const wrapper: any = editor.getWrapper?.();
      const hasHero = !!wrapper?.find?.(".oerc-homepage-hero")?.length;
      if (!hasHero) return;

      const css = (editor.getCss?.() || "") as string;
      if (css.includes(HOMEPAGE_HERO_BASE_CSS_MARKER)) return;

      editor.addStyle(HOMEPAGE_HERO_BASE_CSS);
    } catch {
      // noop
    }
  };

  editor.on("load", ensureHeroBaseCss);
  editor.on("component:add", (model: any) => {
    const cls = String(model?.getAttributes?.()?.class || "");
    if (cls.includes("oerc-homepage-hero")) {
      ensureHeroBaseCss();
    }
  });

  bm.getCategories().add({
    id: HERO_CATEGORY_ID,
    label: HERO_CATEGORY_LABEL,
    open: true,
    order: -1000,
  } as any);

  // --- BLOCK
  bm.add(HERO_BLOCK_ID, {
    label: "Homepage Hero block",
    media: HERO_MEDIA,
    category: HERO_CATEGORY_ID,
    order: -1000,
    content: { type: HERO_TYPE },
  } as any);

  bm.add(HERO_FORM_BLOCK_ID, {
    label: "Search form",
    media: HERO_FORM_MEDIA,
    category: HERO_CATEGORY_ID,
    order: -990,
    content: { type: HERO_FORM_TYPE },
  } as any);

  let bgPickerLock = false;

  const openBgPicker = (bg: any) => {
    if (!bg || bgPickerLock) return;
    bgPickerLock = true;

    const am: any = editor.AssetManager;
    am.open({
      select: (asset: any, complete: boolean) => {
        const url = asset.getSrc();
        bg.addStyle({ "background-image": `url("${url}")` });
        if (complete) am.close?.();
      },
    });

    const modal: any = (editor as any).Modal;
    if (modal?.once) modal.once("close", () => (bgPickerLock = false));
    else setTimeout(() => (bgPickerLock = false), 500);
  };

  const ensureHeroBg = (hero: any) => {
    const existing =
      hero?.findType?.(HERO_BG_TYPE)?.[0] || hero?.find?.(".oerc-hero-bg")?.[0];

    if (existing) return { bg: existing, created: false };

    const createdBg = hero.components().add({ type: HERO_BG_TYPE }, { at: 0 });
    return { bg: createdBg, created: true };
  };

  editor.Commands.add(CMD_SELECT_HERO_BG, {
    run() {
      const sel: any = editor.getSelected?.();
      let hero: any = sel;
      while (hero && hero.get?.("type") !== HERO_TYPE) {
        hero = hero.parent?.();
      }
      if (!hero) return;

      const { bg } = ensureHeroBg(hero);
      if (bg) editor.select(bg);
    },
  });

  editor.on("component:selected", (model: any) => {
    const type = model?.get?.("type");

    if (type === HERO_BG_TYPE) {
      openBgPicker(model);
      return;
    }

    if (type === HERO_TYPE) {
      const tb = model.get?.("toolbar") || [];
      const exists = tb.some((i: any) => i?.command === CMD_SELECT_HERO_BG);

      if (!exists) {
        const item = {
          id: "tlb-bgimage",
          command: CMD_SELECT_HERO_BG,
          label:
            '<svg viewBox="0 0 24 24">' +
            '<path fill="currentColor" d="M21,19V5A2,2 0 0,0 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19M8.5,13.5L11,16.5L14.5,12L19,18H5L8.5,13.5Z"></path>' +
            "</svg>",
          attributes: { title: "Edit background image" },
        };

        const deleteIdx = tb.findIndex(
          (i: any) =>
            i?.id === "tlb-delete" ||
            i?.command === "tlb-delete" ||
            i?.command === "core:component-delete"
        );

        const idx = deleteIdx >= 0 ? deleteIdx : Math.max(tb.length - 1, 0);
        model.set("toolbar", [...tb.slice(0, idx), item, ...tb.slice(idx)]);
      }

      const { bg, created } = ensureHeroBg(model);
      if (created && bg) editor.select(bg);
    }
  });

  // --- COMPONENT
  dc.addType(HERO_BG_TYPE, {
    model: {
      defaults: {
        name: "Background image",
        tagName: "div",
        attributes: { class: "oerc-hero-bg" },

        draggable: false,
        droppable: false,

        style: {
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          "background-size": "cover",
          "background-position": "center",
          "background-repeat": "no-repeat",
          "z-index": "0",
        },
      },
    },
  });

  dc.addType(HERO_TYPE, {
    model: {
      defaults: {
        name: "Homepage Hero",
        tagName: "section",
        attributes: { class: "oerc-homepage-hero" },
        heroHeight: 520,
        heroBgColor: "#0b1d2e",
        traits: [
          {
            type: "number",
            name: "heroHeight",
            label: "Height (px)",
            placeholder: "520",
            changeProp: true,
            min: 200,
          },
          {
            type: "color",
            name: "heroBgColor",
            label: "Background",
            changeProp: true,
          },
        ],
        style: {
          width: "100%",
          "min-height": "520px",
          "background-color": "#0b1d2e",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
          "text-align": "center",
          padding: "60px 20px",
          "box-sizing": "border-box",
        },
        components: [
          { type: HERO_BG_TYPE },
          {
            tagName: "div",
            attributes: { class: "oerc-hero-inner" },
            style: {
              width: "100%",
              margin: "0 auto",
              position: "relative",
              "z-index": "1",
              "background-color": "transparent !important",
            },
            components: [
              {
                tagName: "h1",
                content: "Explore. Create. Collaborate.",
                type: "text",
                style: {
                  color: "#ffffff",
                  "font-size": "64px",
                  "font-weight": "700",
                  "line-height": "1.1",
                  margin: "0 0 18px 0",
                  "font-family":
                    "var(--font-family-main, 'Open Sans', sans-serif)",
                },
              },
              {
                tagName: "p",
                type: "text",
                content:
                  "OER Commons is a public digital library of open educational resources. Explore, create, and collaborate with educators around the world to improve curriculum.",
                style: {
                  color: "#cfd8dc",
                  "font-size": "16px",
                  "line-height": "1.6",
                  margin: "0 auto 30px auto",
                  "max-width": "900px",
                },
              },

              { type: HERO_FORM_TYPE },

              // advanced search line
              {
                tagName: "div",
                attributes: { class: "advanced-search-call-out" },
                style: {
                  "margin-top": "12px",
                  color: "rgba(255,255,255,0.9)",
                  "font-size": "13px",
                  "line-height": "1.3",
                },
                components: [
                  {
                    type: "text",
                    tagName: "div",
                    content:
                      'Fine tune your search with our <a href="/advanced-search" style="color:#fff;text-decoration:underline;">advanced search</a>.',
                    style: { display: "block" },
                  },
                ],
              },
            ],
          },
        ],
      },

      init(this: any) {
        const syncFromStyle = () => {
          const st = this.getStyle?.() || {};
          const bg = st["background-color"];
          if (bg && bg !== this.get("heroBgColor")) {
            this.set("heroBgColor", bg, { silent: true });
          }

          const mh = st["min-height"];
          const n = parseInt(String(mh || ""), 10);
          if (!Number.isNaN(n) && n !== this.get("heroHeight")) {
            this.set("heroHeight", n, { silent: true });
          }
        };

        const apply = () => {
          const h = px(this.get("heroHeight"), 520);
          const bg = this.get("heroBgColor") || "#0b1d2e";
          this.addStyle({
            "min-height": h,
            "background-color": bg,
          });
        };

        syncFromStyle();
        this.on("change:style", syncFromStyle);
        this.on("change:heroHeight change:heroBgColor", apply);
        apply();
      },
    },
  });

  dc.addType(HERO_FORM_TYPE, {
    model: {
      defaults: {
        name: "Search form",
        tagName: "form",
        attributes: {
          action: "/search",
          method: "GET",
          class: "oerc-hero-search-form",
        },

        draggable: ".oerc-homepage-hero .oerc-hero-inner",
        droppable: false,

        style: {
          display: "flex",
          "justify-content": "center",
          "align-items": "center",
          gap: "12px",
          "flex-wrap": "wrap",
          margin: "0 auto",
        },

        components: [
          // hidden search_source=homepage
          {
            tagName: "input",
            attributes: {
              type: "hidden",
              name: "search_source",
              value: "homepage",
            },
            selectable: false,
            draggable: false,
            copyable: false,
            removable: false,
          },

          // text query
          {
            tagName: "input",
            attributes: {
              type: "text",
              name: "f.search",
              placeholder: "What are you looking for?",
              class: "oerc-hero-q",
            },
            style: {
              width: "260px",
              height: "44px",
              padding: "10px 12px",
              "border-radius": "2px",
              border: "1px solid rgba(0,0,0,0.25)",
              "font-size": "14px",
              outline: "none",
            },
          },

          // Subject select (placeholder only)
          {
            tagName: "select",
            attributes: {
              name: "f.general_subject",
              "aria-label": "Subject",
              class: "oerc-hero-select",
            },
            style: {
              width: "180px",
              height: "44px",
              padding: "10px 12px",
              "border-radius": "2px",
              border: "1px solid rgba(0,0,0,0.25)",
              "font-size": "14px",
              background: "#fff",
            },
            components: [
              {
                tagName: "option",
                content: "Subject",
                attributes: { value: "" },
                removable: false,
                draggable: false,
                copyable: false,
                selectable: false,
              },
            ],
          },

          // Education Level select (placeholder only)
          {
            tagName: "select",
            attributes: {
              name: "f.sublevel",
              "aria-label": "Education Level",
              class: "oerc-hero-select",
            },
            style: {
              width: "220px",
              height: "44px",
              padding: "10px 12px",
              "border-radius": "2px",
              border: "1px solid rgba(0,0,0,0.25)",
              "font-size": "14px",
              background: "#fff",
            },
            components: [
              {
                tagName: "option",
                content: "Education Level",
                attributes: { value: "" },
                removable: false,
                draggable: false,
                copyable: false,
                selectable: false,
              },
            ],
          },

          // Standards select (placeholder only)
          {
            tagName: "select",
            attributes: {
              name: "f.alignment_standard",
              "aria-label": "Standards",
              class: "oerc-hero-select js-standards-select",
            },
            style: {
              width: "220px",
              height: "44px",
              padding: "10px 12px",
              "border-radius": "2px",
              border: "0",
              "min-width": "200px",
            },
            components: [
              {
                tagName: "option",
                attributes: { value: "" },
                content: "Standards",
                selectable: false,
                draggable: false,
                copyable: false,
                removable: false,
              },
            ],
          },

          // Search button
          {
            tagName: "button",
            attributes: {
              type: "submit",
              class: "oerc-hero-btn",
            },
            content: "Search",
            style: {
              width: "180px",
              height: "44px",
              border: "0",
              "border-radius": "2px",
              background: "#0d6b2e",
              color: "#fff",
              "font-weight": "700",
              "font-size": "14px",
              cursor: "pointer",
            },
          },
        ],
      },
    },
  });

  if (!(editor as any).__oercHomepageHeroThemeCssAdded) {
    (editor as any).__oercHomepageHeroThemeCssAdded = true;

    editor.addStyle(`
    .oerc-homepage-hero, .oerc-homepage-hero * {
      font-family: var(--font-family-main, inherit) !important;
    }

    .oerc-homepage-hero { padding: 0 !important; }
    .oerc-homepage-hero .oerc-hero-inner {
      padding: 130px 70px 100px;
      background-color: rgba(0, 0, 0, 0.25);
    }
    @media (max-width: 991px) {
      .oerc-homepage-hero .oerc-hero-inner { padding: 20px; }
    }
    @media (min-width: 992px) and (max-width: 1199px) {
      .oerc-homepage-hero .oerc-hero-inner { padding: 100px 30px 70px; }
    }

    .oerc-homepage-hero .oerc-hero-btn,
    .oerc-homepage-hero .oerc-hero-btn:disabled {
      background: var(--button-primary-color, #3a853a) !important;
      border-color: var(--button-primary-color, #3a853a) !important;
      opacity: 1 !important;
    }

    .oerc-homepage-hero .oerc-hero-btn:hover:not(:disabled) {
      background: var(--button-primary-color-hover, var(--button-primary-color, #3a853a)) !important;
    }
  `);
  }
};
