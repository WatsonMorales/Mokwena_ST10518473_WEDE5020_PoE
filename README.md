# Mokwena_ST10518473_WEDE5020_PoE
This is the building of a website dedicated to a small shoe cleaning business named Sole Revive.
# SOLE REVIVE - Premium Shoe Cleaning & Care

## Student Information

**Student Name:** Tshiamo Watson Mokwena  
**Student Number:** ST10518473
**Module:** WEDE5020  
**Project:** Website Development Portfolio of Evidence  
**Organisation:** SOLE REVIVE  
**Organisation Type:** Fictional Small Business  
**Location:** Mamelodi, Pretoria, South Africa  
**Part:** Part 1 - Building the Foundation: Project Initiation and Planning

---

## 1. Project Overview

SOLE REVIVE is a proposed Fictional small business created solely for the purpose of this website development project. I have positioned the organisation as a premium shoe cleaning company and footwear care that was founded in Mamelodi, Pretoria. The business is affordable and focused on customer satisfaction and provides the local accessibility with premium services.
The mission for SOLE REVIVE is to be able to provide high quality shoe cleaning services all while it helps its customers retain the longevity and good condition of their shoes.
SOLE REVIVE’s target audience includes sneaker enthusiasts, young professionals, students and all who find them self unable to take proper care of the footwear due to Day-to-Day responsibilities. SOLE REVIVE is always there to help.



---

## 2. Website Goals and Objectives

The primary goal of the SOLE REVIVE website is to mae sure we establish a professional online presence for the fictional organization.

The website aims to:

- Introduce SOLE REVIVE to potential customers.
- Provide clear information about available shoe-cleaning services.
- Allow visitors to make service enquiries.
- Provide contact information and service locations.
- Build trust through professional presentation.
- Create an easy-to-use and visually appealing user experience.
- Provide a foundation for future interactive functionality.

### Key Performance Indicators

The success of the website will be evaluated using the following KPIs:

- Number of website visitors.
- Number of service enquiries.
- Number of contact-form submissions.
- Engagement with service pages.
- The customer's ease of navigation between website pages.
- Mobile and desktop usability.
- Overall visual and user experience.

---

## 3. Target Audience

The primary target audience for SOLE REVIVE includes:

- Sneaker enthusiasts.
- Students.
- Young adults.
- Young professionals.
- Families.
- All customers who regularly wear sneakers.
- Customers looking for professional and trustworthy cleaning services.

The website is designed to appeal particularly to users who value the appearance, maintenance and longevity of their footwear.

---

## 4. Website Features and Functionality

The website will consist of a minimum of five HTML pages.

### Home Page - `index.html`

The homepage introduces SOLE REVIVE and communicates the organisation's main value proposition.

It includes:

- Hero section.
- Business introduction.
- Service preview.
- Again the reasons to choose SOLE REVIVE.
- Calls-to-action.
- Website navigation.

### About Us - `about.html`

The About Us page provides information about the fictional organisation.

It includes:

- Organisation background.
- Mission statement.
- Vision statement.
- Business values.
- And the reasons to choose SOLE REVIVE.

### Services - `services.html`

The thing that the services page does is provide information about the shoe-cleaning services offered by SOLE REVIVE.

Planned services include:

- Standard Sneaker Clean.
- Deep Clean.
- Sole Care.
- Premium Shoe Care.

### Enquiry - `enquiry.html`

The Enquiry page is the thing allows visitors to enquire about a cleaning service they want.

The form collects:

- Full name.
- Email address.
- Phone number.
- Required service.
- Type of footwear.
- Number of pairs.
- Preferred service date.
- Additional information.

### Contact - `contact.html`

The Contact page provides general communication information for SOLE REVIVE.

It includes:

- Business contact details.
- Service locations.
- Map.
- Contact form.
- Message type selection.

---

## 5. Sitemap

The planned website structure is:

```text
SOLE REVIVE
│
├── Home
│   └── index.html
│
├── About Us
│   └── about.html
│
├── Services
│   └── services.html
│
├── Enquiry
│   └── enquiry.html
│
└── Contact
    └── contact.html
```


---
### 6.1 Changelogs(Part1)

