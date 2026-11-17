'use client';

import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react';

export type GalleryItem = {
  image: string;
  text?: string;
  description?: string;
  alt?: string;
};

export interface CircularGalleryProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  items?: GalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
  itemSize?: number;
  itemAspect?: number;
  gap?: number;
  wave?: number;
  fadeEdges?: number;
  shadow?: number;
  grayscale?: boolean;
  showTitles?: boolean;
  snap?: boolean;
  autoScroll?: number;
  openOnClick?: boolean;
  intro?: boolean;
  onItemClick?: (item: GalleryItem, index: number) => void;
  onActiveChange?: (index: number) => void;
  dpr?: number;
  style?: CSSProperties;
}

type Settings = {
  items: GalleryItem[]; bend: number; textColor: string; borderRadius: number;
  scrollSpeed: number; scrollEase: number; itemSize: number; itemAspect: number;
  gap: number; wave: number; fadeEdges: number; shadow: number; grayscale: boolean;
  showTitles: boolean; snap: boolean; autoScroll: number; openOnClick: boolean; intro: boolean;
  onItemClick?: (item: GalleryItem, index: number) => void;
  onActiveChange?: (index: number) => void; dpr?: number;
};
type TextureEntry = { texture: WebGLTexture | null; aspect: number; ready: number; loaded: boolean };
type Point = { x: number; y: number };
type Frame = { width: number; height: number; y: number; titleSpace: number };
type Card = {
  slot: number; index: number; item: GalleryItem; entry: TextureEntry;
  x: number; y: number; angle: number; w: number; h: number; radius: number;
  alpha: number; dim: number; gray: number; focus: number; labelAlpha: number; labelSize: number; frame: Frame;
};
type Metrics = { w: number; h: number; spacing: number; openH: number; openY: number; titleSpace: number };
type Drag = { id: number; x0: number; y0: number; start: number; moved: boolean; samples: { x: number; t: number }[]; p: Point };
type GalleryState = {
  scroll: number; target: number; velocity: number; open: number; openTarget: number;
  intro: number; waveTime: number; ring: number; keyboard: boolean; hovered: number | null;
  hover: Map<number, number>; focus: Map<number, number>; drag: Drag | null;
  lastInput: number; active: number; spacing: number;
};
type LabelSlot = { el: HTMLSpanElement; slot: number | null; font: string; text: string };
type Engine = { wake: () => void; open: (i: number) => void; focus: (i: number) => void; close: () => void };
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };

const SEGMENTS_X = 32, SEGMENTS_Y = 24, INTRO_SECONDS = 1.4, WORLD_HEIGHT = 16.57;
const DEFAULT_FONT = 'bold 28px serif';
const CLASSES = {
  root: 'relative h-full w-full cursor-grab touch-pan-y select-none overflow-hidden data-[dragging]:cursor-grabbing data-[pointer]:cursor-pointer',
  canvas: 'absolute inset-0 block h-full w-full',
  labels: 'pointer-events-none absolute inset-0',
  label: 'absolute left-0 top-0 whitespace-nowrap leading-[1.2] will-change-[transform,opacity]',
  caption: 'pointer-events-none absolute left-1/2 top-0 w-[min(90%,36rem)] text-center opacity-0',
  captionText: 'm-0 leading-[1.5] opacity-65',
  close: 'pointer-events-none absolute right-3 top-3 grid h-10 w-10 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 text-inherit opacity-0 transition-opacity duration-200 data-[visible]:pointer-events-auto data-[visible]:opacity-80 data-[visible]:hover:opacity-100',
  hidden: 'sr-only',
};
const STEPS: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

