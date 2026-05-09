const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const dataPath = path.join(rootDir, 'presentation', 'slides-data.json');
const htmlOutputPath = path.join(rootDir, 'presentation_deck.html');
const pptxOutputPath = path.join(rootDir, 'Retinal_AI_Project_Presentation.pptx');

const slides = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const escapeXml = (value = '') => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const escapeHtml = (value = '') => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const writeFile = (targetPath, content) => {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content);
};

const buildHtmlDeck = () => {
  const slideMarkup = slides.map((slide, index) => `
    <section class="slide${index === 0 ? ' active' : ''}" data-slide="${index + 1}">
      <div class="frame">
        <div class="meta-row">
          <span class="eyebrow">${escapeHtml(slide.kicker || 'Project')}</span>
          <span class="counter">${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}</span>
        </div>
        <h2>${escapeHtml(slide.title)}</h2>
        ${slide.subtitle ? `<p class="subtitle">${escapeHtml(slide.subtitle)}</p>` : ''}
        <div class="content-grid">
          <div class="card">
            <h3>Slide Points</h3>
            <ul>
              ${slide.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}
            </ul>
          </div>
          <div class="card notes">
            <h3>Speaker Notes</h3>
            <p>${escapeHtml(slide.notes || 'No speaker notes added for this slide.')}</p>
          </div>
        </div>
      </div>
    </section>
  `).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Retinal AI Project Presentation</title>
  <style>
    :root {
      --bg: #f4efe6;
      --paper: rgba(255, 250, 244, 0.78);
      --ink: #1a1a1a;
      --muted: #6b6256;
      --brand: #0b7a5c;
      --brand-soft: #dff3e8;
      --accent: #153243;
      --line: rgba(21, 50, 67, 0.12);
      --shadow: 0 28px 80px rgba(17, 24, 39, 0.12);
      --radius: 32px;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: Georgia, "Times New Roman", serif;
      color: var(--ink);
      background:
        radial-gradient(circle at top left, rgba(11, 122, 92, 0.14), transparent 30%),
        radial-gradient(circle at right center, rgba(21, 50, 67, 0.16), transparent 28%),
        linear-gradient(135deg, #f5efe6 0%, #ece4d7 48%, #e7eef3 100%);
      overflow: hidden;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.16) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.16) 1px, transparent 1px);
      background-size: 38px 38px;
      mask-image: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent);
      pointer-events: none;
    }

    .deck {
      position: relative;
      width: 100vw;
      height: 100vh;
    }

    .slide {
      position: absolute;
      inset: 0;
      opacity: 0;
      transform: translateY(18px) scale(0.985);
      transition: opacity 0.35s ease, transform 0.35s ease;
      padding: 40px;
      pointer-events: none;
    }

    .slide.active {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .frame {
      max-width: 1240px;
      height: 100%;
      margin: 0 auto;
      padding: 36px 40px 34px;
      border-radius: var(--radius);
      background: var(--paper);
      border: 1px solid rgba(255, 255, 255, 0.62);
      box-shadow: var(--shadow);
      backdrop-filter: blur(22px);
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }

    .eyebrow, .counter {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 10px 16px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    .eyebrow {
      background: var(--brand-soft);
      color: var(--brand);
    }

    .counter {
      background: rgba(21, 50, 67, 0.08);
      color: var(--accent);
    }

    h2 {
      margin: 0;
      font-size: clamp(2rem, 4vw, 3.6rem);
      line-height: 1.02;
      letter-spacing: -0.04em;
      max-width: 980px;
    }

    .subtitle {
      margin: 0;
      color: var(--muted);
      font-size: 1.04rem;
      line-height: 1.7;
      max-width: 980px;
    }

    .content-grid {
      flex: 1;
      min-height: 0;
      display: grid;
      grid-template-columns: 1.3fr 0.8fr;
      gap: 24px;
    }

    .card {
      min-height: 0;
      border-radius: 28px;
      padding: 26px 28px;
      background: rgba(255,255,255,0.78);
      border: 1px solid var(--line);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.75);
    }

    .card h3 {
      margin: 0 0 16px;
      font-size: 0.88rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--brand);
    }

    ul {
      margin: 0;
      padding-left: 22px;
      display: grid;
      gap: 12px;
      font-size: 1rem;
      line-height: 1.72;
    }

    li::marker {
      color: var(--brand);
    }

    .notes {
      background:
        linear-gradient(180deg, rgba(223, 243, 232, 0.72), rgba(255, 255, 255, 0.88));
    }

    .notes p {
      margin: 0;
      color: #2f3d3a;
      font-size: 1rem;
      line-height: 1.8;
    }

    .controls {
      position: fixed;
      left: 50%;
      bottom: 22px;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 999px;
      background: rgba(17, 24, 39, 0.78);
      color: white;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.24);
      backdrop-filter: blur(14px);
      z-index: 20;
    }

    .controls button {
      border: 0;
      border-radius: 999px;
      background: rgba(255,255,255,0.1);
      color: white;
      padding: 10px 16px;
      font: inherit;
      cursor: pointer;
    }

    .controls button:hover {
      background: rgba(255,255,255,0.18);
    }

    .controls span {
      font-size: 0.95rem;
      letter-spacing: 0.04em;
    }

    @media (max-width: 980px) {
      .slide { padding: 20px; }
      .frame { padding: 26px 24px 90px; }
      .content-grid { grid-template-columns: 1fr; }
      body { overflow: auto; }
      .slide { position: static; opacity: 1; transform: none; min-height: 100vh; }
      .deck { height: auto; }
      .controls { display: none; }
    }

    @media print {
      body {
        overflow: visible;
        background: white;
      }
      body::before, .controls { display: none; }
      .deck { height: auto; }
      .slide {
        position: static;
        opacity: 1;
        transform: none;
        padding: 0;
        page-break-after: always;
      }
      .frame {
        min-height: 100vh;
        border-radius: 0;
        box-shadow: none;
        border: none;
      }
    }
  </style>
