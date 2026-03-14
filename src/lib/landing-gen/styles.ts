// src/lib/landing-gen/styles.ts
// Inline CSS for generated landing pages — self-contained, responsive

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
}

/**
 * Generate the full inline CSS for a landing page using the business's brand colors.
 */
export function generateStyles(colors: BrandColors): string {
  return `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth;font-size:16px}
    body{
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
      line-height:1.6;color:#1a1a2e;background:#fff;
      -webkit-font-smoothing:antialiased;
    }

    /* Layout */
    .container{max-width:1120px;margin:0 auto;padding:0 24px}

    /* Hero */
    .hero{
      background:linear-gradient(135deg,${colors.primary} 0%,${colors.secondary} 100%);
      color:#fff;padding:96px 24px 80px;text-align:center;
      position:relative;overflow:hidden;
    }
    .hero::after{
      content:'';position:absolute;bottom:-2px;left:0;right:0;height:48px;
      background:#fff;clip-path:ellipse(55% 100% at 50% 100%);
    }
    .hero h1{font-size:clamp(2rem,5vw,3.25rem);font-weight:800;line-height:1.15;margin-bottom:16px;letter-spacing:-0.02em}
    .hero p{font-size:clamp(1rem,2.5vw,1.25rem);opacity:.9;max-width:640px;margin:0 auto 32px}
    .hero .cta-btn{
      display:inline-block;background:${colors.accent};color:#fff;
      padding:16px 40px;border-radius:8px;font-size:1.125rem;font-weight:700;
      text-decoration:none;transition:transform .2s,box-shadow .2s;
      box-shadow:0 4px 14px rgba(0,0,0,.25);
    }
    .hero .cta-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.3)}
    .hero .cta-sub{display:block;margin-top:12px;font-size:.875rem;opacity:.75}

    /* Features */
    .features{padding:80px 24px;background:#fff}
    .features h2{text-align:center;font-size:clamp(1.5rem,3vw,2.25rem);font-weight:700;margin-bottom:48px;color:${colors.primary}}
    .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:32px;max-width:1120px;margin:0 auto}
    .feature-card{
      padding:32px;border-radius:12px;border:1px solid #e8e8f0;
      transition:transform .2s,box-shadow .2s;
    }
    .feature-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.08)}
    .feature-icon{
      width:48px;height:48px;border-radius:10px;
      background:${colors.primary}15;color:${colors.primary};
      display:flex;align-items:center;justify-content:center;
      font-size:1.5rem;margin-bottom:16px;
    }
    .feature-card h3{font-size:1.125rem;font-weight:600;margin-bottom:8px;color:#1a1a2e}
    .feature-card p{font-size:.9375rem;color:#555;line-height:1.65}

    /* Social Proof */
    .social-proof{padding:64px 24px;background:${colors.primary}08}
    .social-proof h2{text-align:center;font-size:clamp(1.5rem,3vw,2rem);font-weight:700;margin-bottom:40px;color:${colors.primary}}
    .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:24px;max-width:800px;margin:0 auto}
    .stat{text-align:center}
    .stat-value{font-size:clamp(2rem,4vw,2.75rem);font-weight:800;color:${colors.accent};line-height:1.1}
    .stat-label{font-size:.875rem;color:#666;margin-top:4px}

    /* About */
    .about{padding:80px 24px;background:#fff}
    .about .container{max-width:720px}
    .about h2{font-size:clamp(1.5rem,3vw,2rem);font-weight:700;margin-bottom:24px;color:${colors.primary}}
    .about p{font-size:1rem;color:#444;margin-bottom:16px;line-height:1.75}

    /* Final CTA */
    .final-cta{
      padding:80px 24px;text-align:center;
      background:linear-gradient(135deg,${colors.primary} 0%,${colors.secondary} 100%);
      color:#fff;
    }
    .final-cta h2{font-size:clamp(1.5rem,3vw,2.25rem);font-weight:700;margin-bottom:12px}
    .final-cta p{font-size:1.125rem;opacity:.85;margin-bottom:32px;max-width:560px;margin-left:auto;margin-right:auto}
    .final-cta .cta-btn{
      display:inline-block;background:${colors.accent};color:#fff;
      padding:16px 40px;border-radius:8px;font-size:1.125rem;font-weight:700;
      text-decoration:none;transition:transform .2s,box-shadow .2s;
      box-shadow:0 4px 14px rgba(0,0,0,.25);
    }
    .final-cta .cta-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.3)}
    .final-cta .contact-info{margin-top:16px;font-size:.9375rem;opacity:.7}

    /* Forge Badge */
    .forge-badge{
      text-align:center;padding:24px;background:#0B1120;color:#aaa;
      font-size:.8125rem;
    }
    .forge-badge a{color:#D4A537;text-decoration:none;font-weight:600}
    .forge-badge a:hover{text-decoration:underline}

    /* Mobile */
    @media(max-width:640px){
      .hero{padding:64px 20px 56px}
      .features,.about,.final-cta{padding:56px 20px}
      .features-grid{grid-template-columns:1fr;gap:20px}
      .stats-grid{grid-template-columns:repeat(2,1fr);gap:16px}
    }
  `;
}
