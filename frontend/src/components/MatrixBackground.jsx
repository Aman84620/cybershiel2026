import { useEffect, useRef } from 'react';
import './MatrixBackground.css';

export default function MatrixBackground({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let columns;
    let drops;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const fontSize = 14;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array(columns).fill(1);
    }

    resize();
    window.addEventListener('resize', resize);

    const chars = '01';
    const fontSize = 14;

    function draw() {
      const isDark = theme === 'dark';
      ctx.fillStyle = isDark ? 'rgba(10, 15, 13, 0.06)' : 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        const alpha = isDark ? 0.15 + Math.random() * 0.1 : 0.08 + Math.random() * 0.06;
        ctx.fillStyle = isDark
          ? `rgba(0, 255, 136, ${alpha})`
          : `rgba(5, 150, 105, ${alpha})`;
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="matrix-bg" />;
}