const VERTEX = `#version 300 es
in vec2 aPosition;
uniform vec2 uResolution; uniform vec2 uCenter; uniform vec2 uSize;
uniform float uAngle; uniform float uPad; uniform float uWave;
uniform float uWaveTime; uniform float uFocal;
out vec2 vLocal;
void main() {
  vec2 local = aPosition * (uSize + 2.0 * uPad);
  vec2 unit = local / max(uSize, vec2(1.0));
  float z = uWave * (sin(unit.x * 4.0 + uWaveTime) + cos(unit.y * 2.0 + uWaveTime)) * 0.5;
  float depth = uFocal / max(uFocal - z, 1.0);
  float c = cos(uAngle); float s = sin(uAngle);
  vec2 turned = vec2(c * local.x - s * local.y, s * local.x + c * local.y);
  vLocal = local;
  gl_Position = vec4((uCenter + turned * depth) / (uResolution * 0.5), 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D uTexture; uniform vec2 uResolution; uniform vec2 uSize;
uniform float uRadius; uniform float uImageAspect; uniform float uReady;
uniform vec3 uPlaceholder; uniform float uGray; uniform float uDim;
uniform float uAlpha; uniform float uRing; uniform vec3 uRingColor;
uniform float uRingWidth; uniform float uRingGap; uniform float uFade;
uniform float uShadow; uniform float uBlur; uniform vec2 uShadowOffset;
in vec2 vLocal; out vec4 outColor;
float roundBox(vec2 p, vec2 b, float r) { vec2 q = abs(p)-b+r; return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r; }
float smoother(float x) { x=clamp(x,0.0,1.0); return x*x*x*(x*(x*6.0-15.0)+10.0); }
float edgeFade() { if(uFade<=0.0)return 1.0; float u=gl_FragCoord.x/uResolution.x; return smoother(u/uFade)*smoother((1.0-u)/uFade); }
void main() {
  vec2 extent = uSize*0.5;
  if(uShadow>0.0){float d=roundBox(vLocal-uShadowOffset,extent,uRadius);float a=uShadow*(1.0-smoothstep(-uBlur,uBlur,d))*uAlpha*edgeFade();outColor=vec4(0.0,0.0,0.0,a);return;}
  float d=roundBox(vLocal,extent,uRadius);
  float pixel=max(length(vec2(dFdx(d),dFdy(d))),1e-4);
  float cover=clamp(0.5-d/pixel,0.0,1.0);
  vec2 uv=vLocal/uSize+0.5; float aspect=uSize.x/uSize.y;
  vec2 crop=aspect>uImageAspect?vec2(1.0,uImageAspect/aspect):vec2(aspect/uImageAspect,1.0);
  vec3 image=texture(uTexture,(uv-0.5)*crop+0.5).rgb;
  vec3 color=mix(uPlaceholder,image,uReady);
  float luma=dot(color,vec3(0.2126,0.7152,0.0722));
  color=mix(color,vec3(luma),uGray)*(1.0-uDim);
  float body=cover*mix(0.08,1.0,uReady);
  float band=abs(d-uRingGap-uRingWidth*0.5)-uRingWidth*0.5;
  float ring=clamp(0.5-band/pixel,0.0,1.0)*uRing;
  vec4 card=vec4(color*body,body); vec4 outline=vec4(uRingColor*ring,ring);
  outColor=(card+outline*(1.0-card.a))*uAlpha*edgeFade();
}`;

const cv = (v: number, mn: number, mx: number) => Math.min(mx, Math.max(mn, v));
const mv = (a: number, b: number, t: number) => a + (b - a) * t;
const ev = (v: number) => v * v * (3 - 2 * v);
const wv = (v: number, l: number) => ((v % l) + l) % l;
const fontScale = (f: string) => { const m = String(f).match(/(\d+(?:\.\d+)?)px/); return m ? parseFloat(m[1]) / 30 : 1; };

const compile = (gl: WebGL2RenderingContext, type: number, src: string) => {
  const s = gl.createShader(type); if (!s) return null;
  gl.shaderSource(s, src); gl.compileShader(s);
  if (gl.getShaderParameter(s, gl.COMPILE_STATUS)) return s;
  gl.deleteShader(s); return null;
};
const link = (gl: WebGL2RenderingContext): Program | null => {
  const v = compile(gl, gl.VERTEX_SHADER, VERTEX), f = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const p = gl.createProgram();
  if (!v || !f || !p) return null;
  gl.attachShader(p, v); gl.attachShader(p, f);
  gl.bindAttribLocation(p, 0, 'aPosition'); gl.linkProgram(p);
  gl.deleteShader(v); gl.deleteShader(f);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { gl.deleteProgram(p); return null; }
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const count = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) { const info = gl.getActiveUniform(p, i); if (info) uniforms[info.name] = gl.getUniformLocation(p, info.name); }
  return { program: p, uniforms };
};