**1st Commit** - This was my very first push to GitHub after viewing a video from my lecturer and it enabled me to successfully commit my first change. Sadly, I had already completed my Index and Services webpages so I couldn't add any other changes to them besides the comments which will be shown later.
**2nd Commit** - This was after I commenced the code of the about us page and luckily it didn't involve any complex tags, so it was all simple and manageable.
**3rd Commit** - Here I discovered what fieldsets were and helpful they'd be quite impactful to the usability of my website.
**4th Commit** - This is where I tried challenging myself and trying to input all the appropriate tags for the Service Information without any assistance after watching a tutorial video on YouTube, inevitably I failed and had to take a quick glance at the video just to fully get the hang of it.
**5th Commit** - This was just me changing the website title of the Enquiry page.
**6th Commit** - This was after I successfully added fictional organization's contact form in the Contact Us webpage.
**7th Commit** - I successfully added a contact form to the Contact HTML code.
**8th Commit** - Added multiple comments to the Contact Us HTML code.
**9th Commit** - added multiple comments to the Index HTML code and added a bit of personality to the service names and descriptions to feel much more entertaining to customers.
**10th Commit** - Here I actually added comments to the About Us, Services and Enquiries HTML codes but failed to commit them respectively and ended up only committing them as "Comments (About)".
**11th Commit** - This was just me finalizing the look of the project and I added underlines to the "Services" headings on the Services HTML code.


### 6.2 Changelogs(Part2)
- HTML corrections following Part 1 feedback:
- Added missing <!DOCTYPE html> and <html> wrapper to index.html and services.html (previously rendering in quirks mode).
- Fixed a broken closing tag on services.html.
- Added <meta charset="UTF-8"> and the responsive viewport meta tag to every page.
- Replaced table-based navigation with a semantic ul/li list on all pages.
- Removed deprecated bgcolor attributes in favour of CSS.
- Corrected a stray unclosed <div> on index.html and moved contact.html's <footer> outside of <main>.
  
### CSS Styling

- Created css/style.css and linked it to every page.
- Established a base reset, colour system (CSS custom properties), and typography scale.
- Built layout using Flexbox (homepage hero, header) and CSS Grid (.card-grid for service/location cards, .gallery-grid for the photo gallery).
- Styled forms, buttons, navigation, and footer consistently across the site using the cascade rather than one-off classes.
  
### CSS Styling

- Added tablet (≤1024px) and mobile (≤600px) breakpoints via media queries.
- Mobile navigation collapses to a stacked list; the hero and card grids switch from multi-column to single-column; buttons and form controls become full-width for touch.

### Animation:

- Added a scroll-driven colour effect to the homepage hero (CSS animation-timeline: scroll()), fading four decorative colour smudges as the visitor scrolls — confined to the homepage only, to preserve the clean look on every other page.
- Added staggered fade-up entrance animation for page sections, and hover-lift animation for service cards and buttons.
- All animation respects prefers-reduced-motion.

### New page — Gallery:

- Added gallery.html as a sixth page (documented here as required, since it exceeds the minimum of five).
- Added a responsive photo grid (.gallery-grid) with hover zoom and colour-cycled card accents.
- Given a deliberately more vibrant treatment than the rest of the site: an animated gradient heading, floating colour blobs, and colour-cycled card borders — while the rest of the site retains the clean, white, premium base styling.
- Updated navigation (header and footer) on all pages to include the Gallery link.

### Bug fixes:

- Fixed a layout bug where .card-grid styling was being applied to entire <section> elements (including headings) instead of just the card containers, causing misaligned grids.
- Fixed an invalid nested <section> structure on gallery.html that was preventing the intro, grid, and CTA sections from receiving their intended spacing (a main > section selector requires direct children).
- Replaced an absolutely-positioned logo (which had no positioned parent and could overlap page content) with a Flexbox-based header layout, and removed several accidentally duplicated CSS rule blocks.

### 6.3 Changelogs (Part 3)