</head>
<body>
  <main class="deck">
    ${slideMarkup}
  </main>
  <div class="controls">
    <button id="prevBtn" type="button">Previous</button>
    <span id="slideLabel">1 / ${slides.length}</span>
    <button id="nextBtn" type="button">Next</button>
  </div>
  <script>
    const slides = Array.from(document.querySelectorAll('.slide'));
    let currentIndex = 0;
    const slideLabel = document.getElementById('slideLabel');

    const render = () => {
      slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentIndex);
      });
      slideLabel.textContent = (currentIndex + 1) + ' / ' + slides.length;
    };

    const next = () => {
      currentIndex = (currentIndex + 1) % slides.length;
      render();
    };

    const prev = () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      render();
    };

    document.getElementById('nextBtn').addEventListener('click', next);
    document.getElementById('prevBtn').addEventListener('click', prev);

    window.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault();
        next();
      }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        prev();
      }
    });

    render();
  </script>
</body>
</html>`;

  writeFile(htmlOutputPath, html);
};

const buildParagraph = (text, options = {}) => {
  const size = options.size || 1800;
  const bold = options.bold ? ' b="1"' : '';
  const color = options.color || '2B2B2B';
  const bullet = options.bullet
    ? '<a:pPr marL="342900" indent="-285750"><a:buChar char="•"/></a:pPr>'
    : '<a:pPr algn="l"/>';

  return `
    <a:p>
      ${bullet}
      <a:r>
        <a:rPr lang="en-US" sz="${size}"${bold}>
          <a:solidFill><a:srgbClr val="${color}"/></a:solidFill>
        </a:rPr>
        <a:t>${escapeXml(text)}</a:t>
      </a:r>
      <a:endParaRPr lang="en-US" sz="${size}"/>
    </a:p>
  `;
};

const buildTextBox = ({ id, name, x, y, cx, cy, paragraphs }) => `
  <p:sp>
    <p:nvSpPr>
      <p:cNvPr id="${id}" name="${escapeXml(name)}"/>
      <p:cNvSpPr txBox="1"/>
      <p:nvPr/>
    </p:nvSpPr>
    <p:spPr>
      <a:xfrm>
        <a:off x="${x}" y="${y}"/>
        <a:ext cx="${cx}" cy="${cy}"/>
      </a:xfrm>
      <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
      <a:noFill/>
      <a:ln><a:noFill/></a:ln>
    </p:spPr>
    <p:txBody>
      <a:bodyPr wrap="square" rtlCol="0" anchor="t"/>
      <a:lstStyle/>
      ${paragraphs.join('')}
    </p:txBody>
  </p:sp>
