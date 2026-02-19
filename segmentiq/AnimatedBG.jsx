// ─── DROP THIS INTO YOUR App.jsx ─────────────────────────────────────────
// Replace the existing Orbs() function with this entire AnimatedBG component
// Then in the App shell, replace <Orbs/> with <AnimatedBG/>

import { useEffect, useRef } from "react";

export default function AnimatedBG() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -1000, y: -1000 });
  const frame = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // ── Particles ──────────────────────────────────────────────────────────
    const PARTICLE_COUNT = 90;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.5 + 0.1,
      // hue varies from purple to violet to indigo
      hue: 250 + Math.random() * 60,
    }));

    // ── Aurora blobs ───────────────────────────────────────────────────────
    const blobs = [
      { x: W * 0.15, y: H * 0.25, r: 380, vx: 0.18, vy: 0.12, hue: 265, alpha: 0.13 },
      { x: W * 0.75, y: H * 0.65, r: 320, vx: -0.14, vy: -0.1,  hue: 285, alpha: 0.10 },
      { x: W * 0.5,  y: H * 0.1,  r: 260, vx: 0.10, vy: 0.16,  hue: 310, alpha: 0.08 },
      { x: W * 0.85, y: H * 0.3,  r: 200, vx: -0.08, vy: 0.12,  hue: 245, alpha: 0.09 },
      { x: W * 0.2,  y: H * 0.8,  r: 280, vx: 0.12, vy: -0.09, hue: 275, alpha: 0.08 },
    ];

    // ── Grid lines (subtle mesh) ───────────────────────────────────────────
    const GRID_SPACING = 80;
    let gridOffset = 0;

    // ── Mouse reactive spotlight ───────────────────────────────────────────
    let spotX = W / 2, spotY = H / 2;
    let spotTargetX = W / 2, spotTargetY = H / 2;

    const onMove = (e) => {
      spotTargetX = e.clientX;
      spotTargetY = e.clientY;
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", onResize);

    // ── Draw ───────────────────────────────────────────────────────────────
    let t = 0;

    function draw() {
      t += 0.008;
      gridOffset = (gridOffset + 0.15) % GRID_SPACING;

      // Lerp spotlight toward mouse
      spotX += (spotTargetX - spotX) * 0.06;
      spotY += (spotTargetY - spotY) * 0.06;

      // Clear
      ctx.fillStyle = "#0c0820";
      ctx.fillRect(0, 0, W, H);

      // ── 1. Aurora blobs ──────────────────────────────────────────────────
      blobs.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        // bounce
        if (b.x < -b.r || b.x > W + b.r) b.vx *= -1;
        if (b.y < -b.r || b.y > H + b.r) b.vy *= -1;

        const pulse = 1 + 0.08 * Math.sin(t * 1.5 + b.hue);
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * pulse);
        grad.addColorStop(0, `hsla(${b.hue},80%,60%,${b.alpha})`);
        grad.addColorStop(0.5, `hsla(${b.hue},70%,50%,${b.alpha * 0.5})`);
        grad.addColorStop(1, `hsla(${b.hue},60%,40%,0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── 2. Aurora wave bands ─────────────────────────────────────────────
      for (let band = 0; band < 3; band++) {
        const bandY = H * (0.25 + band * 0.28);
        const amp = 60 + band * 20;
        const freq = 0.004 - band * 0.001;
        const speed = t * (0.4 + band * 0.15);

        ctx.beginPath();
        ctx.moveTo(0, bandY);
        for (let x = 0; x <= W; x += 4) {
          const y = bandY + Math.sin(x * freq + speed) * amp
                          + Math.sin(x * freq * 2.3 + speed * 1.4) * (amp * 0.4);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H + 200);
        ctx.lineTo(0, H + 200);
        ctx.closePath();

        const waveGrad = ctx.createLinearGradient(0, bandY - amp, 0, bandY + amp * 2);
        const hue = 260 + band * 25;
        waveGrad.addColorStop(0, `hsla(${hue},75%,55%,0.06)`);
        waveGrad.addColorStop(0.5, `hsla(${hue},65%,45%,0.03)`);
        waveGrad.addColorStop(1, `hsla(${hue},55%,35%,0)`);
        ctx.fillStyle = waveGrad;
        ctx.fill();
      }

      // ── 3. Subtle grid mesh ──────────────────────────────────────────────
      ctx.strokeStyle = "rgba(167,139,250,0.04)";
      ctx.lineWidth = 1;
      // vertical lines
      for (let x = (-gridOffset % GRID_SPACING); x < W; x += GRID_SPACING) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      // horizontal lines
      for (let y = (-gridOffset % GRID_SPACING); y < H; y += GRID_SPACING) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // ── 4. Mouse spotlight ───────────────────────────────────────────────
      const spotGrad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, 280);
      spotGrad.addColorStop(0, "rgba(139,92,246,0.10)");
      spotGrad.addColorStop(0.4, "rgba(124,58,237,0.05)");
      spotGrad.addColorStop(1, "rgba(109,40,217,0)");
      ctx.fillStyle = spotGrad;
      ctx.fillRect(0, 0, W, H);

      // ── 5. Particles ─────────────────────────────────────────────────────
      const mx = mouse.current.x;
      const my = mouse.current.y;

      particles.forEach((p, i) => {
        // mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.vx += (dx / dist) * force * 0.6;
          p.vy += (dy / dist) * force * 0.6;
        }

        // dampen velocity
        p.vx *= 0.98;
        p.vy *= 0.98;

        p.x += p.vx;
        p.y += p.vy;

        // wrap edges
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        // breathe alpha
        const a = p.alpha * (0.7 + 0.3 * Math.sin(t * 2 + i * 0.4));

        // draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},80%,75%,${a})`;
        ctx.fill();

        // draw connections to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cx2 = p.x - p2.x;
          const cy2 = p.y - p2.y;
          const d = Math.sqrt(cx2 * cx2 + cy2 * cy2);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `hsla(${p.hue},70%,70%,${(1 - d / 100) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      // ── 6. Scanline noise overlay ─────────────────────────────────────────
      if (Math.floor(t * 60) % 3 === 0) {
        const noiseY = Math.random() * H;
        ctx.fillStyle = "rgba(255,255,255,0.015)";
        ctx.fillRect(0, noiseY, W, 1);
      }

      frame.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}