| Date | Change |
|---|---|
| 2 Nov 2026 |On commit "54177d9" i edited the website according to the rubric. Here i fixed the CSS Layout structure, added more CSS-Psuedo-Classes. Fixed the media queries/breakpoints for tablet and mobile. Fixed the adjustment of the navigation menu for different screen sizes.|
| 3 Nov 2026 | Added `js/main.js` containing all Part 3 JavaScript, loaded with `defer` on every page |
| 3 Nov 2026 | **Interactive elements:** FAQ accordion on Services; tabbed care tips and random tip button on Home; modal quick-view for services |
| 3 Nov 2026 | **Dynamic content and search:** services price list generated from a data list with live search, category filter and sort; skeleton loading state |
| 3 Nov 2026 | **Gallery:** photos wrapped in buttons; added brand filter, search and sorting; built an accessible lightbox with keyboard, swipe and zoom |
| 3 Nov 2026 | **Map:** added Leaflet and OpenStreetMap map to Contact with layers, pins, service-area circles, location cards that fly to a pin, and geolocation check |
| 3 Nov 2026 | **Enquiry form:** added radio buttons (collection method), checkboxes (extras, consent), honeypot, `maxlength`, `autocomplete` and input modes; added full JavaScript validation with inline errors, live character counter and live price estimate |
| 2 Nov 2026 | **Enquiry response:** quote, discount, availability and ready date shown after submission; AJAX submit through `fetch`; added `data-netlify` so Netlify Forms can store submissions |
| 2 Nov 2026 | **Contact form:** added validation and an email builder that creates a `mailto:` message to the recipient set in the code, with preview and copy button |
| 2 Nov 2026 | **SEO:** unique title, description and keywords on every page; Open Graph and Twitter tags; canonical links; JSON-LD `LocalBusiness`; `robots.txt` and `sitemap.xml` |
| 3 Nov 2026 | **Images:** renamed and added duplicate images with descriptive lower-case names and updated every reference; improved alt text and corrected the "Adimule Sildes" caption to "Adidas Adilette Slides"; converted the Asics image and sole-care photo to WebP |
| 3 Nov 2026 | **Security and speed:** Content Security Policy and `_headers`; logo compressed from 1.2 MB to 140 KB; lazy loading; fixed the "MAMEMLODI" typo in the hero |
| 3 Nov 2026 | **Effects:** scroll progress bar, sticky header, back-to-top, before/after slider, typewriter, bubbles, brand marquee, cursor paint trail, button ripples and bursts, confetti, card tilt, reveal on scroll, page transitions, toasts, reduced-motion support |
| 2 Nov 2026 | **Accessibility:** skip link, `aria-live` regions for search results and errors, focus handling in modal and lightbox, visible focus styles |


---

### 7. References
- CodingOne(2021), How to add Fieldset in HTML | | Web development [Online Video], Available at:<https://www.youtube.com/watch?v=MHw7Fj8msBE> (Accessed: 14 August 2026)
- Legends Barber, 2026. Africa's #1 Barbershop. [Online] Available at: https://www.legends-barber.com/ [Accessed 14 August 2026].
- Register Domain SA, 2025. Understanding The Costs Of Domain Registration And Hosting In South Africa. [Online] Available at: https://www.registerdomain.co.za/blog/domain-hosting-costs-south-africa/ [Accessed 14 August 2026].
- The Independent Institute of Education, 2026. PoE: Part1 - Building the Foundation: Project Initiation and Planning, Pretoria: The Independent Institute of Education.
- The Sneaker Shack, 2026. The Sneaker Shack. [Online] Available at: https://thesneakershack.co.za/ [Accessed 14 August 2026].
- Vowel Designs, 2023. Shoe Carnival’s New Recruitment Website. [Online] Available at: https://www.vowelsdesigns.com/shoe-carnivals-new-recruitment-website/ [Accessed 14 August 2026].

Agafonkin, V. n.d. *Leaflet: an open-source JavaScript library for mobile-friendly interactive maps* (version 1.9.4). [Online]. Available at: https://leafletjs.com [Accessed 2 November 2026].

Google. n.d. *Search Central: SEO starter guide* and *LocalBusiness structured data*. [Online]. Available at: https://developers.google.com/search/docs [Accessed 2 November 2026].

Mozilla. n.d. *MDN Web Docs: Fetch API, IntersectionObserver, Constraint validation, Content-Security-Policy*. [Online]. Available at: https://developer.mozilla.org [Accessed 2 November 2026].

OpenStreetMap contributors. n.d. *OpenStreetMap*. [Online]. Available at: https://www.openstreetmap.org/copyright [Accessed 2 November 2026].

Schema.org. n.d. *LocalBusiness*. [Online]. Available at: https://schema.org/LocalBusiness [Accessed 2 November 2026].