`;

const buildSlideXml = (slide, index) => {
  const titleParagraphs = [
    buildParagraph(slide.kicker || 'Project', { size: 1200, bold: true, color: '0B7A5C' }),
    buildParagraph(slide.title, { size: 2600, bold: true, color: '17202A' }),
  ];

  const subtitleParagraphs = slide.subtitle
    ? [buildParagraph(slide.subtitle, { size: 1400, color: '6B6256' })]
    : [];

  const bulletParagraphs = slide.bullets.map((bullet) => buildParagraph(bullet, { size: 1500, color: '23303B', bullet: true }));
  const noteParagraphs = [
    buildParagraph('Speaker Notes', { size: 1200, bold: true, color: '153243' }),
    buildParagraph(slide.notes || '', { size: 1300, color: '30444A' }),
  ];

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld name="Slide ${index + 1}">
    <p:bg>
      <p:bgPr>
        <a:solidFill><a:srgbClr val="F6F0E7"/></a:solidFill>
        <a:effectLst/>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      ${buildTextBox({ id: 2, name: 'Title', x: 457200, y: 320040, cx: 7924800, cy: 1188720, paragraphs: titleParagraphs })}
      ${subtitleParagraphs.length ? buildTextBox({ id: 3, name: 'Subtitle', x: 457200, y: 1412240, cx: 7924800, cy: 609600, paragraphs: subtitleParagraphs }) : ''}
      ${buildTextBox({ id: 4, name: 'Bullets', x: 457200, y: 2194560, cx: 5334000, cy: 3749040, paragraphs: bulletParagraphs })}
      ${buildTextBox({ id: 5, name: 'Notes', x: 6126480, y: 2194560, cx: 2458720, cy: 3026400, paragraphs: noteParagraphs })}
      ${buildTextBox({ id: 6, name: 'Footer', x: 457200, y: 6223000, cx: 7924800, cy: 280000, paragraphs: [
        buildParagraph(`Retinal AI Project Presentation  |  Slide ${index + 1} of ${slides.length}`, { size: 1000, color: '0B7A5C' })
      ] })}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;
};

const buildPptx = () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'retinal-ai-pptx-'));
  const pptDir = path.join(tmpDir, 'ppt');
  const slidesDir = path.join(pptDir, 'slides');
  const slidesRelsDir = path.join(slidesDir, '_rels');
  const relsDir = path.join(tmpDir, '_rels');
  const docPropsDir = path.join(tmpDir, 'docProps');
  const pptRelsDir = path.join(pptDir, '_rels');
  const slideMastersDir = path.join(pptDir, 'slideMasters');
  const slideMastersRelsDir = path.join(slideMastersDir, '_rels');
  const slideLayoutsDir = path.join(pptDir, 'slideLayouts');
  const slideLayoutsRelsDir = path.join(slideLayoutsDir, '_rels');
  const themeDir = path.join(pptDir, 'theme');

  [slidesDir, slidesRelsDir, relsDir, docPropsDir, pptRelsDir, slideMastersDir, slideMastersRelsDir, slideLayoutsDir, slideLayoutsRelsDir, themeDir].forEach((dir) => {
    fs.mkdirSync(dir, { recursive: true });
  });

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/>
  <Override PartName="/ppt/viewProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.viewProps+xml"/>
  <Override PartName="/ppt/tableStyles.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.tableStyles+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  ${slides.map((_, index) => `<Override PartName="/ppt/slides/slide${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join('\n  ')}