const CircularGallery = ({
  items, bend = 3, textColor = '#ffffff', borderRadius = 0.05,
  font = DEFAULT_FONT, scrollSpeed = 2, scrollEase = 0.05,
  itemSize = 1, itemAspect = 0.78, gap = 0.26, wave = 1,
  fadeEdges = 0.12, shadow = 0.25, grayscale = false, showTitles = true,
  snap = true, autoScroll = 0, openOnClick = true, intro = true,
  onItemClick, onActiveChange, dpr, className = '', style, ...rest
}: CircularGalleryProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const engineRef = useRef<Engine | null>(null);
  const fontRef = useRef(font);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const list = Array.isArray(items) && items.length ? items : [];
  const settings: Settings = {
    items: list, bend, textColor, borderRadius: cv(borderRadius, 0, 0.5),
    scrollSpeed: Math.max(0, scrollSpeed), scrollEase: cv(scrollEase, 0.001, 1),
    itemSize: cv(itemSize, 0.2, 2), itemAspect: cv(itemAspect, 0.2, 5),
    gap: Math.max(0, gap), wave: Math.max(0, wave), fadeEdges: cv(fadeEdges, 0, 0.5),
    shadow: cv(shadow, 0, 1), grayscale, showTitles, snap, autoScroll,
    openOnClick, intro, onItemClick, onActiveChange, dpr,
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => { fontRef.current = font; engineRef.current?.wake(); }, [font]);

  useEffect(() => {
    const container = containerRef.current, canvas = canvasRef.current;
    const labelLayer = labelsRef.current, caption = captionRef.current;
    const gl = canvas?.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    if (!container || !canvas || !labelLayer || !caption || !gl) return;
    const prog = link(gl); if (!prog) return;
    const u = prog.uniforms;

    const verts: number[] = [];
    for (let y = 0; y <= SEGMENTS_Y; y++) for (let x = 0; x <= SEGMENTS_X; x++) verts.push(x / SEGMENTS_X - 0.5, y / SEGMENTS_Y - 0.5);
    const idx: number[] = [];
    for (let y = 0; y < SEGMENTS_Y; y++) for (let x = 0; x < SEGMENTS_X; x++) {
      const a = y * (SEGMENTS_X + 1) + x, b = a + 1, c = a + SEGMENTS_X + 1, d = c + 1;
      idx.push(a, b, d, a, d, c);
    }
    const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
    const blank = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, blank);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    const colorCache = new Map<string, number[]>();
    const parse = (val: string): number[] => {
      if (colorCache.has(val)) return colorCache.get(val)!;
      let rgb = [1, 1, 1];
      if (probe) { probe.clearRect(0, 0, 1, 1); probe.fillStyle = '#fff'; probe.fillStyle = val; probe.fillRect(0, 0, 1, 1); const [r, g, b] = probe.getImageData(0, 0, 1, 1).data; rgb = [r / 255, g / 255, b / 255]; }
      colorCache.set(val, rgb); return rgb;
    };

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const textures = new Map<string, TextureEntry>();
    const view = { width: 1, height: 1, ratio: 1 };
    const state: GalleryState = {
      scroll: 0, target: 0, velocity: 0, open: 0, openTarget: 0,
      intro: settingsRef.current.intro && !reduce ? 0 : 1,
      waveTime: 0, ring: 0, keyboard: false, hovered: null,
      hover: new Map(), focus: new Map(), drag: null, lastInput: 0, active: 0, spacing: 1,
    };
    let cards: Card[] = [], pool: LabelSlot[] = [], raf = 0, last = 0, visible = true, snapTimer = 0;
    let lastItems: GalleryItem[] | null = null, typing = false;

    const textureFor = (url: string): TextureEntry => {
      if (textures.has(url)) return textures.get(url)!;
      const entry: TextureEntry = { texture: null, aspect: 1, ready: 0, loaded: false };
      textures.set(url, entry);
      const img = new Image(); img.crossOrigin = 'anonymous'; img.decoding = 'async';
      img.onload = () => {
        if (!textures.has(url)) return;
        const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        if (aniso) { const mx = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT); gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, mx)); }
        entry.texture = tex; entry.aspect = img.naturalWidth / Math.max(1, img.naturalHeight); entry.loaded = true; wake();
      };
      img.src = url; return entry;
    };

    const prune = (lst: GalleryItem[]) => { const keep = new Set(lst.map(i => i.image)); textures.forEach((e, url) => { if (!keep.has(url)) { if (e.texture) gl.deleteTexture(e.texture); textures.delete(url); } }); };
    const measure = () => { const s = settingsRef.current; const h = 0.6 * view.height * s.itemSize; const w = h * s.itemAspect; const sc = Math.min(1, (view.width * 0.82) / w); return { w: w * sc, h: h * sc, spacing: w * sc * (1 + s.gap) }; };
    const arcOf = (x: number) => { const s = settingsRef.current; if (!s.bend) return { y: 0, angle: 0 }; const depth = (Math.abs(s.bend) * view.height) / WORLD_HEIGHT; const half = Math.max(view.width, view.height * 1.9) / 2; const radius = (half * half + depth * depth) / (2 * depth); const reach = Math.min(Math.abs(x), half, radius * 0.999); const arc = radius - Math.sqrt(radius * radius - reach * reach); const angle = Math.sign(x) * Math.asin(reach / radius); return s.bend > 0 ? { y: -arc, angle: -angle } : { y: arc, angle }; };
    const captionSize = () => cv(view.height * 0.045, 15, 22);
    const ensurePool = (spacing: number) => {
      const size = Math.ceil(view.width / Math.max(spacing, 1)) + 8;
      if (pool.length === size) return;
      labelLayer.replaceChildren();
      pool = Array.from({ length: size }, () => { const el = document.createElement('span'); el.className = CLASSES.label; el.style.opacity = '0'; labelLayer.appendChild(el); return { el, slot: null, font: '', text: '' }; });
    };

    const layout = (): Metrics => {
      const s = settingsRef.current; const lst = s.items; const count = lst.length;
      const { w, h, spacing } = measure(); state.spacing = spacing;
      const introEase = 1 - Math.pow(1 - state.intro, 3);
      const scroll = state.scroll + (1 - introEase) * spacing * 1.6;
      const margin = Math.max(20, Math.min(view.width, view.height) * 0.06);
      const baseLabel = h * 0.072 * fontScale(fontRef.current);
      const openFrame = (item: GalleryItem): Frame => { const aspect = textureFor(item.image).aspect || w / h; const titleSpace = item.text && s.showTitles ? captionSize() * 2.4 : 0; const captionSpace = titleSpace + (item.description ? 52 : 0); const width = Math.min(view.width - margin * 2, (view.height - margin * 2 - captionSpace) * aspect); return { width, height: width / aspect, y: captionSpace / 2, titleSpace }; };
      const activeFrame = openFrame(lst[wv(state.active, count)]);
      const spread = Math.max(0, activeFrame.width / 2 - w / 2);
      const activeX = state.active * spacing - scroll;
      const first = Math.floor((scroll - view.width / 2 - spacing * 2) / spacing);
      const last2 = Math.ceil((scroll + view.width / 2 + spacing * 2) / spacing);
      const next: Card[] = []; let lead: Card | null = null;
      for (let slot = first; slot <= last2; slot++) {
        const index = wv(slot, count); const item = lst[index]; const entry = textureFor(item.image);
        const focus = ev(state.focus.get(slot) || 0);
        let x = slot * spacing - scroll; x += Math.sign(x - activeX) * state.open * (1 - focus) * spread;
        const arc = arcOf(x); const frame = focus > 0 ? openFrame(item) : activeFrame;
        const order = Math.abs(slot * spacing - state.scroll) / spacing;
        const shown = ev(cv(state.intro * 2.2 - order * 0.22, 0, 1));
        const hover = state.hover.get(slot) || 0; const lift = 1 + hover * 0.04 * (1 - focus);
        const card: Card = { slot, index, item, entry, x: mv(x, 0, focus), y: mv(arc.y, frame.y, focus) - (1 - shown) * h * 0.18, angle: arc.angle * (1 - focus), w: mv(w, frame.width, focus) * lift, h: mv(h, frame.height, focus) * lift, radius: s.borderRadius * Math.min(w, h), alpha: shown * mv(1, 0.12, state.open * (1 - focus)), dim: state.open * (1 - focus) * 0.4, gray: s.grayscale ? 1 - Math.max(hover, focus, slot === state.active ? state.ring : 0) : 0, focus, labelAlpha: mv(1 - state.open, 1, focus), labelSize: mv(baseLabel, captionSize(), focus), frame };
        if (!lead || focus > lead.focus) lead = card; next.push(card);
      }
      next.sort((a, b) => a.focus - b.focus || Math.abs(b.x) - Math.abs(a.x)); cards = next;
      const frame = lead && lead.focus > 0 ? lead.frame : activeFrame;
      return { w, h, spacing, openH: frame.height, openY: frame.y, titleSpace: frame.titleSpace };
    };

    const draw = (metrics: Metrics) => {
      const s = settingsRef.current; const ratio = view.ratio;
      const speed = Math.min(Math.abs(state.velocity) / Math.max(metrics.spacing * 4, 1), 1);
      const wavePx = reduce ? 0 : s.wave * speed * view.height * 0.08 * ratio;
      gl.viewport(0, 0, canvas.width, canvas.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(prog.program); gl.bindVertexArray(vao);
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);
      gl.uniform1f(u.uFocal, view.height * 1.207 * ratio); gl.uniform1f(u.uWaveTime, state.waveTime);
      gl.uniform1f(u.uFade, s.fadeEdges); gl.uniform3fv(u.uPlaceholder, parse(s.textColor));
      gl.uniform3fv(u.uRingColor, parse(s.textColor)); gl.uniform1f(u.uRingWidth, 2 * ratio); gl.uniform1f(u.uRingGap, 5 * ratio);
      gl.activeTexture(gl.TEXTURE0); gl.uniform1i(u.uTexture, 0);
      const triCount = SEGMENTS_X * SEGMENTS_Y * 6; const blur = Math.max(10, metrics.h * 0.09) * ratio;
      const place = (card: Card) => { gl.uniform2f(u.uCenter, card.x * ratio, card.y * ratio); gl.uniform2f(u.uSize, card.w * ratio, card.h * ratio); gl.uniform1f(u.uAngle, card.angle); gl.uniform1f(u.uRadius, Math.min(card.radius, card.w / 2, card.h / 2) * ratio); gl.uniform1f(u.uWave, wavePx * (1 - card.focus)); gl.uniform1f(u.uAlpha, card.alpha); };
      if (s.shadow > 0) { gl.uniform1f(u.uShadow, s.shadow); gl.uniform1f(u.uBlur, blur); gl.uniform2f(u.uShadowOffset, 0, -blur * 0.45); gl.uniform1f(u.uPad, blur * 1.6); gl.bindTexture(gl.TEXTURE_2D, blank); cards.forEach(card => { place(card); gl.drawElements(gl.TRIANGLES, triCount, gl.UNSIGNED_SHORT, 0); }); }
      gl.uniform1f(u.uShadow, 0); gl.uniform1f(u.uPad, 10 * ratio);
      cards.forEach(card => { place(card); const e = card.entry; gl.bindTexture(gl.TEXTURE_2D, e.texture || blank); gl.uniform1f(u.uImageAspect, e.aspect); gl.uniform1f(u.uReady, e.ready); gl.uniform1f(u.uGray, card.gray); gl.uniform1f(u.uDim, card.dim); gl.uniform1f(u.uRing, card.slot === state.active ? state.ring * (1 - card.focus) : 0); gl.drawElements(gl.TRIANGLES, triCount, gl.UNSIGNED_SHORT, 0); });
    };

    const placeLabels = (metrics: Metrics) => {
      const s = settingsRef.current; ensurePool(metrics.spacing); const used = new Set<LabelSlot>(); const fnt = fontRef.current;
      const fade = (val: number) => { if (s.fadeEdges <= 0) return 1; const t = cv(val / s.fadeEdges, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); };
      if (s.showTitles) { cards.forEach(card => { if (!card.item.text) return; const entry = pool[wv(card.slot, pool.length)]; used.add(entry); if (entry.slot !== card.slot || entry.text !== card.item.text) { entry.slot = card.slot; entry.text = card.item.text; entry.el.textContent = card.item.text; } if (entry.font !== fnt) { entry.font = fnt; entry.el.style.font = fnt; } const size = card.labelSize; const offset = card.h / 2 + size * 1.1; const x = card.x + Math.sin(card.angle) * offset; const y = card.y - Math.cos(card.angle) * offset; const cssX = view.width / 2 + x, cssY = view.height / 2 - y; const edge = fade(cssX / view.width) * fade(1 - cssX / view.width); entry.el.style.fontSize = `${size}px`; entry.el.style.color = s.textColor; entry.el.style.transform = `translate(${cssX}px,${cssY}px) translate(-50%,-50%) rotate(${-card.angle}rad)`; entry.el.style.opacity = String(card.alpha * card.labelAlpha * mv(edge, 1, card.focus)); }); }
      pool.forEach(entry => { if (!used.has(entry) && entry.el.style.opacity !== '0') entry.el.style.opacity = '0'; });
      const top = view.height / 2 - (metrics.openY - metrics.openH / 2) + metrics.titleSpace + 4;
      caption.style.transform = `translate(-50%,${top}px)`; caption.style.opacity = String(ev(cv((state.open - 0.5) / 0.5, 0, 1))); caption.style.color = s.textColor;
      if (caption.dataset.font !== fnt) { caption.dataset.font = fnt; caption.style.font = fnt; caption.style.fontWeight = '400'; }
      caption.style.fontSize = `${captionSize() * 0.8}px`;
    };

    const nearest = () => Math.round(state.target / Math.max(state.spacing, 1));
    const setSlot = (slot: number, announce = true) => { const s = settingsRef.current; state.target = slot * state.spacing; if (slot !== state.active) { state.active = slot; const index = wv(slot, s.items.length); if (announce) setActive(index); s.onActiveChange?.(index); } wake(); };
    const openSlot = (slot: number) => { setSlot(slot); state.openTarget = 1; setOpen(true); wake(); };
    const close = () => { state.openTarget = 0; setOpen(false); wake(); };

    const frameLoop = (now: number) => {
      raf = 0; if (!visible || document.hidden) return;
      const s = settingsRef.current; const dt = last ? cv((now - last) / 1000, 0.0005, 0.05) : 1 / 60; last = now;
      if (s.items !== lastItems) { lastItems = s.items; prune(s.items); s.items.forEach(item => textureFor(item.image)); }
      const idle = now - state.lastInput > 1800;
      const auto = s.autoScroll && !reduce && !state.drag && state.open < 0.01 && state.hovered === null && !state.keyboard && idle;
      if (auto) state.target += s.autoScroll * state.spacing * 0.25 * dt;
      const follow = reduce ? 1 : 1 - Math.pow(1 - s.scrollEase, dt * 60);
      const before = state.scroll; state.scroll += (state.target - state.scroll) * follow;
      if (Math.abs(state.target - state.scroll) < 0.05) state.scroll = state.target;
      const velocity = (state.scroll - before) / dt; state.velocity += (velocity - state.velocity) * (1 - Math.exp(-dt / 0.08));
      if (Math.abs(state.velocity) < 0.5) state.velocity = 0;
      state.waveTime += dt * 2.4;
      const openFollow = reduce ? 1 : 1 - Math.exp(-dt / 0.14); state.open += (state.openTarget - state.open) * openFollow;
      if (Math.abs(state.openTarget - state.open) < 0.001) state.open = state.openTarget;
      state.ring += ((state.keyboard ? 1 : 0) - state.ring) * (1 - Math.exp(-dt / 0.1));
      if (Math.abs((state.keyboard ? 1 : 0) - state.ring) < 0.002) state.ring = state.keyboard ? 1 : 0;
      if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS);
      let settling = false;
      state.hover.forEach((value, slot) => { const goal = slot === state.hovered ? 1 : 0; const next = value + (goal - value) * (1 - Math.exp(-dt / 0.12)); if (Math.abs(goal - next) < 0.002) { if (goal === 0) state.hover.delete(slot); else state.hover.set(slot, 1); } else { state.hover.set(slot, next); settling = true; } });
      if (state.openTarget > 0 && !state.focus.has(state.active)) state.focus.set(state.active, 0);
      state.focus.forEach((value, slot) => { const goal = state.openTarget > 0 && slot === state.active ? 1 : 0; const next = reduce ? goal : value + (goal - value) * (1 - Math.exp(-dt / 0.16)); if (Math.abs(goal - next) < 0.001) { if (goal === 0) state.focus.delete(slot); else state.focus.set(slot, 1); } else { state.focus.set(slot, next); settling = true; } });
      textures.forEach(entry => { if (!entry.loaded || entry.ready >= 1) return; entry.ready = reduce ? 1 : Math.min(1, entry.ready + dt / 0.45); settling = true; });
      const slot = auto ? Math.round(state.scroll / Math.max(state.spacing, 1)) : nearest();
      if (slot !== state.active && !state.drag) { state.active = slot; const index = wv(slot, s.items.length); setActive(index); s.onActiveChange?.(index); }
      const metrics = layout(); draw(metrics); placeLabels(metrics);
      const moving = (s.autoScroll && !reduce) || state.scroll !== state.target || state.velocity !== 0 || state.open !== state.openTarget || state.intro < 1 || (state.ring !== 0 && state.ring !== 1) || settling;
      if (moving) raf = requestAnimationFrame(frameLoop); else last = 0;
    };

    function wake() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frameLoop); }

    const resize = () => { const s = settingsRef.current; view.width = Math.max(1, container.clientWidth); view.height = Math.max(1, container.clientHeight); view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2); canvas.width = Math.max(1, Math.round(view.width * view.ratio)); canvas.height = Math.max(1, Math.round(view.height * view.ratio)); const before = state.spacing; const { spacing } = measure(); if (before > 1 && spacing !== before) { state.scroll = (state.scroll / before) * spacing; state.target = (state.target / before) * spacing; } state.spacing = spacing; wake(); };
    const point = (e: PointerEvent): Point => { const r = container.getBoundingClientRect(); return { x: e.clientX - r.left - r.width / 2, y: r.height / 2 - (e.clientY - r.top) }; };
    const hit = ({ x, y }: Point): Card | null => { for (let i = cards.length - 1; i >= 0; i--) { const card = cards[i]; if (card.alpha < 0.05) continue; const dx = x - card.x, dy = y - card.y; const c2 = Math.cos(-card.angle), s2 = Math.sin(-card.angle); const lx = c2 * dx - s2 * dy, ly = s2 * dx + c2 * dy; if (Math.abs(lx) <= card.w / 2 && Math.abs(ly) <= card.h / 2) return card; } return null; };
    const setPointer = (card: Card | null) => { const slot = card ? card.slot : null; if (slot !== state.hovered) { state.hovered = slot; if (slot !== null && !state.hover.has(slot)) state.hover.set(slot, 0); wake(); } if (card) container.setAttribute('data-pointer', ''); else container.removeAttribute('data-pointer'); };
    const snapNow = () => { const s = settingsRef.current; if (!s.snap && state.open < 0.5) return; setSlot(nearest()); };

    const onPointerDown = (e: PointerEvent) => { if (e.button !== 0 || (e.target as Element).closest('[data-gallery-close]')) return; const p = point(e); state.drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, start: state.target, moved: false, samples: [], p }; state.lastInput = performance.now(); wake(); };
    const onPointerMove = (e: PointerEvent) => { const drag = state.drag; if (drag && drag.id === e.pointerId) { const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0; if (!drag.moved && Math.hypot(dx, dy) > 6) { if (Math.abs(dy) > Math.abs(dx) && e.pointerType !== 'mouse') { state.drag = null; return; } drag.moved = true; container.setPointerCapture?.(e.pointerId); container.setAttribute('data-dragging', ''); setPointer(null); } if (drag.moved) { state.target = drag.start - dx * (settingsRef.current.scrollSpeed / 2); drag.samples.push({ x: e.clientX, t: performance.now() }); if (drag.samples.length > 6) drag.samples.shift(); state.lastInput = performance.now(); wake(); } return; } if (e.pointerType === 'mouse') setPointer(hit(point(e))); };
    const onPointerUp = (e: PointerEvent) => { const drag = state.drag; if (!drag || drag.id !== e.pointerId) return; state.drag = null; container.removeAttribute('data-dragging'); if (container.hasPointerCapture?.(e.pointerId)) container.releasePointerCapture(e.pointerId); if (drag.moved) { const samples = drag.samples; if (samples.length > 1) { const a = samples[0], b = samples[samples.length - 1]; const span = Math.max(b.t - a.t, 16); state.target -= ((b.x - a.x) / span) * 1000 * 0.18 * (settingsRef.current.scrollSpeed / 2); } snapNow(); return; } const card = hit(drag.p); const s = settingsRef.current; if (!card) { if (state.open > 0.5) close(); return; } s.onItemClick?.(card.item, card.index); if (!s.openOnClick) { setSlot(card.slot); return; } if (state.open > 0.5 && card.slot === state.active) close(); else openSlot(card.slot); };
    const onPointerCancel = (e: PointerEvent) => { if (state.drag && state.drag.id === e.pointerId) { state.drag = null; container.removeAttribute('data-dragging'); snapNow(); } };
    const onPointerLeave = () => setPointer(null);
    const onWheel = (e: WheelEvent) => { const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? view.height : 1; const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY; if (!delta) return; e.preventDefault(); state.target += delta * unit * (settingsRef.current.scrollSpeed / 2); state.lastInput = performance.now(); clearTimeout(snapTimer); snapTimer = window.setTimeout(snapNow, 140); wake(); };
    const onKeyDown = (e: KeyboardEvent) => { const s = settingsRef.current; const step = STEPS[e.key]; state.lastInput = performance.now(); if (step) { e.preventDefault(); if (container.contains(document.activeElement) && document.activeElement !== container) state.keyboard = true; setSlot(nearest() + step); const index = wv(state.active, s.items.length); if (container.contains(document.activeElement)) buttonsRef.current[index]?.focus({ preventScroll: true }); return; } if (e.key === 'Escape' && state.openTarget > 0) { e.preventDefault(); close(); } };
    const onFocusIn = (e: FocusEvent) => { const target = e.target as Element; if (!target.closest('[data-gallery-list]')) return; state.keyboard = typing || target.matches(':focus-visible'); wake(); };
    const onAnyKey = (e: KeyboardEvent) => { if (e.key === 'Tab' || e.key.startsWith('Arrow')) typing = true; };
    const onAnyPointer = () => { typing = false; };
    const onFocusOut = (e: FocusEvent) => { if (container.contains(e.relatedTarget as Node | null)) return; state.keyboard = false; wake(); };
    const onVisibility = () => { last = 0; wake(); };

    const ro = new ResizeObserver(resize); ro.observe(container);
    const io = new IntersectionObserver(entries => { visible = entries.some(e => e.isIntersecting); if (visible) { last = 0; wake(); } }); io.observe(container);
    container.addEventListener('pointerdown', onPointerDown); container.addEventListener('pointermove', onPointerMove); container.addEventListener('pointerup', onPointerUp); container.addEventListener('pointercancel', onPointerCancel); container.addEventListener('pointerleave', onPointerLeave); container.addEventListener('wheel', onWheel, { passive: false }); container.addEventListener('keydown', onKeyDown); container.addEventListener('focusin', onFocusIn); container.addEventListener('focusout', onFocusOut);
    document.addEventListener('visibilitychange', onVisibility); document.addEventListener('keydown', onAnyKey, true); document.addEventListener('pointerdown', onAnyPointer, true);
    lastItems = settingsRef.current.items; lastItems.forEach(item => textureFor(item.image)); resize();

    const slotFor = (index: number) => { const count = settingsRef.current.items.length; const slot = nearest(); const base = slot - wv(slot, count) + index; return [base - count, base, base + count].reduce((best, val) => Math.abs(val - slot) < Math.abs(best - slot) ? val : best); };
    engineRef.current = { wake, open: index => openSlot(slotFor(index)), focus: index => setSlot(slotFor(index), false), close };

    return () => {
      cancelAnimationFrame(raf); clearTimeout(snapTimer); engineRef.current = null; ro.disconnect(); io.disconnect();
      container.removeEventListener('pointerdown', onPointerDown); container.removeEventListener('pointermove', onPointerMove); container.removeEventListener('pointerup', onPointerUp); container.removeEventListener('pointercancel', onPointerCancel); container.removeEventListener('pointerleave', onPointerLeave); container.removeEventListener('wheel', onWheel); container.removeEventListener('keydown', onKeyDown); container.removeEventListener('focusin', onFocusIn); container.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('visibilitychange', onVisibility); document.removeEventListener('keydown', onAnyKey, true); document.removeEventListener('pointerdown', onAnyPointer, true);
      labelLayer.replaceChildren(); textures.forEach(entry => entry.texture && gl.deleteTexture(entry.texture));
      if (blank) gl.deleteTexture(blank); gl.deleteProgram(prog.program);
      if (vb) gl.deleteBuffer(vb); if (ib) gl.deleteBuffer(ib); if (vao) gl.deleteVertexArray(vao);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  useEffect(() => { engineRef.current?.wake(); });

  const count = list.length;
  const current = list[active % Math.max(count, 1)] || list[0];

  return (
    <div ref={containerRef} className={`${CLASSES.root}${className ? ` ${className}` : ''}`} style={{ color: textColor, ...style }} role="region" aria-roledescription="carousel" aria-label="Jewel gallery" {...rest}>
      <canvas ref={canvasRef} className={CLASSES.canvas} aria-hidden="true" />
      <div ref={labelsRef} className={CLASSES.labels} aria-hidden="true" />
      <div ref={captionRef} className={CLASSES.caption} aria-hidden={!open}>
        {current?.description && <p className={CLASSES.captionText}>{current.description}</p>}
      </div>
      <button type="button" className={CLASSES.close} data-gallery-close="" data-visible={open ? '' : undefined} tabIndex={open ? 0 : -1} aria-label="Close" onClick={() => engineRef.current?.close()}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
      </button>
      <ul className={CLASSES.hidden} data-gallery-list="">
        {list.map((item, index) => (
          <li key={`${item.image}-${index}`}>
            <button type="button" ref={el => { buttonsRef.current[index] = el; }} tabIndex={index === active ? 0 : -1} aria-label={`${item.text || item.alt || 'Jewel'}, ${index + 1} of ${count}`} aria-current={index === active ? 'true' : undefined} onFocus={() => engineRef.current?.focus(index)} onClick={() => engineRef.current?.open(index)}>{item.text || item.alt || `Jewel ${index + 1}`}</button>
          </li>
        ))}
      </ul>
      <div className={CLASSES.hidden} aria-live="polite">{open && current ? `${current.text || current.alt || 'Jewel'} opened` : ''}</div>
    </div>
  );
};

export default CircularGallery;
