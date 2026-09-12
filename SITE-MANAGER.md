# NAAN STOP — Site Manager

Admin panel: **https://&lt;your-domain&gt;/admin/**

---

## One-time setup (Vercel)

The panel needs three things on the Vercel project. Two minutes, once.

1. **Storage → Create → Blob store**, then connect it to this project.
   Vercel adds `BLOB_READ_WRITE_TOKEN` for you. Nothing else to configure.
2. **Settings → Environment Variables**, add both, for all environments:

   | Name | Value |
   |---|---|
   | `CMS_SECRET` | a long random string — `openssl rand -hex 32` |
   | `ADMIN_PASSWORD` | the starting password for the panel |

3. Redeploy.

Sign in at `/admin/` with `ADMIN_PASSWORD`. The panel will nag you until you
change it under **System → Admin password** — do that, and the environment
variable stops mattering.

> `CMS_SECRET` signs the login session **and** decides where the password file
> is stored. Changing it later signs everybody out and resets the password back
> to `ADMIN_PASSWORD`.

---

## What you can edit

| Section | What it controls |
|---|---|
| **Menu** | Categories, dishes, prices, badges and photos — English and Spanish |
| **Page copy** | Every heading, paragraph and button label on the site, both languages |
| **Navigation** | The links in the header and footer |
| **Photos** | The hero carousel and the About strip |
| **Media** | Uploaded images — add, copy a link, delete |
| **Site settings** | Name, WhatsApp number, address, opening hours, default order message, and **Ordering** — delivery on/off, currency, delivery fee, minimum delivery order |
| **Search & sharing** | Page title, meta description, share image |
| **Analytics & tags** | Tag Manager, GA4, Google Ads, Meta, TikTok, LinkedIn, Clarity, consent banner, custom code |
| **System** | Password, the last 20 published versions, reset to shipped defaults |

Lists support add, reorder, duplicate and delete.

---

## Draft, then publish

Nothing you type is public until you press **Publish**.

1. Edit. The bar at the bottom appears as soon as something changes.
2. **Save draft** — stored, still invisible to visitors.
3. **Preview draft** (top right) opens the real site reading your draft.
4. **Publish** — live within about a minute.

Every publish snapshots the version it replaced. **System → Published history**
keeps the last 20 and can load any of them back into the draft.

---

## Prices and sizes

Prices are **numbers**, not text — the basket adds them up and the total goes
into the WhatsApp message, so `7.5` works and `7,50 €` does not. The currency
symbol comes from the **Currency** field in Site settings (a three-letter code
such as `EUR`) and is formatted for whichever language the visitor is reading.

A dish with no sizes uses its single **Price**. Add sizes — Medium, Large, and
so on — and each carries its own price; the customer then picks one before the
dish goes in the basket, and the card shows the cheapest size with a `+`.

## How an order reaches you

1. The customer builds a basket. It survives scrolling away and reloading.
2. They open it, choose **Pickup** or **Delivery**, and fill in name, phone,
   address and notes. Name is always required; address only for delivery.
3. Delivery adds the fee and refuses to send below the minimum order.
4. **Send order on WhatsApp** opens your chat with the whole order written out —
   every line, the subtotal, the fee, the total, and their details.
5. **The customer still has to press send in WhatsApp.** Nothing reaches you
   until they do — the site cannot send on their behalf.

Their basket empties and the order is kept in their own order history, where
they can resend it or reorder later. That history lives in their browser only;
it is not visible in this panel.

---

## Images

Upload from **Media**, or straight from the photo field on any dish.

Large photos are shrunk to 1600px in your browser before they are sent, so a
phone photo is fine. You can also paste a URL from anywhere else instead.

Deleting an image from Media is permanent — anything still pointing at it will
show a broken picture.

---

## Analytics and tags

Paste an id to switch a tag on, clear the field to switch it off, then publish.

| Field | Where to find it |
|---|---|
| Tag Manager container | GTM → Workspace, top right (`GTM-XXXXXXX`) |
| Analytics 4 measurement id | GA4 → Admin → Data streams → your web stream (`G-XXXXXXXXXX`) |
| Google Ads conversion id | Ads → Goals → Conversions → your action → Tag setup (`AW-XXXXXXXXX`) |
| Google Ads conversion label | the part after the slash in `send_to` |

If you run GA4 through Tag Manager, fill in the container and leave the GA4
field empty — the same property in both places double-counts your traffic.

### Consent

The banner is on by default for visitors in Europe, decided from the visitor's
own device time zone, so there is no lookup and no third party involved. You can
widen it to everybody or turn it off.

Google's tags use **Consent Mode v2**: they load immediately but store nothing
until consent is given. Meta, TikTok, LinkedIn and Clarity have no consent mode,
so they are not loaded at all until a visitor accepts.

---

## If something goes wrong

| Symptom | Fix |
|---|---|
| "CMS_SECRET is not set" | The environment variable is missing — add it and redeploy |
| "No password configured" | `ADMIN_PASSWORD` is missing, or the Blob store is not connected |
| Panel loads, saving fails | The Blob store is not connected to this project |
| Site shows old content | Published content is CDN-cached for 60 seconds. Wait, then hard-refresh |
| Site looks completely wrong | **System → Published history** → load the last good version → Publish |

The site always ships with its own copy of the content built in. If the API is
down, the Blob store is empty, or you have published nothing yet, visitors see
the original site — never a blank page.