</Types>`;

  const packageRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

  const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Codex</Application>
  <PresentationFormat>Custom</PresentationFormat>
  <Slides>${slides.length}</Slides>
  <Notes>0</Notes>
  <HiddenSlides>0</HiddenSlides>
  <MMClips>0</MMClips>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs>
    <vt:vector size="2" baseType="variant">
      <vt:variant><vt:lpstr>Theme</vt:lpstr></vt:variant>
      <vt:variant><vt:i4>1</vt:i4></vt:variant>
    </vt:vector>
  </HeadingPairs>
  <TitlesOfParts>
    <vt:vector size="${slides.length + 1}" baseType="lpstr">
      <vt:lpstr>Office Theme</vt:lpstr>
      ${slides.map((slide) => `<vt:lpstr>${escapeXml(slide.title)}</vt:lpstr>`).join('\n      ')}
    </vt:vector>
  </TitlesOfParts>
  <Company>OpenAI Codex</Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>1.0</AppVersion>
</Properties>`;

  const created = new Date().toISOString();
  const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Retinal AI Project Presentation</dc:title>
  <dc:subject>Detailed project presentation</dc:subject>
  <dc:creator>OpenAI Codex</dc:creator>
  <cp:keywords>retinal ai, diabetic retinopathy, project presentation</cp:keywords>
  <dc:description>Detailed project presentation generated from the repository implementation.</dc:description>
  <cp:lastModifiedBy>OpenAI Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${created}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${created}</dcterms:modified>
</cp:coreProperties>`;

  const presentationXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" saveSubsetFonts="1" autoCompressPictures="0">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    ${slides.map((_, index) => `<p:sldId id="${256 + index}" r:id="rId${index + 5}"/>`).join('\n    ')}
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000" type="screen4x3"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`;

  const presentationRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/presProps" Target="presProps.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/viewProps" Target="viewProps.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/tableStyles" Target="tableStyles.xml"/>
  ${slides.map((_, index) => `<Relationship Id="rId${index + 5}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${index + 1}.xml"/>`).join('\n  ')}
</Relationships>`;

  const presPropsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentationPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:showPr loop="0" useTimings="0"/>
</p:presentationPr>`;

  const viewPropsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:viewPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" lastView="sldView">
  <p:normalViewPr>
    <p:restoredLeft sz="15620"/>
    <p:restoredTop sz="94660"/>
  </p:normalViewPr>
  <p:slideViewPr>
    <p:cSldViewPr snapToGrid="1"/>
  </p:slideViewPr>
  <p:notesTextViewPr>
    <p:cViewPr varScale="1">
      <p:scale sx="100" sy="100"/>
      <p:origin x="0" y="0"/>
    </p:cViewPr>
  </p:notesTextViewPr>
  <p:gridSpacing cx="780288" cy="780288"/>
</p:viewPr>`;

  const tableStylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:tblStyleLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" def="{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}"/>`;

  const slideMasterXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld name="Retinal AI Master">
    <p:bg>
      <p:bgPr>
        <a:solidFill><a:srgbClr val="F6F0E7"/></a:solidFill>
        <a:effectLst/>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483649" r:id="rId1"/>
  </p:sldLayoutIdLst>
  <p:txStyles>
    <p:titleStyle/>
    <p:bodyStyle/>
    <p:otherStyle/>
  </p:txStyles>
