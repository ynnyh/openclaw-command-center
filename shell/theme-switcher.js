(function() {
  var CRANE_SVG = '<svg viewBox="0 0 60 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M2,14 C6,8 12,5 18,9 C20,4 26,2 32,6 C34,5 38,4 42,6 C44,3 48,2 54,5 ' +
    'C52,6 48,8 44,9 C46,10 48,13 46,15 L38,12 L30,14 L22,11 L14,14 L6,12 C4,13 2,14 2,14Z"/></svg>';

  var WAVE_SVG = '<svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path fill="currentColor" d="M0,40 C120,20 240,60 360,40 C480,20 600,60 720,40 ' +
    'C840,20 960,60 1080,40 C1200,20 1320,60 1440,40 L1440,80 L0,80 Z"/></svg>';

  var THEMES = [
    { id: 'shanshui', name: '山水',  desc: '水墨仙境',   color: '#6fc4a8', colorLight: '#2d7d6b',
      anims: ['cranes', 'mist', 'water'], mistColor: 'rgba(111,196,168,0.4)', particleColor: null },
    { id: 'taohua',   name: '桃花',  desc: '桃源春色',   color: '#e8899e', colorLight: '#c95c72',
      anims: ['petals', 'mist'],           mistColor: 'rgba(232,137,158,0.35)', particleColor: null },
    { id: 'qingci',   name: '青瓷',  desc: '雨过天青',   color: '#7ec8b0', colorLight: '#3a8a72',
      anims: ['mist', 'water', 'particles'], mistColor: 'rgba(126,200,176,0.35)', particleColor: '#7ec8b0' }
  ];

  var link  = document.getElementById('theme-css');
  var btn   = document.getElementById('theme-switcher-btn');
  var panel = document.getElementById('theme-panel');
  var animLayer = null;

  // Init: apply saved theme
  var saved = localStorage.getItem('oc-theme');
  if (saved && saved !== getCurrent()) {
    link.href = './assets/theme-' + saved + '.css';
  }
  // Defer animation setup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { applyAnimations(getThemeObj(getCurrent())); });
  } else {
    applyAnimations(getThemeObj(getCurrent()));
  }

  function getCurrent() {
    var m = link.href.match(/theme-([^.]+)\.css/);
    return m ? m[1] : 'shanshui';
  }

  function getThemeObj(id) {
    for (var i = 0; i < THEMES.length; i++) { if (THEMES[i].id === id) return THEMES[i]; }
    return THEMES[0];
  }

  function ensureAnimLayer() {
    if (!animLayer) {
      animLayer = document.createElement('div');
      animLayer.id = 'anim-layer';
      document.body.insertBefore(animLayer, document.body.firstChild);
    }
    return animLayer;
  }

  function clearAnimations() {
    if (animLayer) { animLayer.innerHTML = ''; }
  }

  function createCranes() {
    var layer = ensureAnimLayer();
    for (var i = 1; i <= 4; i++) {
      var el = document.createElement('div');
      el.className = 'crane crane--' + i;
      el.innerHTML = CRANE_SVG;
      layer.appendChild(el);
    }
  }

  function createPetals() {
    var layer = ensureAnimLayer();
    for (var i = 0; i < 12; i++) {
      var el = document.createElement('div');
      el.className = 'petal';
      layer.appendChild(el);
    }
  }

  function createWater(theme) {
    var layer = ensureAnimLayer();
    var wrap = document.createElement('div');
    wrap.id = 'water-wave';
    wrap.innerHTML = WAVE_SVG;
    layer.appendChild(wrap);
  }

  function createMist(theme) {
    var layer = ensureAnimLayer();
    var color = theme.mistColor || 'rgba(255,255,255,0.3)';
    for (var i = 1; i <= 3; i++) {
      var el = document.createElement('div');
      el.className = 'mist mist--' + i;
      el.style.background = color;
      layer.appendChild(el);
    }
  }

  function createParticles(theme) {
    var layer = ensureAnimLayer();
    var color = theme.particleColor || '#7ec8b0';
    for (var i = 0; i < 8; i++) {
      var el = document.createElement('div');
      el.className = 'particle';
      el.style.background = color;
      layer.appendChild(el);
    }
  }

  function applyAnimations(theme) {
    ensureAnimLayer();
    clearAnimations();
    if (!theme || !theme.anims) return;
    theme.anims.forEach(function(a) {
      switch(a) {
        case 'cranes':    createCranes(); break;
        case 'petals':    createPetals(); break;
        case 'water':     createWater(theme); break;
        case 'mist':      createMist(theme); break;
        case 'particles': createParticles(theme); break;
      }
    });
  }

  function switchTheme(id) {
    link.href = './assets/theme-' + id + '.css';
    localStorage.setItem('oc-theme', id);
    applyAnimations(getThemeObj(id));
    render();
  }

  function render() {
    var cur = getCurrent();
    var items = panel.querySelectorAll('.tp-item');
    for (var i = 0; i < items.length; i++) items[i].remove();

    THEMES.forEach(function(t) {
      var div = document.createElement('div');
      div.className = 'tp-item' + (t.id === cur ? ' active' : '');

      var dot = document.createElement('span');
      dot.className = 'tp-dot';
      dot.style.background = t.color;
      dot.style.borderColor = t.color + '40';

      var nameWrap = document.createElement('span');
      nameWrap.className = 'tp-name';
      nameWrap.textContent = t.name;

      var desc = document.createElement('span');
      desc.className = 'tp-desc';
      desc.textContent = t.desc;
      nameWrap.appendChild(desc);

      var check = document.createElement('span');
      check.className = 'tp-check';
      check.textContent = '\u2713';

      div.appendChild(dot);
      div.appendChild(nameWrap);
      div.appendChild(check);

      div.addEventListener('click', function() { switchTheme(t.id); });
      panel.appendChild(div);
    });
  }

  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    var open = panel.classList.toggle('show');
    btn.classList.toggle('open', open);
    if (open) render();
  });

  document.addEventListener('click', function(e) {
    if (!panel.contains(e.target) && e.target !== btn) {
      panel.classList.remove('show');
      btn.classList.remove('open');
    }
  });

  render();
})();
