const API_URL = "http://localhost:8000/predict";
let lastEmailId = null;

function getEmailData() {
  const subject = document.querySelector('h2.hP')?.innerText || '';
  const sender  = document.querySelector('.gD')?.getAttribute('email') || '';
  const body = (
    document.querySelector('.a3s.aiL')?.innerText ||
    document.querySelector('.a3s')?.innerText ||
    document.querySelector('.ii.gt div')?.innerText ||
    ''
  );
  return { subject, sender, body };
}

function removeBanner() {
  document.getElementById('phishing-banner')?.remove();
}

function layerBar(label, raw, weight, weighted) {
  const pct = Math.min(100, raw);
  const barColor = raw > 60 ? '#ea4335' : raw > 30 ? '#fbbc04' : '#34a853';
  return `
    <div style="margin:6px 0">
      <div style="display:flex; justify-content:space-between; font-size:11px; color:#444; margin-bottom:2px">
        <span>${label} (${weight}% weight)</span>
        <span>${raw}/100 to contributes ${weighted}</span>
      </div>
      <div style="background:#e0e0e0; border-radius:4px; height:6px; overflow:hidden">
        <div style="background:${barColor}; height:100%; width:${pct}%"></div>
      </div>
    </div>
  `;
}

function showBanner(data) {
  removeBanner();
  const colors = {
    'Safe':       { bg:'#e6f4ea', border:'#34a853', text:'#1e8e3e', icon:'OK' },
    'Suspicious': { bg:'#fef7e0', border:'#fbbc04', text:'#e37400', icon:'!' },
    'Phishing':   { bg:'#fce8e6', border:'#ea4335', text:'#c5221f', icon:'X' },
  };
  const c = colors[data.prediction] || colors['Suspicious'];

  const banner = document.createElement('div');
  banner.id = 'phishing-banner';
  banner.style.cssText = `
    position:sticky; top:0; z-index:9999; padding:12px 16px;
    background:${c.bg}; border-left:4px solid ${c.border};
    font-family:Arial,sans-serif; font-size:14px; color:${c.text};
  `;

  const reasonsHtml = (data.suspicious_indicators || [])
    .map(r => `<li style="margin:2px 0">${r}</li>`).join('');
  const trustedHtml = (data.trusted_indicators || [])
    .map(r => `<li style="margin:2px 0">${r}</li>`).join('');

  const bd = data.layer_breakdown || {};
  let layersHtml = '';
  if (bd && bd.domain_check) {
    layersHtml = `
      <div style="margin-top:10px; padding-top:8px; border-top:1px solid #ddd">
        <b style="font-size:12px">Score Breakdown (Total: ${data.classification}):</b>
        ${layerBar('Sender/Domain Trust', bd.domain_check.raw_score, bd.domain_check.weight, bd.domain_check.weighted)}
        ${layerBar('Credential Request Detection', bd.credential_check.raw_score, bd.credential_check.weight, bd.credential_check.weighted)}
        ${layerBar('AI Semantic Understanding', bd.semantic_check.raw_score, bd.semantic_check.weight, bd.semantic_check.weighted)}
        ${layerBar('URL Analysis', bd.url_check.raw_score, bd.url_check.weight, bd.url_check.weighted)}
        ${layerBar('Behavioral Signals', bd.behavior_check.raw_score, bd.behavior_check.weight, bd.behavior_check.weighted)}
      </div>
    `;
  }

  const ruleHtml = data.deciding_rule ? `
    <div style="margin-top:8px; padding:6px 8px; background:rgba(0,0,0,0.05); border-radius:4px; font-size:11px">
      <b>Rule applied:</b> ${data.deciding_rule}
    </div>
  ` : '';

  banner.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px; cursor:pointer" id="banner-header">
      <span style="font-size:18px">${c.icon}</span>
      <strong>${data.prediction}</strong>
      <span style="color:#666;font-size:12px">Risk Score: ${data.classification}</span>
      <span style="color:#666;font-size:12px">| Sender: ${data.sender_domain}</span>
      <span style="color:#888;font-size:11px; margin-left:4px">(click for details)</span>
      <span style="margin-left:auto;cursor:pointer;font-size:18px;color:#888" id="banner-close">x</span>
    </div>
    <div id="banner-details" style="display:none; margin-top:8px; font-size:12px; line-height:1.5;">
      ${reasonsHtml ? `<div><b>Suspicious indicators:</b><ul style="margin:4px 0 8px 18px; padding:0">${reasonsHtml}</ul></div>` : ''}
      ${trustedHtml ? `<div><b>Trusted signals:</b><ul style="margin:4px 0 8px 18px; padding:0">${trustedHtml}</ul></div>` : ''}
      ${layersHtml}
      ${ruleHtml}
    </div>
  `;

  const emailView = document.querySelector('.nH') || document.body;
  emailView.prepend(banner);

  const closeBtn = document.getElementById('banner-close');
  if (closeBtn) {
    closeBtn.onclick = function(e) {
      e.stopPropagation();
      removeBanner();
    };
  }

  const header = document.getElementById('banner-header');
  if (header) {
    header.onclick = function() {
      const details = document.getElementById('banner-details');
      if (details) {
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
      }
    };
  }
}

async function analyzeEmail() {
  const data1 = getEmailData();
  const subject = data1.subject;
  const sender = data1.sender;
  const body = data1.body;

  if (!subject && !sender) return;

  const emailId = subject + sender;
  if (emailId === lastEmailId) return;
  lastEmailId = emailId;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: subject, sender: sender, body: body })
    });
    const data = await res.json();
    console.log('Smart Phishing Detector result:', data);
    showBanner(data);
    chrome.storage.local.set({ lastResult: data });
  } catch (err) {
    console.error('Phishing detector error:', err);
  }
}

const observer = new MutationObserver(function() {
  if (document.querySelector('h2.hP')) analyzeEmail();
});
observer.observe(document.body, { childList: true, subtree: true });