</p:sldMaster>`;

  const slideMasterRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`;

  const slideLayoutXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="obj" preserve="1">
  <p:cSld name="Blank Layout">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>`;

  const slideLayoutRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`;

  const themeXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Retinal AI Theme">
  <a:themeElements>
    <a:clrScheme name="Retinal AI">
      <a:dk1><a:srgbClr val="111827"/></a:dk1>
      <a:lt1><a:srgbClr val="FFFDF9"/></a:lt1>
      <a:dk2><a:srgbClr val="153243"/></a:dk2>
      <a:lt2><a:srgbClr val="F6F0E7"/></a:lt2>
      <a:accent1><a:srgbClr val="0B7A5C"/></a:accent1>
      <a:accent2><a:srgbClr val="153243"/></a:accent2>
      <a:accent3><a:srgbClr val="D99A2B"/></a:accent3>
      <a:accent4><a:srgbClr val="A44A3F"/></a:accent4>
      <a:accent5><a:srgbClr val="4F6D7A"/></a:accent5>
      <a:accent6><a:srgbClr val="7C6F64"/></a:accent6>
      <a:hlink><a:srgbClr val="0B7A5C"/></a:hlink>
      <a:folHlink><a:srgbClr val="7C6F64"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="Retinal AI Fonts">
      <a:majorFont>
        <a:latin typeface="Georgia"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:majorFont>
      <a:minorFont>
        <a:latin typeface="Arial"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="Retinal AI Format">
      <a:fillStyleLst>
        <a:solidFill><a:schemeClr val="lt1"/></a:solidFill>
        <a:solidFill><a:schemeClr val="accent1"/></a:solidFill>
        <a:solidFill><a:schemeClr val="accent2"/></a:solidFill>
      </a:fillStyleLst>
      <a:lnStyleLst>
        <a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="accent1"/></a:solidFill></a:ln>
        <a:ln w="25400" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="accent2"/></a:solidFill></a:ln>
        <a:ln w="38100" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="accent3"/></a:solidFill></a:ln>
      </a:lnStyleLst>
      <a:effectStyleLst>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
      </a:effectStyleLst>
      <a:bgFillStyleLst>
        <a:solidFill><a:schemeClr val="lt2"/></a:solidFill>
        <a:solidFill><a:schemeClr val="lt1"/></a:solidFill>
        <a:solidFill><a:schemeClr val="accent1"/></a:solidFill>
      </a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
  <a:objectDefaults/>
  <a:extraClrSchemeLst/>
</a:theme>`;

  writeFile(path.join(tmpDir, '[Content_Types].xml'), contentTypes);
  writeFile(path.join(relsDir, '.rels'), packageRels);
  writeFile(path.join(docPropsDir, 'app.xml'), appXml);
  writeFile(path.join(docPropsDir, 'core.xml'), coreXml);
  writeFile(path.join(pptDir, 'presentation.xml'), presentationXml);
  writeFile(path.join(pptRelsDir, 'presentation.xml.rels'), presentationRelsXml);
  writeFile(path.join(pptDir, 'presProps.xml'), presPropsXml);
  writeFile(path.join(pptDir, 'viewProps.xml'), viewPropsXml);
  writeFile(path.join(pptDir, 'tableStyles.xml'), tableStylesXml);
  writeFile(path.join(slideMastersDir, 'slideMaster1.xml'), slideMasterXml);
  writeFile(path.join(slideMastersRelsDir, 'slideMaster1.xml.rels'), slideMasterRelsXml);
  writeFile(path.join(slideLayoutsDir, 'slideLayout1.xml'), slideLayoutXml);
  writeFile(path.join(slideLayoutsRelsDir, 'slideLayout1.xml.rels'), slideLayoutRelsXml);
  writeFile(path.join(themeDir, 'theme1.xml'), themeXml);

  slides.forEach((slide, index) => {
    writeFile(path.join(slidesDir, `slide${index + 1}.xml`), buildSlideXml(slide, index));
    writeFile(path.join(slidesRelsDir, `slide${index + 1}.xml.rels`), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`);
  });

  if (fs.existsSync(pptxOutputPath)) {
    fs.unlinkSync(pptxOutputPath);
  }

  execFileSync('zip', ['-qr', pptxOutputPath, '.'], { cwd: tmpDir });
};

buildHtmlDeck();
buildPptx();

console.log(`Generated ${htmlOutputPath}`);
console.log(`Generated ${pptxOutputPath}`);
