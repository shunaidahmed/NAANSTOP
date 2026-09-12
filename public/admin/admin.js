/* NAAN STOP — Site Manager.
   Plain JS on purpose: the panel must keep working even if the React app's
   build breaks. Talks to /api/cms and nothing else. */
(() => {
  "use strict";

  /* ── tiny DOM helper ─────────────────────────────────────── */
  const h = (tag, attrs, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k.startsWith("on")) el[k.toLowerCase()] = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) {
      if (kid === null || kid === undefined || kid === false) continue;
      el.append(kid.nodeType ? kid : document.createTextNode(kid));
    }
    return el;
  };
  const $ = (id) => document.getElementById(id);

  const toast = (msg, kind) => {
    const box = h("div", { class: kind || "" }, msg);
    $("toast").append(box);
    setTimeout(() => box.remove(), 4200);
  };

  /* ── api ─────────────────────────────────────────────────── */
  async function api(action, body) {
    const res = await fetch("/api/cms", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, ...(body || {}) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  /* ── state ───────────────────────────────────────────────── */
  let DEFAULTS = null; // shipped copy, the structural source of truth
  let content = null; // what we are editing
  let savedJson = ""; // content as last written to the draft
  let current = "menu";

  const merge = (base, over) => {
    if (over === undefined || over === null) return base;
    if (Array.isArray(over) || typeof over !== "object") return over;
    if (typeof base !== "object" || base === null || Array.isArray(base)) return over;
    const out = { ...base };
    for (const k of Object.keys(over)) out[k] = merge(out[k], over[k]);
    return out;
  };
  const clone = (v) => JSON.parse(JSON.stringify(v));

  const isDirty = () => JSON.stringify(content) !== savedJson;
  function touched() {
    $("savebar").hidden = !isDirty();
  }

  /* ── shared field builders ───────────────────────────────── */
  function field(label, obj, key, opts = {}) {
    const val = obj[key] == null ? "" : String(obj[key]);
    let input;
    if (opts.options) {
      input = h(
        "select",
        {},
        ...opts.options.map((o) =>
          h("option", { value: o.value, selected: o.value === val || null }, o.label)
        )
      );
    } else if (opts.rows) {
      input = h("textarea", { class: opts.rows > 4 ? "tall" : "" }, val);
    } else {
      input = h("input", {
        type: opts.type || "text",
        value: val,
        placeholder: opts.placeholder || "",
        step: opts.number ? "0.01" : null,
        min: opts.number ? "0" : null,
        inputmode: opts.number ? "decimal" : null,
      });
    }
    input.oninput = () => {
      obj[key] = opts.number ? (input.value === "" ? 0 : Number(input.value)) : input.value;
      if (opts.onchange) opts.onchange(input.value);
      touched();
    };
    return h(
      "label",
      { class: opts.span ? "f span" : "f" },
      h("span", { class: "lbl" }, label),
      input,
      opts.hint ? h("div", { class: "hint" }, opts.hint) : null
    );
  }

  function checkbox(label, obj, key) {
    const input = h("input", { type: "checkbox", checked: obj[key] ? true : null });
    input.onchange = () => {
      obj[key] = input.checked;
      touched();
    };
    return h("label", { class: "chk" }, input, h("span", {}, label));
  }

  function iconBtn(glyph, title, onclick, extra) {
    return h("button", { type: "button", class: `iconbtn ${extra || ""}`, title, "aria-label": title, onclick }, glyph);
  }

  /**
   * Add / reorder / duplicate / delete for an array of objects.
   * `body(item, index)` returns the editor for one entry.
   */
  function listEditor(arr, { blank, title, body, addLabel }) {
    const host = h("div", {});
    const draw = () => {
      host.textContent = "";
      arr.forEach((item, i) => {
        host.append(
          h(
            "div",
            { class: "card" },
            h(
              "div",
              { class: "card__hd" },
              h("span", { class: "card__n" }, String(i + 1)),
              h("h3", {}, title(item, i)),
              h(
                "div",
                { class: "card__act" },
                iconBtn("↑", "Move up", () => {
                  if (i === 0) return;
                  [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                  draw();
                  touched();
                }),
                iconBtn("↓", "Move down", () => {
                  if (i === arr.length - 1) return;
                  [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
                  draw();
                  touched();
                }),
                iconBtn("⧉", "Duplicate", () => {
                  arr.splice(i + 1, 0, clone(item));
                  draw();
                  touched();
                }),
                iconBtn(
                  "✕",
                  "Delete",
                  () => {
                    if (!confirm("Delete this entry? This cannot be undone once you publish.")) return;
                    arr.splice(i, 1);
                    draw();
                    touched();
                  },
                  "del"
                )
              )
            ),
            body(item, i, draw)
          )
        );
      });
      host.append(
        h(
          "button",
          {
            type: "button",
            class: "btn btn--l btn--sm",
            onclick: () => {
              arr.push(clone(blank));
              draw();
              touched();
            },
          },
          addLabel || "+ Add"
        )
      );
    };
    draw();
    return host;
  }

  /** Editable list of plain strings (features, marquee words, bullet lists). */
  function lineList(arr, onchange) {
    const host = h("div", {});
    const draw = () => {
      host.textContent = "";
      arr.forEach((value, i) => {
        const input = h("input", { type: "text", value });
        input.oninput = () => {
          arr[i] = input.value;
          onchange();
        };
        host.append(
          h(
            "div",
            { class: "linerow" },
            input,
            iconBtn("↑", "Move up", () => {
              if (i === 0) return;
              [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
              draw();
              onchange();
            }),
            iconBtn("↓", "Move down", () => {
              if (i === arr.length - 1) return;
              [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
              draw();
              onchange();
            }),
            iconBtn("✕", "Delete", () => {
              arr.splice(i, 1);
              draw();
              onchange();
            }, "del")
          )
        );
      });
      host.append(
        h(
          "button",
          {
            type: "button",
            class: "btn btn--l btn--sm",
            onclick: () => {
              arr.push("");
              draw();
              onchange();
            },
          },
          "+ Add line"
        )
      );
    };
    draw();
    return host;
  }

  /* ── images ──────────────────────────────────────────────── */
  const MAX_EDGE = 1600;

  /** Downscale in the browser so uploads stay inside Vercel's 4.5 MB body limit
   *  — and so the site never serves a 6 MB phone photo. SVGs pass through. */
  function shrink(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Could not read that file"));
      reader.onload = () => {
        const dataUrl = String(reader.result);
        if (file.type === "image/svg+xml" || file.type === "image/gif") return resolve(dataUrl);
        const img = new Image();
        img.onerror = () => reject(new Error("That file is not an image"));
        img.onload = () => {
          const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
          if (scale === 1 && dataUrl.length < 3_000_000) return resolve(dataUrl);
          const canvas = h("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.86));
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  }

  async function uploadFile(file) {
    const data = await shrink(file);
    const res = await api("upload", { data, name: file.name.replace(/\.[^.]+$/, "") });
    return res.url;
  }

  function imageField(label, obj, key) {
    const preview = h("div", { class: "imgf__prev" });
    const input = h("input", { type: "text", value: obj[key] || "", placeholder: "https://… or upload" });
    const file = h("input", { type: "file", accept: "image/*", style: "display:none" });

    const paint = () => {
      preview.textContent = "";
      if (obj[key]) preview.append(h("img", { src: obj[key], alt: "", style: "width:100%;height:100%;object-fit:cover" }));
      else preview.append("No image");
    };
    input.oninput = () => {
      obj[key] = input.value;
      paint();
      touched();
    };
    file.onchange = async () => {
      if (!file.files[0]) return;
      try {
        toast("Uploading…");
        const url = await uploadFile(file.files[0]);
        obj[key] = url;
        input.value = url;
        paint();
        touched();
        toast("Uploaded", "ok");
      } catch (err) {
        toast(err.message, "err");
      }
      file.value = "";
    };
    paint();

    return h(
      "div",
      { class: "f" },
      h("span", { class: "lbl" }, label),
      h(
        "div",
        { class: "imgf" },
        preview,
        h(
          "div",
          { class: "imgf__body" },
          input,
          h(
            "div",
            { class: "imgf__row" },
            h("button", { type: "button", class: "btn btn--l btn--sm", onclick: () => file.click() }, "Upload"),
            h(
              "button",
              {
                type: "button",
                class: "btn btn--l btn--sm",
                onclick: () =>
                  pickFromLibrary((url) => {
                    obj[key] = url;
                    input.value = url;
                    paint();
                    touched();
                  }),
              },
              "Library"
            ),
            obj[key]
              ? h(
                  "button",
                  {
                    type: "button",
                    class: "btn btn--l btn--sm",
                    onclick: () => {
                      obj[key] = "";
                      input.value = "";
                      paint();
                      touched();
                    },
                  },
                  "Clear"
                )
              : null
          ),
          file
        )
      )
    );
  }

  async function pickFromLibrary(onPick) {
    let files = [];
    try {
      files = (await api("media")).files;
    } catch (err) {
      return toast(err.message, "err");
    }
    if (!files.length) return toast("Nothing in the library yet — upload an image first.");

    const scrim = h("div", { class: "modal__scrim" });
    const grid = h(
      "div",
      { class: "media" },
      ...files.map((f) =>
        h(
          "figure",
          { style: "cursor:pointer", onclick: () => { onPick(f.url); modal.remove(); } },
          h("img", { src: f.url, alt: f.name, loading: "lazy" }),
          h("figcaption", {}, f.name)
        )
      )
    );
    const modal = h(
      "div",
      { class: "modal" },
      scrim,
      h(
        "div",
        { class: "modal__box" },
        h(
          "div",
          { class: "modal__hd" },
          h("h3", {}, "Choose an image"),
          h("button", { type: "button", class: "iconbtn modal__x", onclick: () => modal.remove() }, "✕")
        ),
        grid
      )
    );
    scrim.onclick = () => modal.remove();
    document.body.append(modal);
  }

  /* ── sections ────────────────────────────────────────────── */
  const head = (title, blurb, ...actions) =>
    h(
      "div",
      { class: "head" },
      h("div", {}, h("h2", {}, title), blurb ? h("p", {}, blurb) : null),
      actions.length ? h("div", { class: "head__act" }, ...actions) : null
    );

  const TAGS = [
    { value: "", label: "No badge" },
    { value: "Bestseller", label: "Bestseller" },
    { value: "Spicy", label: "Spicy" },
    { value: "New", label: "New" },
  ];

  function sectionMenu() {
    const blankItem = {
      name: "New dish",
      nameEs: "Plato nuevo",
      desc: "",
      descEs: "",
      price: "0",
      tag: "",
      tagEs: { Bestseller: "Más Vendido", Spicy: "Picante", New: "Nuevo" },
      img: "",
    };
    return h(
      "div",
      {},
      head(
        "Menu",
        "Categories, dishes, prices and photos. Every field has an English and a Spanish version — the site shows whichever language the visitor picked."
      ),
      listEditor(content.menu, {
        blank: { id: "new-category", label: "New category", labelEs: "Categoría nueva", items: [clone(blankItem)] },
        addLabel: "+ Add category",
        title: (c) => c.label || "Untitled category",
        body: (category) =>
          h(
            "div",
            {},
            h(
              "div",
              { class: "grid2" },
              field("Name (English)", category, "label"),
              field("Name (Spanish)", category, "labelEs"),
              field("Filter id", category, "id", {
                hint: "Lowercase, no spaces. Used by the menu filter buttons.",
              })
            ),
            h(
              "div",
              { class: "sub" },
              h("div", { class: "sub__hd" }, h("span", { class: "lbl" }, `Dishes — ${category.items.length}`)),
              listEditor(category.items, {
                blank: blankItem,
                addLabel: "+ Add dish",
                title: (i) => i.name || "Untitled dish",
                body: (item) =>
                  h(
                    "div",
                    { class: "grid2" },
                    field("Name (English)", item, "name"),
                    field("Name (Spanish)", item, "nameEs"),
                    field("Description (English)", item, "desc", { rows: 3, span: true }),
                    field("Description (Spanish)", item, "descEs", { rows: 3, span: true }),
                    field("Price", item, "price", {
                      type: "number",
                      number: true,
                      hint: "Numbers only. Used when the dish has no sizes.",
                    }),
                    field("Badge", item, "tag", { options: TAGS }),
                    h(
                      "div",
                      { class: "sub span" },
                      h(
                        "div",
                        { class: "sub__hd" },
                        h("span", { class: "lbl" }, "Sizes"),
                        h(
                          "span",
                          { class: "hint", style: "margin:0" },
                          "Leave empty for a single-price dish. With sizes, the customer picks one before adding."
                        )
                      ),
                      listEditor((item.sizes ||= []), {
                        blank: { label: "Large", labelEs: "Grande", price: Number(item.price) || 0 },
                        addLabel: "+ Add size",
                        title: (sz) => sz.label || "Size",
                        body: (sz) =>
                          h(
                            "div",
                            { class: "grid2" },
                            field("Label (English)", sz, "label"),
                            field("Label (Spanish)", sz, "labelEs"),
                            field("Price", sz, "price", { type: "number", number: true })
                          ),
                      })
                    ),
                    h("div", { class: "span" }, imageField("Photo", item, "img"))
                  ),
              })
            )
          ),
      })
    );
  }

  function slideList(arr, withKicker) {
    return listEditor(arr, {
      blank: { src: "", alt: "", kicker: "", kickerEs: "", caption: "", captionEs: "" },
      addLabel: "+ Add image",
      title: (slide) => slide.caption || slide.alt || "Image",
      body: (slide) =>
        h(
          "div",
          {},
          imageField("Image", slide, "src"),
          h(
            "div",
            { class: "grid2" },
            field("Alt text", slide, "alt", {
              span: true,
              hint: "Describes the picture for screen readers and when the image fails to load.",
            }),
            withKicker ? field("Small label (English)", slide, "kicker") : null,
            withKicker ? field("Small label (Spanish)", slide, "kickerEs") : null,
            field("Caption (English)", slide, "caption"),
            field("Caption (Spanish)", slide, "captionEs")
          )
        ),
    });
  }

  function sectionGallery() {
    return h(
      "div",
      {},
      head("Photos", "The pictures in the hero carousel and down the About section."),
      h(
        "div",
        { class: "card" },
        h("div", { class: "card__hd" }, h("h3", {}, "Hero carousel")),
        slideList((content.gallery.hero ||= []), true)
      ),
      h(
        "div",
        { class: "card" },
        h("div", { class: "card__hd" }, h("h3", {}, "About strip")),
        slideList((content.gallery.about ||= []), false)
      )
    );
  }

  function sectionNav() {
    return h(
      "div",
      {},
      head("Navigation", "The links in the header and the footer."),
      listEditor(content.nav, {
        blank: { label: "New link", labelEs: "Enlace nuevo", href: "#home" },
        addLabel: "+ Add link",
        title: (l) => l.label || "Untitled link",
        body: (link) =>
          h(
            "div",
            { class: "grid2" },
            field("Label (English)", link, "label"),
            field("Label (Spanish)", link, "labelEs"),
            field("Target", link, "href", { hint: "A section anchor such as #menu, or a full URL.", span: true })
          ),
      })
    );
  }

  function sectionSettings() {
    const s = content.site;
    return h(
      "div",
      {},
      head("Site settings", "Name, WhatsApp number, address and opening hours. These feed every button and card on the site."),
      h(
        "div",
        { class: "card" },
        h(
          "div",
          { class: "grid2" },
          field("Restaurant name", s, "name"),
          field("Strapline", s, "subtitle"),
          field("WhatsApp number", s, "phone", {
            hint: "Country code + digits, no + and no spaces. e.g. 34624205945",
          }),
          field("Currency symbol", s, "currency"),
          field("Address", s, "address", { rows: 2, span: true }),
          field("Default WhatsApp message (English)", s, "waMessage", { rows: 2, span: true }),
          field("Default WhatsApp message (Spanish)", s, "waMessageEs", { rows: 2, span: true })
        )
      ),
      h(
        "div",
        { class: "card" },
        h("div", { class: "card__hd" }, h("h3", {}, "Ordering")),
        h(
          "div",
          { class: "grid2" },
          h("div", { class: "f span" }, checkbox("Offer delivery as well as pickup", s, "delivery")),
          field("Currency", s, "currency", {
            hint: "Three-letter code — EUR, GBP, USD. Prices are formatted for the visitor's language.",
          }),
          field("Delivery fee", s, "deliveryFee", { type: "number", number: true, hint: "0 for free delivery." }),
          field("Minimum delivery order", s, "minDeliveryOrder", {
            type: "number",
            number: true,
            hint: "0 for no minimum. Orders below this cannot be sent.",
          })
        )
      ),
      h(
        "div",
        { class: "card" },
        h("div", { class: "card__hd" }, h("h3", {}, "Opening hours")),
        listEditor(s.hours, {
          blank: { days: "Monday – Friday", time: "12:00 PM – 12:00 AM", daysEs: "Lunes – Viernes", timeEs: "12:00 PM – 12:00 AM" },
          addLabel: "+ Add a row",
          title: (r) => r.days || "Hours",
          body: (row) =>
            h(
              "div",
              { class: "grid2" },
              field("Days (English)", row, "days"),
              field("Hours (English)", row, "time"),
              field("Days (Spanish)", row, "daysEs"),
              field("Hours (Spanish)", row, "timeEs")
            ),
        }),
        h(
          "div",
          { class: "grid2", style: "margin-top:12px" },
          field("Footnote (English)", s, "hoursNote"),
          field("Footnote (Spanish)", s, "hoursNoteEs")
        )
      )
    );
  }

  function sectionSeo() {
    return h(
      "div",
      {},
      head("Search & sharing", "The title in the browser tab and search results, and the card shown when the link is shared."),
      h(
        "div",
        { class: "card" },
        field("Page title", content.seo, "title", { hint: "Around 60 characters reads best in Google." }),
        field("Meta description", content.seo, "description", { rows: 3, hint: "Around 155 characters." }),
        imageField("Share image", content.seo, "ogImage")
      )
    );
  }

  /* Page copy: built by walking the shipped defaults, so any string added to
     translations.ts shows up here automatically with no panel change. */
  function sectionCopy() {
    let lang = "es";
    const host = h("div", {});

    const labelise = (key) =>
      key
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/^./, (c) => c.toUpperCase());

    function walk(defaults, target, depth) {
      const rows = [];
      for (const key of Object.keys(defaults)) {
        const def = defaults[key];
        if (target[key] === undefined) target[key] = clone(def);

        if (typeof def === "string") {
          rows.push(field(labelise(key), target, key, { rows: def.length > 80 ? 3 : 0, span: def.length > 80 }));
        } else if (Array.isArray(def) && def.every((v) => typeof v === "string")) {
          rows.push(
            h("div", { class: "sub span" }, h("div", { class: "sub__hd" }, h("span", { class: "lbl" }, labelise(key))), lineList(target[key], touched))
          );
        } else if (def && typeof def === "object" && !Array.isArray(def)) {
          rows.push(
            h(
              "div",
              { class: "sub span" },
              h("div", { class: "sub__hd" }, h("span", { class: "lbl" }, labelise(key))),
              h("div", { class: "grid2" }, ...walk(def, target[key], depth + 1))
            )
          );
        }
      }
      return rows;
    }

    const draw = () => {
      host.textContent = "";
      const defaults = DEFAULTS.t[lang];
      const target = content.t[lang];
      for (const key of Object.keys(defaults)) {
        const def = defaults[key];
        if (typeof def === "string") {
          host.append(h("div", { class: "card" }, field(labelise(key), target, key)));
          continue;
        }
        const box = h("div", { class: "acc" });
        const bodyEl = h("div", { class: "acc__b", hidden: true }, h("div", { class: "grid2" }, ...walk(def, (target[key] ??= clone(def)), 0)));
        const toggle = h(
          "button",
          {
            type: "button",
            class: "acc__t",
            onclick: () => {
              const open = box.classList.toggle("is-open");
              bodyEl.hidden = !open;
            },
          },
          h("span", { class: "arw" }, "›"),
          labelise(key)
        );
        box.append(toggle, bodyEl);
        host.append(box);
      }
    };

    const seg = h(
      "div",
      { class: "seg" },
      ...[
        ["es", "Spanish"],
        ["en", "English"],
      ].map(([code, name]) =>
        h(
          "button",
          {
            type: "button",
            class: code === lang ? "is-on" : "",
            onclick: (e) => {
              lang = code;
              [...seg.children].forEach((b) => b.classList.remove("is-on"));
              e.currentTarget.classList.add("is-on");
              draw();
            },
          },
          name
        )
      )
    );

    draw();
    return h(
      "div",
      {},
      head("Page copy", "Every heading, paragraph and button label on the site, in both languages. Open a section to edit it."),
      h("div", { class: "card" }, seg),
      host
    );
  }

  function sectionTags() {
    const t = content.tags;
    return h(
      "div",
      {},
      head("Analytics & tags", "Paste an id to switch a tag on. Clear the field to switch it off. Publishing applies it on the next page load."),
      h(
        "div",
        { class: "note" },
        h("b", {}, "One place only. "),
        "If you run GA4 through Tag Manager, fill in the container id and leave the GA4 field empty — putting the same property in both double-counts your traffic."
      ),
      h(
        "div",
        { class: "card" },
        h("div", { class: "card__hd" }, h("h3", {}, "Google")),
        h(
          "div",
          { class: "grid2" },
          field("Tag Manager container", t, "gtm", { placeholder: "GTM-XXXXXXX" }),
          field("Analytics 4 measurement id", t, "ga4", { placeholder: "G-XXXXXXXXXX" }),
          field("Ads conversion id", t, "adsId", { placeholder: "AW-XXXXXXXXX" }),
          field("Ads conversion label", t, "adsLabel"),
          field("Search Console verification", t, "verification", { span: true, hint: "The content value of the google-site-verification meta tag." })
        )
      ),
      h(
        "div",
        { class: "card" },
        h("div", { class: "card__hd" }, h("h3", {}, "Advertising & behaviour")),
        h(
          "div",
          { class: "grid2" },
          field("Meta (Facebook) pixel", t, "metaPixel"),
          field("TikTok pixel", t, "tiktok"),
          field("LinkedIn partner id", t, "linkedin"),
          field("Microsoft Clarity", t, "clarity")
        ),
        h(
          "div",
          { class: "note" },
          "These four have no consent mode of their own, so they are not loaded at all until a visitor accepts."
        )
      ),
      h(
        "div",
        { class: "card" },
        h("div", { class: "card__hd" }, h("h3", {}, "Cookie consent")),
        field("Show the banner to", t, "consent", {
          options: [
            { value: "eu", label: "Visitors in Europe (recommended)" },
            { value: "all", label: "Everybody" },
            { value: "off", label: "Nobody — no banner" },
          ],
          hint: "Europe is decided from the visitor's own device time zone, so there is no lookup and no third party involved.",
        })
      ),
      h(
        "div",
        { class: "card" },
        h("div", { class: "card__hd" }, h("h3", {}, "Custom code")),
        h(
          "div",
          { class: "note warn" },
          "Anything pasted here runs on every page. Only paste snippets you were given by a service you trust."
        ),
        field("Extra code in <head>", t, "headCode", { rows: 6 }),
        field("Extra code at the end of <body>", t, "bodyCode", { rows: 6 })
      )
    );
  }

  function sectionMedia() {
    const host = h("div", {});
    const fileInput = h("input", { type: "file", accept: "image/*", multiple: true, style: "display:none" });

    const drop = h(
      "div",
      { class: "drop", onclick: () => fileInput.click() },
      "Drop images here, or click to choose. Large photos are shrunk to 1600px before upload."
    );
    drop.ondragover = (e) => {
      e.preventDefault();
      drop.classList.add("is-over");
    };
    drop.ondragleave = () => drop.classList.remove("is-over");
    drop.ondrop = (e) => {
      e.preventDefault();
      drop.classList.remove("is-over");
      send([...e.dataTransfer.files]);
    };
    fileInput.onchange = () => {
      send([...fileInput.files]);
      fileInput.value = "";
    };

    async function send(files) {
      const images = files.filter((f) => f.type.startsWith("image/"));
      if (!images.length) return toast("Those were not images.", "err");
      for (const file of images) {
        try {
          toast(`Uploading ${file.name}…`);
          await uploadFile(file);
        } catch (err) {
          toast(`${file.name}: ${err.message}`, "err");
        }
      }
      toast("Upload finished", "ok");
      load();
    }

    async function load() {
      host.textContent = "";
      let files;
      try {
        files = (await api("media")).files;
      } catch (err) {
        return host.append(h("div", { class: "note err" }, err.message));
      }
      if (!files.length) return host.append(h("div", { class: "empty" }, "No images uploaded yet."));
      host.append(
        h(
          "div",
          { class: "media" },
          ...files.map((f) =>
            h(
              "figure",
              {},
              h("img", { src: f.url, alt: f.name, loading: "lazy" }),
              h(
                "figcaption",
                {},
                h("span", {}, `${Math.round(f.size / 1024)} KB`),
                iconBtn("⧉", "Copy link", () => {
                  navigator.clipboard.writeText(f.url).then(() => toast("Link copied", "ok"));
                }),
                iconBtn(
                  "✕",
                  "Delete",
                  async () => {
                    if (!confirm("Delete this image? Anything still using it will show a broken picture.")) return;
                    try {
                      await api("deleteMedia", { url: f.url });
                      toast("Deleted", "ok");
                      load();
                    } catch (err) {
                      toast(err.message, "err");
                    }
                  },
                  "del"
                )
              )
            )
          )
        )
      );
    }

    load();
    return h("div", {}, head("Media", "Images you have uploaded. Dish photos can also be uploaded straight from the Menu section."), drop, fileInput, host);
  }

  function sectionSystem() {
    const pw = { current: "", next: "", again: "" };
    const historyHost = h("div", {});

    async function loadHistory() {
      historyHost.textContent = "";
      let snapshots;
      try {
        snapshots = (await api("history")).snapshots;
      } catch (err) {
        return historyHost.append(h("div", { class: "note err" }, err.message));
      }
      if (!snapshots.length) return historyHost.append(h("div", { class: "empty" }, "Nothing published yet."));
      historyHost.append(
        h(
          "div",
          { class: "tbl" },
          h(
            "table",
            {},
            h("thead", {}, h("tr", {}, h("th", {}, "Published"), h("th", {}, "Size"), h("th", {}, ""))),
            h(
              "tbody",
              {},
              ...snapshots.map((s) =>
                h(
                  "tr",
                  {},
                  h("td", { class: "mono" }, s.id.replace(/-/g, ":").replace(/^(\d{4}):(\d{2}):(\d{2})T/, "$1-$2-$3 ").slice(0, 19)),
                  h("td", {}, `${Math.round(s.size / 1024)} KB`),
                  h(
                    "td",
                    {},
                    h(
                      "button",
                      {
                        type: "button",
                        class: "btn btn--l btn--sm",
                        onclick: async () => {
                          if (!confirm("Load this version into the draft? Your unsaved changes will be lost.")) return;
                          try {
                            await api("restore", { id: s.id });
                            await loadContent();
                            render();
                            toast("Loaded into the draft — check it, then Publish.", "ok");
                          } catch (err) {
                            toast(err.message, "err");
                          }
                        },
                      },
                      "Load into draft"
                    )
                  )
                )
              )
            )
          )
        )
      );
    }

    loadHistory();

    return h(
      "div",
      {},
      head("System", "Your password and the last 20 published versions."),
      h(
        "div",
        { class: "card" },
        h("div", { class: "card__hd" }, h("h3", {}, "Admin password")),
        field("Current password", pw, "current", { type: "password" }),
        h("div", { class: "grid2" }, field("New password", pw, "next", { type: "password", hint: "At least 10 characters." }), field("Repeat new password", pw, "again", { type: "password" })),
        h(
          "button",
          {
            type: "button",
            class: "btn btn--p btn--sm",
            onclick: async (e) => {
              if (pw.next !== pw.again) return toast("The two new passwords do not match.", "err");
              e.currentTarget.disabled = true;
              try {
                await api("password", { current: pw.current, next: pw.next });
                toast("Password changed.", "ok");
                render();
              } catch (err) {
                toast(err.message, "err");
              }
              e.currentTarget.disabled = false;
            },
          },
          "Change password"
        )
      ),
      h("div", { class: "card" }, h("div", { class: "card__hd" }, h("h3", {}, "Published history")), historyHost),
      h(
        "div",
        { class: "card" },
        h("div", { class: "card__hd" }, h("h3", {}, "Reset")),
        h("div", { class: "note warn" }, "Throws away the draft and reloads the shipped defaults. Nothing public changes until you press Publish."),
        h(
          "button",
          {
            type: "button",
            class: "btn btn--d btn--sm",
            onclick: () => {
              if (!confirm("Reload the original shipped content into the draft?")) return;
              content = clone(DEFAULTS);
              touched();
              render();
              toast("Defaults loaded into the draft.");
            },
          },
          "Restore shipped defaults"
        )
      )
    );
  }

  const SECTIONS = [
    { id: "menu", label: "Menu", group: "Content", render: sectionMenu },
    { id: "copy", label: "Page copy", group: "Content", render: sectionCopy },
    { id: "nav", label: "Navigation", group: "Content", render: sectionNav },
    { id: "gallery", label: "Photos", group: "Content", render: sectionGallery },
    { id: "media", label: "Media", group: "Content", render: sectionMedia },
    { id: "settings", label: "Site settings", group: "Setup", render: sectionSettings },
    { id: "seo", label: "Search & sharing", group: "Setup", render: sectionSeo },
    { id: "tags", label: "Analytics & tags", group: "Setup", render: sectionTags },
    { id: "system", label: "System", group: "Setup", render: sectionSystem },
  ];

  /* ── chrome ──────────────────────────────────────────────── */
  function renderNav() {
    const side = $("side");
    side.textContent = "";
    let group = null;
    for (const s of SECTIONS) {
      if (s.group !== group) {
        group = s.group;
        side.append(h("div", { class: "side__grp" }, group));
      }
      side.append(
        h(
          "button",
          {
            type: "button",
            class: `navbtn ${s.id === current ? "is-on" : ""}`,
            onclick: () => {
              current = s.id;
              renderNav();
              render();
            },
          },
          s.label
        )
      );
    }
  }

  function render() {
    const main = $("main");
    main.textContent = "";
    main.append(SECTIONS.find((s) => s.id === current).render());
    touched();
  }

  /* ── load / save / publish ───────────────────────────────── */
  async function loadContent() {
    const [defaults, draft] = await Promise.all([
      fetch("defaults.json").then((r) => r.json()),
      fetch("/api/cms?draft=1", { credentials: "same-origin" }).then((r) => (r.ok ? r.json() : {})).catch(() => ({})),
    ]);
    DEFAULTS = defaults;
    content = merge(clone(defaults), draft);
    savedJson = JSON.stringify(content);
  }

  async function save() {
    await api("save", { content });
    savedJson = JSON.stringify(content);
    touched();
  }

  /* ── boot ────────────────────────────────────────────────── */
  async function start(mustChangePassword) {
    $("login").hidden = true;
    $("app").hidden = false;
    await loadContent();
    renderNav();
    if (mustChangePassword) {
      current = "system";
      renderNav();
      render();
      toast("You are still on the starting password — change it below.", "err");
    } else {
      render();
    }
  }

  $("loginForm").onsubmit = async (e) => {
    e.preventDefault();
    $("loginErr").textContent = "";
    try {
      const res = await api("login", { password: $("pw").value });
      $("pw").value = "";
      start(res.mustChangePassword);
    } catch (err) {
      $("loginErr").textContent = err.message;
    }
  };

  $("logout").onclick = async () => {
    if (isDirty() && !confirm("You have unsaved changes. Sign out anyway?")) return;
    await api("logout").catch(() => {});
    location.reload();
  };

  $("saveBtn").onclick = async (e) => {
    e.currentTarget.disabled = true;
    try {
      await save();
      toast("Draft saved. Check it with “Preview draft”, then Publish.", "ok");
    } catch (err) {
      toast(err.message, "err");
    }
    e.currentTarget.disabled = false;
  };

  $("publishBtn").onclick = async (e) => {
    if (!confirm("Publish these changes to the live site?")) return;
    e.currentTarget.disabled = true;
    try {
      if (isDirty()) await save();
      await api("publish");
      toast("Published. The live site updates within a minute.", "ok");
    } catch (err) {
      toast(err.message, "err");
    }
    e.currentTarget.disabled = false;
  };

  $("discardBtn").onclick = async () => {
    if (!confirm("Throw away the changes you have made since the last save?")) return;
    await loadContent();
    render();
  };

  window.addEventListener("beforeunload", (e) => {
    if (isDirty()) e.preventDefault();
  });

  // Already signed in? Skip the login card.
  api("me")
    .then((res) => {
      if (res.signedIn) start(res.mustChangePassword);
    })
    .catch(() => {});
})();
