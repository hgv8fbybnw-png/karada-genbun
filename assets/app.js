/* からだの原文 ／ 画面まわりの世話だけをする。本文は1文字もここで作らない。
   ・スクロールの監視は IntersectionObserver だけ（scroll の毎フレーム処理は使わない／P-22）
   ・しきい値は 0。高さを切る仕掛けは使わない（高さ0に切ると、画面に入った割合が
     いつまでも 0 と答えられて、本文が一生出てこなくなる）
   ・動きを止めている人には、最初から「動き終わった状態」で見せる（R-10） */
(function () {
  'use strict';
  var tomeru = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ① 画面の高さを取り直す。iPhone のアドレスバーで画面がガタつくのを止める（P-14／R-09） */
  function takasa() {
    document.documentElement.style.setProperty('--stable-lvh', (window.innerHeight / 100) + 'px');
  }
  takasa();
  window.addEventListener('resize', takasa, { passive: true });
  window.addEventListener('orientationchange', takasa, { passive: true });

  /* ② 出てくるもの。属性を付け替えるだけで、見た目は CSS が決める */
  var deru = document.querySelectorAll('[data-rv],[data-hira],[data-zu]');
  if (tomeru || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(deru, function (e) {
      if (e.hasAttribute('data-rv')) e.setAttribute('data-rv', 'in');
      if (e.hasAttribute('data-hira')) e.setAttribute('data-hira', 'in');
      if (e.hasAttribute('data-zu')) e.setAttribute('data-zu', 'in');
    });
  } else {
    var me = new IntersectionObserver(function (list) {
      list.forEach(function (r) {
        if (!r.isIntersecting) return;
        var e = r.target;
        if (e.hasAttribute('data-rv')) e.setAttribute('data-rv', 'in');
        if (e.hasAttribute('data-hira')) e.setAttribute('data-hira', 'in');
        if (e.hasAttribute('data-zu')) { e.setAttribute('data-zu', 'in'); kazoeru(e); }
        me.unobserve(e);
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(deru, function (e) { me.observe(e); });
  }

  /* ③ 数が 0 から本当の値まで育つ。値は HTML に書いてあるものをそのまま使う
        （JavaScript が動かなくても、正しい数字が最初から出ている） */
  function kazoeru(oya) {
    if (tomeru) return;
    var tama = oya.querySelectorAll('[data-kazu]');
    Array.prototype.forEach.call(tama, function (e) {
      var owari = parseFloat(e.getAttribute('data-kazu'));
      if (!isFinite(owari)) return;
      var keta = (e.getAttribute('data-keta') | 0);
      var moji = e.textContent;
      var hajime = performance.now(), naga = 1200;
      function susumu(ima) {
        var t = Math.min(1, (ima - hajime) / naga);
        var y = 1 - Math.pow(1 - t, 3);
        e.textContent = (owari * y).toFixed(keta);
        if (t < 1) requestAnimationFrame(susumu); else e.textContent = moji;
      }
      e.textContent = (0).toFixed(keta);
      requestAnimationFrame(susumu);
    });
  }

  /* ④ 円やドーナツの長さは、半径から計算させる。手で書くと半径を変えたときにずれる */
  Array.prototype.forEach.call(document.querySelectorAll('.ring,.sen'), function (e) {
    var len = 0;
    try { len = e.getTotalLength(); } catch (err) { len = 0; }
    if (len > 0) e.style.setProperty('--len', len.toFixed(2));
  });

  /* ⑤ 目次の現在地。今いる章の見出しに印を付ける */
  var mokuji = document.querySelectorAll('.mokuji a[href^="#"]');
  if (mokuji.length && 'IntersectionObserver' in window) {
    var hako = {};
    Array.prototype.forEach.call(mokuji, function (a) {
      var t = document.getElementById(a.getAttribute('href').slice(1));
      if (t) hako[t.id] = a;
    });
    var mi = new IntersectionObserver(function (list) {
      list.forEach(function (r) {
        var a = hako[r.target.id];
        if (!a) return;
        if (r.isIntersecting) {
          Array.prototype.forEach.call(mokuji, function (x) { x.style.color = ''; });
          a.style.color = 'var(--accent-omo)';
        }
      });
    }, { threshold: 0, rootMargin: '-20% 0px -70% 0px' });
    Object.keys(hako).forEach(function (id) { mi.observe(document.getElementById(id)); });
  }
})();
