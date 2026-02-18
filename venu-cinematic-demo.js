(function() {
  'use strict';

  var DEMO_DURATION = 53;
  var LOOP_START = 51;
  var section = document.getElementById('watch-demo');
  var phoneWrap = document.getElementById('venu-demo-phone-wrap');
  var phoneScreen = document.getElementById('venu-demo-phone-screen');
  var progressFill = document.getElementById('venu-demo-progress-fill');
  var tapEl = document.getElementById('venu-demo-tap');
  var glowEl = document.getElementById('venu-demo-glow');
  var controlsEl = document.getElementById('venu-demo-controls');
  var pauseBtn = document.getElementById('venu-demo-pause');
  var reducedMsg = document.getElementById('venu-demo-reduced-motion-msg');
  var dotsContainer = document.getElementById('venu-demo-dots');
  var narrativeBlocks = document.querySelectorAll('.venu-demo-narrative-block');
  var mobileHeadline = document.getElementById('venu-demo-mobile-headline');
  var mobileText = document.getElementById('venu-demo-mobile-text');
  var phoneZone = section && section.querySelector('.venu-demo-phone-zone');
  var ownerScreen = document.getElementById('venu-demo-owner-screen');
  var ownerNotification = document.getElementById('vd-owner-notification');
  var ownerWidget = document.getElementById('vd-owner-widget');
  var ownerBookingsNew = document.getElementById('vd-owner-bookings-new');
  var ownerDepositsNew = document.getElementById('vd-owner-deposits-new');
  var ownerArrows = document.querySelectorAll('.vd-owner-arrow');

  if (!section || !phoneScreen) return;

  var stages = [];
  for (var i = 1; i <= 7; i++) {
    stages.push(document.getElementById('venu-demo-stage-' + i));
  }

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    if (reducedMsg) reducedMsg.hidden = false;
    if (controlsEl) controlsEl.style.display = 'none';
    section.classList.add('is-visible');
    return;
  }

  var startTime = null;
  var paused = false;
  var pausedByOwner = false;
  var elapsedAtPause = 0;
  var rafId = null;
  var tickHandled = {};
  var controlsVisible = false;
  var controlsHideTimer = null;
  var ownerMomentTimeouts = [];

  function getElapsed() {
    if (!startTime) return 0;
    if (pausedByOwner) return elapsedAtPause;
    return (Date.now() - startTime) / 1000;
  }

  function goToStage(n) {
    stages.forEach(function(stage, i) {
      if (stage) {
        stage.classList.remove('is-visible', 'slide-out-left', 'slide-in-right');
        if (i + 1 === n) {
          stage.classList.add('is-visible');
        }
      }
    });
    narrativeBlocks.forEach(function(block) {
      block.classList.toggle('is-active', block.getAttribute('data-stage') === String(n));
    });
    if (mobileHeadline && mobileText && narrativeBlocks[n - 1]) {
      var h = narrativeBlocks[n - 1].querySelector('.venu-demo-narrative-headline');
      var t = narrativeBlocks[n - 1].querySelector('.venu-demo-narrative-text');
      if (h) mobileHeadline.textContent = h.textContent;
      if (t) mobileText.textContent = t.textContent;
    }
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.venu-demo-dot').forEach(function(dot) {
        dot.classList.toggle('is-active', dot.getAttribute('data-stage') === String(n));
      });
    }
    var glowClass = 'venu-demo-glow-teal';
    if (n === 3 || n === 4) glowClass = 'venu-demo-glow-gold';
    if (n === 5 || n === 6) glowClass = 'venu-demo-glow-green';
    if (n === 7) glowClass = 'venu-demo-glow-white';
    if (glowEl) {
      glowEl.className = 'venu-demo-glow ' + glowClass;
    }
  }

  function showTap(rect, contentParent) {
    if (!tapEl) return;
    var frame = tapEl.parentElement;
    if (!frame) return;
    var frameRect = frame.getBoundingClientRect();
    var x = rect.left - frameRect.left + rect.width / 2;
    var y = rect.top - frameRect.top + rect.height / 2;
    tapEl.style.left = x + 'px';
    tapEl.style.top = y + 'px';
    tapEl.classList.remove('is-tapping');
    tapEl.offsetHeight;
    tapEl.classList.add('is-tapping');
    setTimeout(function() {
      tapEl.classList.remove('is-tapping');
    }, 450);
  }

  function typeInField(fieldId, value, maskChar, intervalMs, callback) {
    var field = document.getElementById(fieldId);
    if (!field) { if (callback) callback(); return; }
    var index = 0;
    function tick() {
      if (index >= value.length) {
        if (callback) callback();
        return;
      }
      var display = value.slice(0, index + 1);
      if (maskChar) display = maskChar.repeat(index + 1);
      field.value = display;
      index++;
      setTimeout(tick, intervalMs);
    }
    tick();
  }

  function typeCardNumber() {
    var field = document.getElementById('vd-card-input');
    if (!field) return;
    var full = '4242424242424242';
    var display = '';
    var i = 0;
    function tick() {
      if (i >= full.length) return;
      display += full[i];
      var formatted = display.replace(/(\d{4})(?=\d)/g, '$1 ').replace(/(\d{4}\s)(?=\d)/g, '$1');
      field.value = formatted;
      i++;
      if (i < full.length) setTimeout(tick, 80);
    }
    setTimeout(tick, 300);
  }

  function runTimeline() {
    var t = getElapsed();
    if (t >= DEMO_DURATION) {
      clearOwnerMomentTimeouts();
      if (section) {
        section.classList.remove('owner-moment-active', 'owner-moment-exit', 'owner-moment-copy-visible', 'mobile-owner-banner-visible');
      }
      if (ownerScreen) ownerScreen.classList.remove('screen-on');
      if (ownerNotification) ownerNotification.classList.remove('is-expanded');
      if (ownerWidget) ownerWidget.classList.remove('is-visible');
      startTime = Date.now();
      tickHandled = {};
      pausedByOwner = false;
      progressFill.style.width = '0%';
      resetStageUI();
      goToStage(1);
      phoneScreen.style.opacity = '';
      phoneScreen.style.transition = '';
      return;
    }

    progressFill.style.width = Math.min(100, (t / DEMO_DURATION) * 100) + '%';

    if (t >= 0 && t < 4 && !tickHandled.s1) { tickHandled.s1 = true; goToStage(1); }
    if (t >= 3.5 && !tickHandled.s1to2) {
      tickHandled.s1to2 = true;
      stages[0] && stages[0].classList.remove('is-visible');
      stages[1] && stages[1].classList.add('is-visible');
      goToStage(2);
      document.getElementById('vd-total-bar') && document.getElementById('vd-total-bar').classList.remove('is-visible');
      document.getElementById('vd-addon-prompt') && document.getElementById('vd-addon-prompt').classList.remove('is-visible');
    }
    if (t >= 5 && !tickHandled.tap1) {
      tickHandled.tap1 = true;
      var row = document.getElementById('vd-balayage-row');
      if (row) showTap(row.getBoundingClientRect(), phoneScreen);
      setTimeout(function() {
        if (row) {
          row.classList.add('vd-service-row-selected');
          var check = row.querySelector('.vd-check');
          if (check) check.style.display = '';
        }
      }, 400);
    }
    if (t >= 6 && !tickHandled.bar) {
      tickHandled.bar = true;
      var bar = document.getElementById('vd-total-bar');
      if (bar) bar.classList.add('is-visible');
    }
    if (t >= 7 && !tickHandled.addon) {
      tickHandled.addon = true;
      var addon = document.getElementById('vd-addon-prompt');
      if (addon) addon.classList.add('is-visible');
    }
    if (t >= 8 && !tickHandled.tap2) {
      tickHandled.tap2 = true;
      var skip = document.querySelector('.vd-btn-skip');
      if (skip) showTap(skip.getBoundingClientRect(), phoneScreen);
    }
    if (t >= 9 && !tickHandled.pulse1) {
      tickHandled.pulse1 = true;
      var cont1 = document.getElementById('vd-continue-1');
      if (cont1) { cont1.classList.add('pulse'); setTimeout(function() { cont1.classList.remove('pulse'); }, 600); }
    }
    if (t >= 10 && !tickHandled.tap3) {
      tickHandled.tap3 = true;
      var cont1 = document.getElementById('vd-continue-1');
      if (cont1) showTap(cont1.getBoundingClientRect(), phoneScreen);
      setTimeout(function() {
        goToStage(3);
        var card = document.getElementById('vd-deposit-card');
        if (card) card.classList.add('is-visible');
      }, 350);
    }
    if (t >= 11 && t < 17 && !tickHandled.s3) { tickHandled.s3 = true; goToStage(3); }
    if (t >= 12 && !tickHandled.depositCard) {
      tickHandled.depositCard = true;
      var card = document.getElementById('vd-deposit-card');
      if (card) card.classList.add('is-visible');
    }
    if (t >= 14.5 && !tickHandled.glowGold) { tickHandled.glowGold = true; if (glowEl) glowEl.className = 'venu-demo-glow venu-demo-glow-gold'; }
    if (t >= 15.5 && !tickHandled.pulse2) {
      tickHandled.pulse2 = true;
      var cont2 = document.getElementById('vd-continue-2');
      if (cont2) { cont2.classList.add('pulse'); setTimeout(function() { cont2.classList.remove('pulse'); }, 600); }
    }
    if (t >= 16.5 && !tickHandled.tap4) {
      tickHandled.tap4 = true;
      var cont2 = document.getElementById('vd-continue-2');
      if (cont2) showTap(cont2.getBoundingClientRect(), phoneScreen);
      setTimeout(function() { goToStage(4); }, 350);
    }
    if (t >= 17 && t < 25 && !tickHandled.s4) { tickHandled.s4 = true; goToStage(4); }
    if (t >= 18 && !tickHandled.tapCal) {
      tickHandled.tapCal = true;
      var calDay = document.querySelector('.vd-cal-selected');
      if (calDay) showTap(calDay.getBoundingClientRect(), phoneScreen);
    }
    if (t >= 19.5 && !tickHandled.times) {
      tickHandled.times = true;
      var times = document.getElementById('vd-times');
      if (times) times.classList.add('is-visible');
    }
    if (t >= 21 && !tickHandled.tapTime) {
      tickHandled.tapTime = true;
      var timeRow = document.querySelector('.vd-time-row-selected');
      if (timeRow) showTap(timeRow.getBoundingClientRect(), phoneScreen);
    }
    if (t >= 22 && !tickHandled.cancelCard) {
      tickHandled.cancelCard = true;
      var cc = document.getElementById('vd-cancel-card');
      if (cc) cc.classList.add('is-visible');
    }
    if (t >= 23.5 && !tickHandled.pulse3) {
      tickHandled.pulse3 = true;
      var cont3 = document.getElementById('vd-continue-3');
      if (cont3) { cont3.classList.add('pulse'); setTimeout(function() { cont3.classList.remove('pulse'); }, 600); }
    }
    if (t >= 24.5 && !tickHandled.tap5) {
      tickHandled.tap5 = true;
      var cont3 = document.getElementById('vd-continue-3');
      if (cont3) showTap(cont3.getBoundingClientRect(), phoneScreen);
      setTimeout(function() { goToStage(5); if (glowEl) glowEl.className = 'venu-demo-glow venu-demo-glow-green'; }, 400);
    }
    if (t >= 25 && t < 33 && !tickHandled.s5) { tickHandled.s5 = true; goToStage(5); }
    if (t >= 26 && !tickHandled.typeCard) {
      tickHandled.typeCard = true;
      typeCardNumber();
    }
    if (t >= 28 && !tickHandled.typeExpiry) {
      tickHandled.typeExpiry = true;
      var expiry = document.getElementById('vd-expiry');
      if (expiry) { expiry.value = '02'; setTimeout(function() { expiry.value = '02/28'; }, 160); }
    }
    if (t >= 28.2 && !tickHandled.typeCvc) {
      tickHandled.typeCvc = true;
      var cvc = document.getElementById('vd-cvc');
      if (cvc) { cvc.value = '•'; setTimeout(function() { cvc.value = '••'; }, 80); setTimeout(function() { cvc.value = '•••'; }, 160); }
    }
    if (t >= 29.5 && !tickHandled.glowBtn) {
      tickHandled.glowBtn = true;
      var payBtn = document.getElementById('vd-btn-pay');
      if (payBtn) payBtn.classList.add('glow');
    }
    if (t >= 30 && !tickHandled.tapPay) {
      tickHandled.tapPay = true;
      var payBtn = document.getElementById('vd-btn-pay');
      if (payBtn) showTap(payBtn.getBoundingClientRect(), phoneScreen);
      payBtn && payBtn.classList.add('is-loading');
      payBtn && (payBtn.textContent = '');
      var spinner = document.createElement('span');
      spinner.className = 'vd-spinner';
      spinner.setAttribute('aria-hidden', 'true');
      payBtn && payBtn.appendChild(spinner);
    }
    if (t >= 31.5 && !tickHandled.paySuccess) {
      tickHandled.paySuccess = true;
      var payBtn = document.getElementById('vd-btn-pay');
      var successEl = document.getElementById('vd-payment-success');
      if (payBtn) {
        payBtn.classList.remove('is-loading', 'glow');
        payBtn.textContent = 'Payment Confirmed';
        payBtn.style.background = '#22C55E';
        payBtn.style.color = '#fff';
      }
      if (successEl) successEl.classList.add('is-visible');
      /* Owner phone removed – timeline continues without pause */
    }
    if (t >= 32.8 && !tickHandled.to6) {
      tickHandled.to6 = true;
      goToStage(6);
    }
    if (t >= 33 && t < 39 && !tickHandled.s6) { tickHandled.s6 = true; goToStage(6); }
    if (t >= 36 && !tickHandled.tapPortal) {
      tickHandled.tapPortal = true;
      var portalBtn = document.getElementById('vd-view-portal');
      if (portalBtn) showTap(portalBtn.getBoundingClientRect(), phoneScreen);
    }
    if (t >= 38 && !tickHandled.to7) {
      tickHandled.to7 = true;
      goToStage(7);
      if (glowEl) glowEl.className = 'venu-demo-glow venu-demo-glow-white';
    }
    if (t >= 39 && t < 44 && !tickHandled.s7) { tickHandled.s7 = true; goToStage(7); }
    if (t >= 40 && !tickHandled.notifExpand) {
      tickHandled.notifExpand = true;
      var notif = document.getElementById('vd-notification');
      if (notif) notif.classList.add('is-expanded');
    }
    if (t >= 43.5 && !tickHandled.notifContract) {
      tickHandled.notifContract = true;
      var notif = document.getElementById('vd-notification');
      if (notif) notif.classList.remove('is-expanded');
    }
    if (t >= LOOP_START && !tickHandled.loopFade) {
      tickHandled.loopFade = true;
      phoneScreen.style.opacity = '0';
      phoneScreen.style.transition = 'opacity 0.5s ease';
    }
    if (t >= LOOP_START + 0.5 && !tickHandled.loopReset) {
      tickHandled.loopReset = true;
      goToStage(1);
      phoneScreen.style.opacity = '1';
      phoneScreen.style.transition = 'opacity 0.5s ease 0.3s';
    }
  }

  function clearOwnerMomentTimeouts() {
    ownerMomentTimeouts.forEach(function(id) { clearTimeout(id); });
    ownerMomentTimeouts = [];
  }

  function runOwnerMomentDesktop() {
    section.classList.add('owner-moment-active');
    ownerMomentTimeouts.push(setTimeout(function() {
      if (ownerScreen) ownerScreen.classList.add('screen-on');
    }, 300));
    ownerMomentTimeouts.push(setTimeout(function() {
      if (ownerNotification) ownerNotification.classList.add('is-expanded');
    }, 500));
    ownerMomentTimeouts.push(setTimeout(function() {
      section.classList.add('owner-moment-copy-visible');
    }, 1000));
    ownerMomentTimeouts.push(setTimeout(function() {
      if (ownerWidget) ownerWidget.classList.add('is-visible');
      if (ownerBookingsNew) ownerBookingsNew.classList.add('gold-flash');
      if (ownerDepositsNew) ownerDepositsNew.classList.add('gold-flash');
      ownerArrows.forEach(function(el) { if (el) el.classList.add('pulse-once'); });
      setTimeout(function() {
        if (ownerBookingsNew) ownerBookingsNew.classList.remove('gold-flash');
        if (ownerDepositsNew) ownerDepositsNew.classList.remove('gold-flash');
        ownerArrows.forEach(function(el) { if (el) el.classList.remove('pulse-once'); });
      }, 500);
    }, 1400));
    ownerMomentTimeouts.push(setTimeout(function() {
      if (ownerNotification) ownerNotification.classList.remove('is-expanded');
    }, 7900));
    ownerMomentTimeouts.push(setTimeout(function() {
      section.classList.add('owner-moment-exit');
      section.classList.remove('owner-moment-active', 'owner-moment-copy-visible');
    }, 8200));
    ownerMomentTimeouts.push(setTimeout(function() {
      section.classList.remove('owner-moment-exit');
      if (ownerScreen) ownerScreen.classList.remove('screen-on');
      if (ownerNotification) ownerNotification.classList.remove('is-expanded');
      if (ownerWidget) ownerWidget.classList.remove('is-visible');
      pausedByOwner = false;
      startTime = Date.now() - 40100;
      tickHandled.to6 = false;
      clearOwnerMomentTimeouts();
    }, 8600));
  }

  function runOwnerMomentMobile() {
    section.classList.add('mobile-owner-banner-visible');
    ownerMomentTimeouts.push(setTimeout(function() {
      section.classList.remove('mobile-owner-banner-visible');
      pausedByOwner = false;
      startTime = Date.now() - 34500;
      tickHandled.to6 = false;
      clearOwnerMomentTimeouts();
    }, 3000));
  }

  function tick() {
    if (paused) {
      rafId = requestAnimationFrame(tick);
      return;
    }
    runTimeline();
    rafId = requestAnimationFrame(tick);
  }

  function resetStageUI() {
    var bar = document.getElementById('vd-total-bar');
    if (bar) bar.classList.remove('is-visible');
    var addon = document.getElementById('vd-addon-prompt');
    if (addon) addon.classList.remove('is-visible');
    var balayage = document.getElementById('vd-balayage-row');
    if (balayage) {
      balayage.classList.remove('vd-service-row-selected');
      var c = balayage.querySelector('.vd-check');
      if (c) c.style.display = 'none';
    }
    var card = document.getElementById('vd-deposit-card');
    if (card) card.classList.remove('is-visible');
    var times = document.getElementById('vd-times');
    if (times) times.classList.remove('is-visible');
    var cancelCard = document.getElementById('vd-cancel-card');
    if (cancelCard) cancelCard.classList.remove('is-visible');
    var successEl = document.getElementById('vd-payment-success');
    if (successEl) successEl.classList.remove('is-visible');
    var payBtn = document.getElementById('vd-btn-pay');
    if (payBtn) {
      payBtn.classList.remove('is-loading', 'glow');
      payBtn.textContent = 'Pay $50 Deposit';
      payBtn.style.background = '';
      payBtn.style.color = '';
      var sp = payBtn.querySelector('.vd-spinner');
      if (sp) sp.remove();
    }
    var cardInput = document.getElementById('vd-card-input');
    if (cardInput) cardInput.value = '';
    var expiry = document.getElementById('vd-expiry');
    if (expiry) expiry.value = '';
    var cvc = document.getElementById('vd-cvc');
    if (cvc) cvc.value = '';
    var notif = document.getElementById('vd-notification');
    if (notif) notif.classList.remove('is-expanded');
    clearOwnerMomentTimeouts();
    if (section) {
      section.classList.remove('owner-moment-active', 'owner-moment-exit', 'owner-moment-copy-visible', 'mobile-owner-banner-visible');
    }
    if (ownerScreen) ownerScreen.classList.remove('screen-on');
    if (ownerNotification) ownerNotification.classList.remove('is-expanded');
    if (ownerWidget) ownerWidget.classList.remove('is-visible');
    pausedByOwner = false;
  }

  function startDemo() {
    paused = false;
    startTime = Date.now();
    tickHandled = {};
    pausedByOwner = false;
    progressFill.style.width = '0%';
    resetStageUI();
    goToStage(1);
    phoneScreen.style.opacity = '';
    phoneScreen.style.transition = '';
    if (pauseBtn) {
      pauseBtn.textContent = '⏸ Pause';
      pauseBtn.setAttribute('aria-label', 'Pause demo');
    }
    rafId = requestAnimationFrame(tick);
  }

  function pauseDemo() {
    paused = true;
    if (pauseBtn) {
      pauseBtn.textContent = '▶ Play';
      pauseBtn.setAttribute('aria-label', 'Play demo');
    }
  }

  function resumeDemo() {
    paused = false;
    if (pauseBtn) {
      pauseBtn.textContent = '⏸ Pause';
      pauseBtn.setAttribute('aria-label', 'Pause demo');
    }
  }

  var playOverlay = document.getElementById('venu-demo-play-overlay');
  var playOverlayBtn = document.getElementById('venu-demo-play-overlay-btn');

  function onPlayOverlayClick() {
    if (startTime !== null) return;
    section.classList.add('is-visible', 'demo-started');
    if (playOverlay) playOverlay.setAttribute('aria-hidden', 'true');
    startDemo();
  }
  if (playOverlay) {
    playOverlay.addEventListener('click', onPlayOverlayClick);
  }
  if (playOverlayBtn) {
    playOverlayBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      onPlayOverlayClick();
    });
  }

  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.target !== section) return;
      if (entry.isIntersecting) {
        section.classList.add('is-visible');
        if (startTime !== null) {
          resumeDemo();
          if (!rafId) rafId = requestAnimationFrame(tick);
        }
        /* Demo starts only when user clicks play overlay */
      } else {
        if (!section.classList.contains('demo-started')) pauseDemo();
      }
    });
  }, { rootMargin: '0px', threshold: 0.15 });

  io.observe(section);

  document.addEventListener('visibilitychange', function() {
    if (document.hidden) pauseDemo();
    else if (section && section.classList.contains('is-visible')) {
      var rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) resumeDemo();
    }
  });

  if (pauseBtn) {
    pauseBtn.addEventListener('click', function() {
      if (paused) resumeDemo(); else pauseDemo();
    });
  }

  var stageStartTimes = [0, 3.5, 10.5, 16.5, 24.5, 32.8, 38];
  function setTickHandledBefore(t) {
    var keys = [];
    if (t >= 0) keys.push('s1');
    if (t >= 3.5) keys.push('s1to2');
    if (t >= 5) keys.push('tap1');
    if (t >= 6) keys.push('bar');
    if (t >= 7) keys.push('addon');
    if (t >= 8) keys.push('tap2');
    if (t >= 9) keys.push('pulse1');
    if (t >= 10) keys.push('tap3','s3');
    if (t >= 12) keys.push('depositCard');
    if (t >= 14.5) keys.push('glowGold');
    if (t >= 15.5) keys.push('pulse2');
    if (t >= 16.5) keys.push('tap4');
    if (t >= 18) keys.push('tapCal');
    if (t >= 19.5) keys.push('times');
    if (t >= 21) keys.push('tapTime');
    if (t >= 22) keys.push('cancelCard');
    if (t >= 23.5) keys.push('pulse3');
    if (t >= 24.5) keys.push('tap5','s5');
    if (t >= 26) keys.push('typeCard');
    if (t >= 28) keys.push('typeExpiry','typeCvc');
    if (t >= 29.5) keys.push('glowBtn');
    if (t >= 30) keys.push('tapPay');
    if (t >= 31.5) keys.push('paySuccess');
    if (t >= 32.8) keys.push('to6','s6');
    if (t >= 36) keys.push('tapPortal');
    if (t >= 38) keys.push('to7','s7');
    if (t >= 40) keys.push('notifExpand');
    if (t >= 43.5) keys.push('notifContract');
    if (t >= LOOP_START) keys.push('loopFade');
    if (t >= LOOP_START + 0.5) keys.push('loopReset');
    keys.forEach(function(k) { tickHandled[k] = true; });
  }
  if (dotsContainer) {
    dotsContainer.querySelectorAll('.venu-demo-dot').forEach(function(dot) {
      dot.addEventListener('click', function() {
        var n = parseInt(dot.getAttribute('data-stage'), 10);
        var t = stageStartTimes[n - 1] || 0;
        startTime = Date.now() - t * 1000;
        tickHandled = {};
        setTickHandledBefore(t);
        resetStageUI();
        if (t >= 5) {
          var row = document.getElementById('vd-balayage-row');
          if (row) { row.classList.add('vd-service-row-selected'); var c = row.querySelector('.vd-check'); if (c) c.style.display = ''; }
        }
        if (t >= 6) document.getElementById('vd-total-bar') && document.getElementById('vd-total-bar').classList.add('is-visible');
        if (t >= 7) document.getElementById('vd-addon-prompt') && document.getElementById('vd-addon-prompt').classList.add('is-visible');
        if (t >= 12) document.getElementById('vd-deposit-card') && document.getElementById('vd-deposit-card').classList.add('is-visible');
        if (t >= 19.5) document.getElementById('vd-times') && document.getElementById('vd-times').classList.add('is-visible');
        if (t >= 22) document.getElementById('vd-cancel-card') && document.getElementById('vd-cancel-card').classList.add('is-visible');
        if (t >= 31.5) {
          var payBtn = document.getElementById('vd-btn-pay');
          if (payBtn) { payBtn.textContent = 'Payment Confirmed'; payBtn.style.background = '#22C55E'; payBtn.style.color = '#fff'; }
          document.getElementById('vd-payment-success') && document.getElementById('vd-payment-success').classList.add('is-visible');
        }
        if (t >= 28) {
          document.getElementById('vd-card-input').value = '4242 4242 4242 4242';
          document.getElementById('vd-expiry').value = '02/28';
          document.getElementById('vd-cvc').value = '•••';
        }
        if (t >= 40) document.getElementById('vd-notification') && document.getElementById('vd-notification').classList.add('is-expanded');
        progressFill.style.width = Math.min(100, (t / DEMO_DURATION) * 100) + '%';
        goToStage(n);
        runTimeline();
      });
    });
  }

  if (phoneZone) {
    phoneZone.addEventListener('mouseenter', function() {
      if (controlsHideTimer) clearTimeout(controlsHideTimer);
      controlsEl && controlsEl.classList.add('is-visible');
    });
    phoneZone.addEventListener('mouseleave', function() {
      controlsHideTimer = setTimeout(function() {
        controlsEl && controlsEl.classList.remove('is-visible');
      }, 2000);
    });
  }

  var style = document.createElement('style');
  style.textContent = '.vd-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(201,168,76,0.4); border-top-color: #C9A84C; border-radius: 50%; animation: vd-spin 0.7s linear infinite; } @keyframes vd-spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
})();
