// Complete JS for Ngecor.id Pro
let currentTab = 'material';
let calculatedResults = {};
let highestUnlockedStep = 1;
let k3Verified = false;
let hasCalculated = false;
let blueprintView = 'isometric';
let activeSummarySubTab = 'volume';
let soundEnabled = true;
let audioCtx = null;

// Sound Synthesizer via Web Audio API
function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type = 'click') {
    if (!soundEnabled) return;
    try {
        initAudio();
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'click') {
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.04);
            osc.start(now);
            osc.stop(now + 0.04);
        } else if (type === 'success') {
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
        } else if (type === 'verified') {
            osc.frequency.setValueAtTime(587.33, now); // D5
            osc.frequency.setValueAtTime(880, now + 0.1); // A5
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    } catch (e) {
        // Audio API fallback
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('sound-btn');
    if (btn) {
        btn.innerHTML = soundEnabled ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark text-slate-400"></i>';
        btn.title = soundEnabled ? 'Suara Interaktif On' : 'Suara Interaktif Off';
    }
    showToast(soundEnabled ? 'Suara efek diaktifkan' : 'Suara efek dinonaktifkan', 'info');
}

// Data Panduan & SOP
const guideData = {
    batako: [
        { step: 'Step 1: Penebaran Mortar Dasar', desc: 'Siapkan adukan spesi 1:5 dan ratakan pada permukaan sloof/pondasi sebagai alas.', icon: 'fa-cubes-stacked' },
        { step: 'Step 2: Alignment & Benang Sipatan', desc: 'Pasang batako dari kedua sudut dinding terlebih dahulu, lalu tarik benang acuan lurus.', icon: 'fa-ruler-horizontal' },
        { step: 'Step 3: Leveling & Ketegakan', desc: 'Gunakan waterpass dan unting-unting pada tiap lapis untuk memastikan dinding tegak rata.', icon: 'fa-vial' },
        { step: 'Step 4: Pengisian Siar Sambungan', desc: 'Isi siar vertikal dan horizontal antarbatako secara padat tanpa ada rongga kosong.', icon: 'fa-fill-drip' }
    ],
    bata: [
        { step: 'Step 1: Perendaman Bata Merah', desc: 'Rendam batu bata dalam air sejenak sebelum dipasang agar tidak menyedot air semen adukan.', icon: 'fa-droplet' },
        { step: 'Step 2: Pasang Profil & Benang Acuan', desc: 'Tegakkan mistar ukur di sudut dinding dan rentangkan benang pedoman tiap baris bata.', icon: 'fa-ruler-horizontal' },
        { step: 'Step 3: Tebar Mortar Spesi 1:4 / 1:5', desc: 'Hamparkan spesi setebal 1.5 - 2 cm merata, lalu tekan bata ke posisi secara mantap.', icon: 'fa-layer-group' },
        { step: 'Step 4: Susunan Berselang & Kerapihan', desc: 'Pastikan pola pasangan bata berselang setengah panjang (staggered) dan siar rapi.', icon: 'fa-cubes' }
    ],
    plester: [
        { step: 'Step 1: Pembersihan & Kamprotan Dinding', desc: 'Bersihkan debu, basahi permukaan bata, lalu semprotkan adukan kasar (kamprot) sebagai kunci.', icon: 'fa-spray-can' },
        { step: 'Step 2: Pembuatan Kepalaan Plester', desc: 'Buat jalur kepalaan vertikal dengan lot/waterpass selebar 1.5 - 2 cm sebagai batas ketebalan.', icon: 'fa-ruler-horizontal' },
        { step: 'Step 3: Penarikan Jidar Aluminium', desc: 'Tarik adukan plester mengikuti jalur kepalaan dengan jidar panjang dari bawah ke atas.', icon: 'fa-ruler-vertical' },
        { step: 'Step 4: Penggosokan & Perataan', desc: 'Ratakan permukaan dengan roskam kayu/busa hingga padat dan tidak bergelombang.', icon: 'fa-hand-sparkles' }
    ],
    acian: [
        { step: 'Step 1: Curing & Persiapan Plesteran', desc: 'Pastikan plesteran sudah berusia minimal 2-3 hari, tidak basah kuyup namun cukup lembap.', icon: 'fa-droplet' },
        { step: 'Step 2: Pencampuran Bubuk Acian', desc: 'Campur semen acian instan atau PC dengan air bersih hingga berbentuk pasta homogen tanpa gumpalan.', icon: 'fa-blender' },
        { step: 'Step 3: Aplikasi Roskam Besi', desc: 'Oleskan pasta acian setebal 1.5 - 3 mm secara merata menggunakan roskam baja halus.', icon: 'fa-paint-roller' },
        { step: 'Step 4: Finishing Halus & Pengeringan', desc: 'Gosok lembut dengan kertas semen basah atau spon halus untuk menghasilkan permukaan mulus mengilap.', icon: 'fa-sparkles' }
    ],
    cor: [
        { step: 'Step 1: Pengecekan Bekisting & Penulangan', desc: 'Pastikan bekisting kuat, kedap, disokong kokoh, dan selimut beton tulangan sudah memakai beton tahu.', icon: 'fa-boxes-packing' },
        { step: 'Step 2: Pencampuran Adukan (1:2:3)', desc: 'Aduk semen, pasir beton, kerikil split, dan air secara merata menggunakan molen mixer.', icon: 'fa-arrows-rotate' },
        { step: 'Step 3: Penuangan & Pemadatan Vibrator', desc: 'Tuang beton kontinu lapis demi lapis dan padatkan dengan vibrator agar tidak keropos (honeycomb).', icon: 'fa-bucket' },
        { step: 'Step 4: Perawatan Beton (Curing)', desc: 'Lakukan penyiraman air atau penutupan karung goni basah selama minimal 7 hari agar mutu tercapai.', icon: 'fa-faucet-drip' }
    ]
};

// Unit Price Presets
const pricePresets = {
    jatim: { semen: 68000, pasir: 280000, kerikil: 340000, batako: 3500, bata: 900, labor: 280000 },
    jabodetabek: { semen: 75000, pasir: 350000, kerikil: 400000, batako: 4200, bata: 1100, labor: 350000 },
    luarjawa: { semen: 85000, pasir: 380000, kerikil: 450000, batako: 4800, bata: 1300, labor: 380000 }
};

function togglePriceConfig() {
    const panel = document.getElementById('price-config-panel');
    const chevron = document.getElementById('price-config-chevron');
    if (!panel) return;
    const isHidden = panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !isHidden);
    if (chevron) {
        chevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    }
}

function changePricePreset(presetKey) {
    const preset = pricePresets[presetKey] || pricePresets.jatim;
    document.getElementById('price-semen').value = preset.semen;
    document.getElementById('price-pasir').value = preset.pasir;
    document.getElementById('price-kerikil').value = preset.kerikil;
    document.getElementById('price-batako').value = preset.batako;
    document.getElementById('price-bata').value = preset.bata;
    document.getElementById('price-labor').value = preset.labor;
    calculateMaterial();
    showToast(`Preset harga ${presetKey.toUpperCase()} diterapkan.`, 'info');
}

function getUnitPrices() {
    return {
        semen: parseFloat(document.getElementById('price-semen')?.value) || 68000,
        pasir: parseFloat(document.getElementById('price-pasir')?.value) || 280000,
        kerikil: parseFloat(document.getElementById('price-kerikil')?.value) || 340000,
        batako: parseFloat(document.getElementById('price-batako')?.value) || 3500,
        bata: parseFloat(document.getElementById('price-bata')?.value) || 900,
        labor: parseFloat(document.getElementById('price-labor')?.value) || 280000
    };
}

// Kontrol Alur & Navigasi
function navigateToTab(tabId) {
    playSound('click');
    if (tabId === 'material') {
        switchTab('material');
        return;
    }
    if (tabId === 'panduan') {
        if (highestUnlockedStep < 2) {
            showToast('Langkah 2 Terkunci: Masukkan dimensi lalu klik "Hitung & Lanjut".', 'warning');
            return;
        }
        switchTab('panduan');
        return;
    }
    if (tabId === 'k3') {
        if (highestUnlockedStep < 3) {
            showToast('ℹ️ Tahap K3 akan otomatis terbuka saat Anda melanjutkan dari Panduan SOP!', 'info');
            return;
        }
        switchTab('k3');
        return;
    }
    if (tabId === 'ringkasan') {
        if (highestUnlockedStep < 4 || !k3Verified) {
            showToast('🔒 Ringkasan Terkunci: Alur konstruksi mewajibkan verifikasi K3 terlebih dahulu.', 'warning');
            return;
        }
        switchTab('ringkasan');
        return;
    }
    if (tabId === 'campuran') {
        switchTab('campuran');
        return;
    }
    if (tabId === 'toko') {
        if (highestUnlockedStep < 4) {
            showToast('ℹ️ Selesaikan alur perhitungan dan K3 agar PO bahan akurat.', 'info');
        }
        switchTab('toko');
        return;
    }
}

function handleStepNodeClick(stepNum) {
    const tabMap = { 1: 'material', 2: 'panduan', 3: 'k3', 4: 'ringkasan' };
    const targetTab = tabMap[stepNum];

    if (stepNum > highestUnlockedStep) {
        if (stepNum === 2) {
            showToast('Langkah 2 terkunci. Masukkan dimensi lalu klik "Hitung & Lanjut".', 'warning');
        } else if (stepNum === 3) {
            showToast('Langkah 3 (K3) akan terbuka otomatis setelah Anda meninjau Panduan SOP.', 'info');
        } else if (stepNum === 4) {
            showToast('Langkah 4 (Ringkasan) terkunci sampai verifikasi K3 selesai.', 'warning');
        }
        return;
    }
    navigateToTab(targetTab);
}

function switchTab(tabId) {
    currentTab = tabId;
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    const target = document.getElementById(`tab-${tabId}`);
    if (target) {
        target.classList.remove('hidden');
    }

    if (tabId === 'material') {
        setTimeout(drawBlueprint, 50);
    }
    updateNavAndStepper();
}

function updateNavAndStepper() {
    const stepMap = { material: 1, panduan: 2, k3: 3, ringkasan: 4 };
    let step = stepMap[currentTab];
    if (!step) {
        step = currentTab === 'toko' ? 4 : (currentTab === 'campuran' ? 2 : 1);
    }

    const percentages = { 1: '0%', 2: '33%', 3: '66%', 4: '100%' };
    const line = document.getElementById('stepper-line');
    if (line) line.style.width = percentages[step];

    for (let i = 1; i <= 4; i++) {
        const node = document.getElementById(`step-node-${i}`);
        const label = document.getElementById(`step-label-${i}`);
        if (node) {
            node.classList.remove('active', 'completed');
            if (i === step) {
                node.classList.add('active');
            } else if (i < step || i <= highestUnlockedStep) {
                node.classList.add('completed');
            }
        }
        if (label) {
            if (i === step) {
                label.className = 'text-brand font-bold text-center';
            } else if (i <= highestUnlockedStep) {
                label.className = 'text-emerald-700 font-semibold text-center';
            } else {
                label.className = 'text-slate-400 font-normal text-center';
            }
        }
    }

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const activeButton = document.getElementById(`nav-${currentTab}`);
    if (activeButton) activeButton.classList.add('active');

    const lockIcon = document.getElementById('nav-lock-ringkasan');
    if (lockIcon) {
        if (highestUnlockedStep >= 4 && k3Verified) {
            lockIcon.className = 'fa-solid fa-check text-[10px] text-emerald-500';
        } else {
            lockIcon.className = 'fa-solid fa-lock text-[10px] text-slate-400';
        }
    }
}

// 3D CAD Blueprint Visualizer
function setBlueprintView(view) {
    blueprintView = view;
    playSound('click');
    const btnIso = document.getElementById('btn-view-iso');
    const btnElev = document.getElementById('btn-view-elev');
    if (btnIso && btnElev) {
        if (view === 'isometric') {
            btnIso.className = 'px-2.5 py-1 bg-brand text-[10px] font-bold rounded-lg text-white transition-all shadow-xs';
            btnElev.className = 'px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold rounded-lg text-slate-300 transition-all';
        } else {
            btnElev.className = 'px-2.5 py-1 bg-brand text-[10px] font-bold rounded-lg text-white transition-all shadow-xs';
            btnIso.className = 'px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold rounded-lg text-slate-300 transition-all';
        }
    }
    drawBlueprint();
}

function drawBlueprint() {
    const canvas = document.getElementById('blueprint-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const length = parseFloat(document.getElementById('inp-length')?.value) || 10;
    const width = parseFloat(document.getElementById('inp-width')?.value) || 0.15;
    const height = parseFloat(document.getElementById('inp-height')?.value) || 3;
    const jobType = document.getElementById('job-type')?.value || 'batako';

    // Update annotation text
    const bpDim = document.getElementById('bp-dim');
    if (bpDim) bpDim.innerText = `${length.toFixed(1)} x ${height.toFixed(1)} m`;

    const bpThick = document.getElementById('bp-thick');
    if (bpThick) bpThick.innerText = `${(width * 100).toFixed(0)} cm`;

    const bpLayers = document.getElementById('bp-layers');
    if (bpLayers) {
        if (jobType === 'batako') bpLayers.innerText = `± ${Math.ceil(height / 0.2)} Lapis Batako`;
        else if (jobType === 'bata') bpLayers.innerText = `± ${Math.ceil(height / 0.07)} Lapis Bata`;
        else if (jobType === 'cor') bpLayers.innerText = `Vol: ${(length * width * height).toFixed(2)} m³ Beton`;
        else bpLayers.innerText = `Luas: ${(length * height).toFixed(1)} m²`;
    }

    if (blueprintView === 'elevation') {
        // 2D Elevation View
        const padX = 70;
        const padY = 40;
        const drawW = w - padX * 2;
        const drawH = h - padY * 2;

        const maxDim = Math.max(length, height * 1.5);
        const scale = Math.min(drawW / length, drawH / height) * 0.85;
        const boxW = length * scale;
        const boxH = height * scale;
        const startX = (w - boxW) / 2;
        const startY = (h + boxH) / 2 - 15;

        // Ground line
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX - 30, startY);
        ctx.lineTo(startX + boxW + 30, startY);
        ctx.stroke();

        // Wall fill
        if (jobType === 'batako') ctx.fillStyle = '#475569';
        else if (jobType === 'bata') ctx.fillStyle = '#9a3412';
        else if (jobType === 'cor') ctx.fillStyle = '#64748b';
        else ctx.fillStyle = '#cbd5e1';

        ctx.fillRect(startX, startY - boxH, boxW, boxH);
        ctx.strokeStyle = '#EE7D11';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(startX, startY - boxH, boxW, boxH);

        // Brick mortar pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        const rows = Math.min(25, Math.max(4, Math.floor(height * 4)));
        const cols = Math.min(30, Math.max(4, Math.floor(length * 2)));
        const rH = boxH / rows;
        const cW = boxW / cols;

        for (let r = 0; r < rows; r++) {
            const yPos = startY - boxH + r * rH;
            ctx.beginPath();
            ctx.moveTo(startX, yPos);
            ctx.lineTo(startX + boxW, yPos);
            ctx.stroke();

            const offset = (r % 2) * (cW / 2);
            for (let c = 0; c < cols; c++) {
                const xPos = startX + c * cW + offset;
                if (xPos > startX && xPos < startX + boxW) {
                    ctx.beginPath();
                    ctx.moveTo(xPos, yPos);
                    ctx.lineTo(xPos, yPos + rH);
                    ctx.stroke();
                }
            }
        }

        // Dimension lines
        ctx.strokeStyle = '#38bdf8';
        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px Inter, sans-serif';

        // Horizontal dimension
        ctx.beginPath();
        ctx.moveTo(startX, startY + 18);
        ctx.lineTo(startX + boxW, startY + 18);
        ctx.stroke();
        ctx.fillText(`Panjang: ${length.toFixed(1)} m`, startX + boxW / 2 - 35, startY + 30);

        // Vertical dimension
        ctx.beginPath();
        ctx.moveTo(startX - 18, startY);
        ctx.lineTo(startX - 18, startY - boxH);
        ctx.stroke();
        ctx.fillText(`Tinggi: ${height.toFixed(1)} m`, startX - 65, startY - boxH / 2);

    } else {
        // 3D Isometric View
        const scale = Math.min(28, (w * 0.6) / (length + 2));
        const ox = w * 0.45;
        const oy = h * 0.72;

        const isoX = (x, z) => (x - z) * Math.cos(Math.PI / 6) * scale + ox;
        const isoY = (x, y, z) => ((x + z) * Math.sin(Math.PI / 6) - y) * scale + oy;

        const L = Math.min(15, length);
        const H = Math.min(8, height);
        const D = Math.max(0.6, width * 3);

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.moveTo(isoX(0, 0), isoY(0, 0, 0));
        ctx.lineTo(isoX(L, 0), isoY(L, 0, 0));
        ctx.lineTo(isoX(L, D), isoY(L, 0, D));
        ctx.lineTo(isoX(0, D), isoY(0, 0, D));
        ctx.closePath();
        ctx.fill();

        // 1. Right side face (thickness)
        ctx.fillStyle = jobType === 'bata' ? '#7c2d12' : '#334155';
        ctx.beginPath();
        ctx.moveTo(isoX(L, 0), isoY(L, 0, 0));
        ctx.lineTo(isoX(L, D), isoY(L, 0, D));
        ctx.lineTo(isoX(L, D), isoY(L, H, D));
        ctx.lineTo(isoX(L, 0), isoY(L, H, 0));
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.stroke();

        // 2. Front face
        ctx.fillStyle = jobType === 'bata' ? '#9a3412' : (jobType === 'cor' ? '#475569' : '#64748b');
        ctx.beginPath();
        ctx.moveTo(isoX(0, D), isoY(0, 0, D));
        ctx.lineTo(isoX(L, D), isoY(L, 0, D));
        ctx.lineTo(isoX(L, D), isoY(L, H, D));
        ctx.lineTo(isoX(0, D), isoY(0, H, D));
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#EE7D11';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Staggered pattern on front face
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1;
        const rows = Math.min(16, Math.max(3, Math.floor(H * 2.5)));
        for (let r = 1; r < rows; r++) {
            const hVal = (r / rows) * H;
            ctx.beginPath();
            ctx.moveTo(isoX(0, D), isoY(0, hVal, D));
            ctx.lineTo(isoX(L, D), isoY(L, hVal, D));
            ctx.stroke();
        }

        // 3. Top face
        ctx.fillStyle = jobType === 'bata' ? '#c2410c' : '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(isoX(0, 0), isoY(0, H, 0));
        ctx.lineTo(isoX(L, 0), isoY(L, H, 0));
        ctx.lineTo(isoX(L, D), isoY(L, H, D));
        ctx.lineTo(isoX(0, D), isoY(0, H, D));
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Isometric Dimension Callout
        ctx.strokeStyle = '#38bdf8';
        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px Inter, sans-serif';

        // Length arrow
        ctx.beginPath();
        ctx.moveTo(isoX(0, D + 0.8), isoY(0, 0, D + 0.8));
        ctx.lineTo(isoX(L, D + 0.8), isoY(L, 0, D + 0.8));
        ctx.stroke();
        ctx.fillText(`P = ${length.toFixed(1)} m`, isoX(L / 2, D + 1.2), isoY(L / 2, 0, D + 1.2));

        // Height arrow
        ctx.beginPath();
        ctx.moveTo(isoX(-0.6, D), isoY(0, 0, D));
        ctx.lineTo(isoX(-0.6, D), isoY(0, H, D));
        ctx.stroke();
        ctx.fillText(`T = ${height.toFixed(1)} m`, isoX(-1.5, D), isoY(0, H / 2, D));
    }
}

// Kalkulator Material & RAB
function calculateMaterial() {
    const jobType = document.getElementById('job-type')?.value || 'batako';
    const length = parseFloat(document.getElementById('inp-length')?.value) || 0;
    const width = parseFloat(document.getElementById('inp-width')?.value) || 0;
    const height = parseFloat(document.getElementById('inp-height')?.value) || 0;
    const wastePercent = parseFloat(document.getElementById('inp-waste')?.value) || 5;

    // Update waste label
    const wasteLbl = document.getElementById('lbl-waste-percent');
    if (wasteLbl) {
        wasteLbl.innerText = `${wastePercent}% (${wastePercent <= 5 ? 'Standar SNI' : 'Borongan Lapangan'})`;
    }

    const area = length * height;
    const volume = length * width * height;

    const lblVol = document.getElementById('lbl-volume');
    const lblVolType = document.getElementById('lbl-volume-type');
    if (lblVol) {
        if (jobType === 'cor') {
            lblVol.innerText = `${volume.toFixed(2)} m³`;
            if (lblVolType) lblVolType.innerText = 'Volume Cor (Kubikasi)';
        } else {
            lblVol.innerText = `${area.toFixed(2)} m²`;
            if (lblVolType) lblVolType.innerText = 'Luas Permukaan Dinding';
        }
    }

    let semenNetto = 0;
    let pasirNetto = 0;
    let kerikilNetto = 0;
    let utamaNetto = 0;
    let utamaName = 'Batako';
    let unitUtama = 'pcs';
    let estWorkDays = 1;

    if (jobType === 'batako') {
        utamaNetto = Math.ceil(area * 12.5);
        semenNetto = area * 0.25;
        pasirNetto = area * 0.02;
        utamaName = 'Batako Press Super';
        estWorkDays = Math.max(1, Math.ceil(area / 12));
    } else if (jobType === 'cor') {
        semenNetto = volume * 8; // ~8 sak/m3 beton K-225
        pasirNetto = volume * 0.5;
        kerikilNetto = volume * 0.8;
        utamaNetto = kerikilNetto;
        utamaName = 'Kerikil / Split Cor';
        unitUtama = 'm³';
        estWorkDays = Math.max(1, Math.ceil(volume / 2.5));
    } else if (jobType === 'bata') {
        utamaNetto = Math.ceil(area * 70);
        semenNetto = area * 0.35;
        pasirNetto = area * 0.035;
        utamaName = 'Bata Merah Bakar';
        estWorkDays = Math.max(1, Math.ceil(area / 8));
    } else if (jobType === 'plester') {
        semenNetto = area * 0.18;
        pasirNetto = area * 0.025;
        estWorkDays = Math.max(1, Math.ceil(area / 18));
    } else if (jobType === 'acian') {
        semenNetto = area * 0.08;
        estWorkDays = Math.max(1, Math.ceil(area / 25));
    }

    const wasteMultiplier = 1 + (wastePercent / 100);
    const semenBruto = Math.ceil(semenNetto * wasteMultiplier * 10) / 10;
    const pasirBruto = Math.ceil(pasirNetto * wasteMultiplier * 100) / 100;
    const kerikilBruto = Math.ceil(kerikilNetto * wasteMultiplier * 100) / 100;
    const utamaBruto = Math.ceil(utamaNetto * wasteMultiplier);

    const prices = getUnitPrices();

    // Cost calculations
    let matCost = semenBruto * prices.semen + pasirBruto * prices.pasir;
    if (jobType === 'batako') matCost += utamaBruto * prices.batako;
    else if (jobType === 'bata') matCost += utamaBruto * prices.bata;
    else if (jobType === 'cor') matCost += kerikilBruto * prices.kerikil;

    const laborCost = estWorkDays * prices.labor;
    const contingency = (matCost + laborCost) * 0.05;
    const grandTotal = Math.round(matCost + laborCost + contingency);

    calculatedResults = {
        jobType,
        length,
        width,
        height,
        area,
        volume,
        wastePercent,
        estWorkDays,
        semenNetto: semenNetto.toFixed(1),
        semenBruto: semenBruto.toFixed(1),
        pasirNetto: pasirNetto.toFixed(2),
        pasirBruto: pasirBruto.toFixed(2),
        kerikilNetto: kerikilNetto.toFixed(2),
        kerikilBruto: kerikilBruto.toFixed(2),
        utamaNetto: Number(utamaNetto.toFixed(2)),
        utamaBruto,
        utamaName,
        unitUtama,
        prices,
        matCost: Math.round(matCost),
        laborCost: Math.round(laborCost),
        contingency: Math.round(contingency),
        grandTotal
    };

    renderOutputCards();
    renderSummaryTable();
    renderRABTable();
    updateGuideDetails(jobType);
    updateRiskAssessment();
    drawBlueprint();

    // Update Mini RAB in Tab 1
    const miniRab = document.getElementById('mini-rab-total');
    if (miniRab) {
        miniRab.innerText = formatRupiah(grandTotal);
    }
}

function formatRupiah(number) {
    return 'Rp ' + Number(number).toLocaleString('id-ID');
}

function renderOutputCards() {
    const container = document.getElementById('material-output-cards');
    if (!container) return;

    let html = `
        <div class="p-3.5 bg-slate-50 rounded-xl border flex justify-between items-center">
            <div>
                <b class="text-xs text-slate-800">Semen PPC (50kg)</b>
                <p class="text-[11px] text-slate-400">Netto: ${calculatedResults.semenNetto} sak | Susut +${calculatedResults.wastePercent}%</p>
            </div>
            <strong class="text-lg text-brand font-black">${calculatedResults.semenBruto} sak</strong>
        </div>
    `;

    if (Number(calculatedResults.pasirBruto) > 0) {
        html += `
            <div class="p-3.5 bg-slate-50 rounded-xl border flex justify-between items-center">
                <div>
                    <b class="text-xs text-slate-800">Pasir Pasang/Cor</b>
                    <p class="text-[11px] text-slate-400">Netto: ${calculatedResults.pasirNetto} m³ | Susut +${calculatedResults.wastePercent}%</p>
                </div>
                <strong class="text-lg text-brand font-black">${calculatedResults.pasirBruto} m³</strong>
            </div>
        `;
    }

    if (calculatedResults.utamaBruto > 0) {
        html += `
            <div class="p-3.5 bg-slate-50 rounded-xl border flex justify-between items-center">
                <div>
                    <b class="text-xs text-slate-800">${calculatedResults.utamaName}</b>
                    <p class="text-[11px] text-slate-400">Netto: ${calculatedResults.utamaNetto} | Susut +${calculatedResults.wastePercent}%</p>
                </div>
                <strong class="text-lg text-brand font-black">${calculatedResults.utamaBruto} ${calculatedResults.unitUtama}</strong>
            </div>
        `;
    }

    container.innerHTML = html;
}

function renderSummaryTable() {
    const body = document.getElementById('summary-table-body');
    if (!body) return;

    const rows = [
        { name: 'Semen PPC 50kg', netto: calculatedResults.semenNetto, bruto: calculatedResults.semenBruto, unit: 'sak' },
        ...(Number(calculatedResults.pasirBruto) > 0 ? [{ name: 'Pasir Pasang/Cor', netto: calculatedResults.pasirNetto, bruto: calculatedResults.pasirBruto, unit: 'm³' }] : []),
        ...(calculatedResults.utamaBruto > 0 ? [{ name: calculatedResults.utamaName, netto: calculatedResults.utamaNetto, bruto: calculatedResults.utamaBruto, unit: calculatedResults.unitUtama }] : [])
    ];

    body.innerHTML = rows.map(r => `
        <tr class="border-b hover:bg-slate-50/80">
            <td class="p-3 font-bold text-slate-800">${r.name}</td>
            <td class="p-3 text-slate-500 font-mono">${r.netto} ${r.unit}</td>
            <td class="p-3 text-slate-400 text-xs font-semibold">+${calculatedResults.wastePercent}% Toleransi</td>
            <td class="p-3 text-brand font-black text-sm">${r.bruto}</td>
            <td class="p-3 text-slate-600 font-medium">${r.unit}</td>
        </tr>
    `).join('');
}

function renderRABTable() {
    const body = document.getElementById('rab-table-body');
    if (!body) return;

    const prices = calculatedResults.prices;
    const items = [
        { name: 'Semen PPC 50kg', qty: calculatedResults.semenBruto + ' sak', price: prices.semen, sub: Math.round(calculatedResults.semenBruto * prices.semen) },
        ...(Number(calculatedResults.pasirBruto) > 0 ? [{ name: 'Pasir Pasang/Cor', qty: calculatedResults.pasirBruto + ' m³', price: prices.pasir, sub: Math.round(calculatedResults.pasirBruto * prices.pasir) }] : []),
        ...(calculatedResults.jobType === 'batako' ? [{ name: 'Batako Press Super', qty: calculatedResults.utamaBruto + ' pcs', price: prices.batako, sub: Math.round(calculatedResults.utamaBruto * prices.batako) }] : []),
        ...(calculatedResults.jobType === 'bata' ? [{ name: 'Bata Merah Bakar', qty: calculatedResults.utamaBruto + ' pcs', price: prices.bata, sub: Math.round(calculatedResults.utamaBruto * prices.bata) }] : []),
        ...(calculatedResults.jobType === 'cor' ? [{ name: 'Kerikil / Split Cor', qty: calculatedResults.kerikilBruto + ' m³', price: prices.kerikil, sub: Math.round(calculatedResults.kerikilBruto * prices.kerikil) }] : [])
    ];

    body.innerHTML = items.map(item => `
        <tr class="border-b hover:bg-slate-50/80">
            <td class="p-3 font-bold text-slate-800">${item.name}</td>
            <td class="p-3 font-mono text-slate-600">${item.qty}</td>
            <td class="p-3 text-slate-600 font-mono">${formatRupiah(item.price)}</td>
            <td class="p-3 text-right font-bold text-slate-900">${formatRupiah(item.sub)}</td>
        </tr>
    `).join('');

    const subMat = document.getElementById('rab-subtotal-material');
    if (subMat) subMat.innerText = formatRupiah(calculatedResults.matCost);

    const subLabor = document.getElementById('rab-subtotal-labor');
    if (subLabor) subLabor.innerText = `${formatRupiah(calculatedResults.laborCost)} (${calculatedResults.estWorkDays} Hari)`;

    const subCont = document.getElementById('rab-subtotal-contingency');
    if (subCont) subCont.innerText = formatRupiah(calculatedResults.contingency);

    const grand = document.getElementById('rab-grand-total');
    if (grand) grand.innerText = formatRupiah(calculatedResults.grandTotal);
}

function switchSummarySubTab(subTab) {
    activeSummarySubTab = subTab;
    playSound('click');
    const btnVol = document.getElementById('subtab-btn-volume');
    const btnRab = document.getElementById('subtab-btn-rab');
    const contentVol = document.getElementById('subtab-content-volume');
    const contentRab = document.getElementById('subtab-content-rab');

    if (subTab === 'volume') {
        btnVol.className = 'px-4 py-2 text-xs font-bold rounded-xl bg-brand text-white transition-all shadow-xs';
        btnRab.className = 'px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all';
        contentVol.classList.remove('hidden');
        contentRab.classList.add('hidden');
    } else {
        btnRab.className = 'px-4 py-2 text-xs font-bold rounded-xl bg-brand text-white transition-all shadow-xs';
        btnVol.className = 'px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all';
        contentRab.classList.remove('hidden');
        contentVol.classList.add('hidden');
    }
}

// Proses dari Step 1 ke Step 2
function processCalculationAndNext() {
    playSound('success');
    calculateMaterial();
    hasCalculated = true;
    highestUnlockedStep = Math.max(highestUnlockedStep, 2);

    const jobType = document.getElementById('job-type').value;
    selectGuide(jobType);

    const mixMap = { cor: 'cor', plester: 'plester', acian: 'acian', batako: 'pasangan', bata: 'pasangan' };
    if (mixMap[jobType]) selectMix(mixMap[jobType]);

    updateGuideDetails(jobType);
    updateNavAndStepper();
    switchTab('panduan');
    showToast('✓ Kalkulasi presisi & CAD 3D selesai! Pelajari panduan sebelum K3.', 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Panduan Tukang & SOP
function selectGuide(type) {
    document.querySelectorAll('.guide-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`guide-btn-${type}`);
    if (activeBtn) activeBtn.classList.add('active');

    const container = document.getElementById('guide-steps-container');
    const steps = guideData[type] || guideData.batako;

    container.innerHTML = steps.map(step => `
        <div class="p-4 bg-slate-50 rounded-xl border flex gap-3 hover:shadow-xs transition-shadow">
            <div class="w-10 h-10 bg-white text-brand rounded-xl flex items-center justify-center shrink-0 border shadow-xs">
                <i class="fa-solid ${step.icon}"></i>
            </div>
            <div>
                <h4 class="font-bold text-sm text-slate-800">${step.step}</h4>
                <p class="text-xs text-slate-500 mt-1 leading-relaxed">${step.desc}</p>
            </div>
        </div>
    `).join('');

    updateGuideDetails(type);
}

function updateGuideDetails(jobType) {
    const jobNames = {
        batako: 'Pasangan Batako Press',
        bata: 'Pasangan Bata Merah Bakar',
        cor: 'Cor Beton Structure (1:2:3)',
        plester: 'Pekerjaan Plesteran Dinding',
        acian: 'Pekerjaan Acian Halus'
    };

    const mixTips = {
        batako: 'Rasio spesi batako disarankan 1 Semen : 5 Pasir pasang untuk elastisitas dinding optimal.',
        bata: 'Rasio spesi bata merah disarankan 1 Semen : 4 Pasir pasang ayak halus.',
        cor: 'Rasio campuran beton struktur mutu standar adalah 1 Semen : 2 Pasir : 3 Kerikil Split.',
        plester: 'Rasio adukan plesteran dinding adalah 1 Semen : 4 Pasir halus.',
        acian: 'Gunakan pasta semen murni tanpa pasir dengan air secukupnya.'
    };

    const name = jobNames[jobType] || jobType;
    const guideJobName = document.getElementById('guide-job-name');
    if (guideJobName) guideJobName.innerText = name;

    const mixRec = document.getElementById('guide-mix-recommendation');
    if (mixRec && mixTips[jobType]) mixRec.innerText = mixTips[jobType];

    const guideDays = document.getElementById('guide-est-days');
    if (guideDays && calculatedResults.estWorkDays) {
        guideDays.innerText = `${calculatedResults.estWorkDays} - ${calculatedResults.estWorkDays + 1} Hari Kerja`;
    }

    const projName = document.getElementById('inp-project-name')?.value || 'Proyek Rumah Tinggal';
    const sumProjName = document.getElementById('summary-proj-name');
    if (sumProjName) sumProjName.innerText = projName;

    const sumVol = document.getElementById('summary-volume-title');
    if (sumVol && calculatedResults.area !== undefined) {
        sumVol.innerText = (jobType === 'cor') ? `${name} (${calculatedResults.volume.toFixed(2)} m³)` : `${name} (${calculatedResults.area.toFixed(2)} m²)`;
    }

    const sumWaste = document.getElementById('summary-waste-text');
    if (sumWaste) sumWaste.innerText = `+${calculatedResults.wastePercent || 5}% Toleransi`;
}

// Alur Otomatis ke K3
function proceedToK3() {
    playSound('click');
    highestUnlockedStep = Math.max(highestUnlockedStep, 3);
    updateNavAndStepper();
    switchTab('k3');
    showToast('🛡️ Membuka otomatis tahap Keselamatan Kerja (K3)...', 'warning');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Smart K3 Risk Assessment & Hazard Engine
function updateRiskAssessment() {
    const height = parseFloat(document.getElementById('inp-height')?.value) || 3;
    const jobType = document.getElementById('job-type')?.value || 'batako';
    const alertBox = document.getElementById('k3-dynamic-risk-alert');
    if (!alertBox) return;

    let alertHtml = '';
    if (height >= 2.0) {
        alertHtml += `
            <div class="bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-start gap-3 shadow-xs mb-3">
                <div class="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                    <i class="fa-solid fa-triangle-exclamation text-lg"></i>
                </div>
                <div>
                    <h4 class="font-bold text-red-950 text-xs md:text-sm">🚨 TINGKAT RISIKO TINGGI: Ketinggian Kerja ${height.toFixed(1)}m (> 2 Meter)</h4>
                    <p class="text-xs text-red-800 mt-0.5 leading-relaxed">
                        Sesuai Permenaker No. 9/2016 (Bekerja di Ketinggian), wajib menggunakan <b>Scaffolding berpenopang ganda (outrigger)</b> dan <b>Full Body Harness</b> dengan lanyard terkait ke lifeline.
                    </p>
                </div>
            </div>
        `;
    }

    if (jobType === 'cor') {
        alertHtml += `
            <div class="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
                <div class="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <i class="fa-solid fa-helmet-safety text-lg"></i>
                </div>
                <div>
                    <h4 class="font-bold text-amber-950 text-xs md:text-sm">⚠️ RISIKO STRUKTURAL & ERGONOMI: Pengecoran Beton Basah</h4>
                    <p class="text-xs text-amber-800 mt-0.5 leading-relaxed">
                        Massa beton basah sangat berat (± 2.400 kg/m³). Pastikan penyangga bekisting dicek mandor, dan pekerja menggunakan sepatu safety karet/boot tahan paku serta kacamata percikan semen.
                    </p>
                </div>
            </div>
        `;
    }

    alertBox.innerHTML = alertHtml;
}

function checkAllK3() {
    playSound('click');
    const checkboxes = document.querySelectorAll('#k3-checklist-container input[type="checkbox"]');
    checkboxes.forEach(box => box.checked = true);
    updateK3Checklist();
    showToast('✓ Seluruh checklist K3 telah ditandai Siap!', 'success');
}

function updateK3Checklist() {
    const checkboxes = document.querySelectorAll('#k3-checklist-container input[type="checkbox"]');
    let count = 0;
    checkboxes.forEach(box => {
        if (box.checked) count++;
    });

    const total = checkboxes.length || 5;
    const percent = Math.round((count / total) * 100);

    const countElem = document.getElementById('k3-count');
    if (countElem) countElem.innerText = `${count}/${total} Siap`;

    // Update Circular Gauge
    const gaugeCircle = document.getElementById('k3-gauge-circle');
    const gaugePercent = document.getElementById('k3-gauge-percent');
    const gaugeStatus = document.getElementById('k3-gauge-status');
    const gaugeDesc = document.getElementById('k3-gauge-desc');
    const levelBadge = document.getElementById('k3-level-badge');
    const sikaCard = document.getElementById('sika-card');

    if (gaugeCircle) {
        const offset = 251.2 * (1 - count / total);
        gaugeCircle.style.strokeDashoffset = offset;
        gaugeCircle.style.stroke = percent === 100 ? '#10B981' : (percent >= 60 ? '#EE7D11' : '#EF4444');
    }

    if (gaugePercent) gaugePercent.innerText = `${percent}%`;

    if (count === total) {
        k3Verified = true;
        if (gaugeStatus) gaugeStatus.innerText = '✓ K3 TERVERIFIKASI — SIAP KERJA LAPANGAN';
        if (gaugeDesc) gaugeDesc.innerText = 'Seluruh standar APD dan keselamatan teruji. Surat Izin Kerja Aman (SIKA) resmi diterbitkan.';
        if (levelBadge) {
            levelBadge.className = 'px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold';
            levelBadge.innerText = 'Tingkat Kesiapan: Maksimal (Aman)';
        }
        if (sikaCard) {
            sikaCard.classList.remove('hidden');
            const sikaCode = document.getElementById('sika-code');
            if (sikaCode && !sikaCode.dataset.assigned) {
                const code = `SIKA-NGC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
                sikaCode.innerText = code;
                sikaCode.dataset.assigned = 'true';
            }
        }
    } else {
        k3Verified = false;
        if (gaugeStatus) gaugeStatus.innerText = 'Checklist K3 Belum Lengkap';
        if (gaugeDesc) gaugeDesc.innerText = `Masih ada ${total - count} poin keselamatan yang belum diverifikasi mandor. Wajib 100% siap.`;
        if (levelBadge) {
            levelBadge.className = 'px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-[10px] font-bold';
            levelBadge.innerText = 'Tingkat Kesiapan: Belum Memenuhi Syarat';
        }
        if (sikaCard) sikaCard.classList.add('hidden');
    }

    const badge = document.getElementById('ringkasan-k3-badge');
    const k3StatusText = document.getElementById('summary-k3-status-text');

    if (badge) {
        if (k3Verified) {
            badge.className = 'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs';
            badge.innerHTML = '<i class="fa-solid fa-shield-check text-emerald-600 text-base"></i><span>Standar K3 Terverifikasi (SIKA APPROVED)</span>';
        } else {
            badge.className = 'inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200';
            badge.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-amber-600"></i><span>Status K3 Belum Lengkap (${count}/${total})</span>`;
        }
    }
    if (k3StatusText) {
        k3StatusText.innerText = k3Verified ? 'SIKA Valid' : 'Belum Diverifikasi';
        k3StatusText.className = k3Verified ? 'text-emerald-700 text-sm font-bold' : 'text-amber-700 text-sm font-bold';
    }
}

function verifyK3AndNext() {
    const checkboxes = document.querySelectorAll('#k3-checklist-container input[type="checkbox"]');
    const unchecked = Array.from(checkboxes).filter(box => !box.checked);

    if (unchecked.length > 0) {
        const confirmed = confirm(
            `Masih ada ${unchecked.length} poin checklist K3 yang belum dicentang.\n\nDalam pekerjaan riil, keselamatan kerja adalah prioritas mutlak.\nApakah Anda menyatakan seluruh standar keselamatan telah dipenuhi dan ingin membuka Dokumen Ringkasan & RAB?`
        );
        if (!confirmed) {
            showToast('Lengkapi checklist K3 sebelum melanjutkan.', 'warning');
            return;
        }
        checkboxes.forEach(box => box.checked = true);
        updateK3Checklist();
    }

    playSound('verified');
    k3Verified = true;
    highestUnlockedStep = 4;
    updateNavAndStepper();
    switchTab('ringkasan');
    showToast('✓ Standar K3 Terverifikasi! Ringkasan material & RAB resmi diterbitkan.', 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Simulasi Slump Test & FAS (Tab 5)
function updateFAS(val) {
    const fas = parseFloat(val);
    const fasDisplay = document.getElementById('fas-val-display');
    if (fasDisplay) fasDisplay.innerText = `FAS: ${fas.toFixed(2)}`;

    const slumpCm = 5 + ((fas - 0.35) / 0.35) * 16;
    const slumpDisplay = document.getElementById('slump-cm-display');
    if (slumpDisplay) slumpDisplay.innerText = `${slumpCm.toFixed(1)} cm`;

    const slumpPoly = document.getElementById('slump-polygon');
    const measureLine = document.getElementById('slump-measure-line');
    const strengthDisplay = document.getElementById('fas-strength-display');
    const workDisplay = document.getElementById('fas-workability-display');
    const warnBox = document.getElementById('fas-warning-box');

    const topY = 20 + ((fas - 0.35) / 0.35) * 45;
    const spread = 25 + ((fas - 0.35) / 0.35) * 20;

    if (slumpPoly) {
        slumpPoly.setAttribute('points', `60,${topY} ${60 - spread},80 ${60 + spread},80`);
    }
    if (measureLine) {
        measureLine.setAttribute('y2', topY);
    }

    if (fas < 0.42) {
        if (strengthDisplay) strengthDisplay.innerText = '± 30.0 MPa (Mutu K-300 s/d K-350)';
        if (workDisplay) workDisplay.innerText = 'Kaku / Kering (Wajib Mechanical Vibrator)';
        if (warnBox) {
            warnBox.className = 'p-2 rounded-lg bg-blue-950/40 border border-blue-800 text-[11px] text-blue-300';
            warnBox.innerText = 'Kuat tekan sangat tinggi. Cocok untuk struktur pracetak atau jalan beton.';
        }
    } else if (fas <= 0.55) {
        if (strengthDisplay) strengthDisplay.innerText = '± 22.5 MPa (Mutu K-225 Standar)';
        if (workDisplay) workDisplay.innerText = 'Optimal / Workable (Balok, Kolom, Pelat Rumah)';
        if (warnBox) {
            warnBox.className = 'p-2 rounded-lg bg-emerald-950/40 border border-emerald-800 text-[11px] text-emerald-300';
            warnBox.innerText = 'Kekentalan adukan seimbang. Paling disarankan untuk struktur rumah tinggal.';
        }
    } else {
        if (strengthDisplay) strengthDisplay.innerText = '± 15.0 MPa (Mutu K-150 Rendah)';
        if (workDisplay) workDisplay.innerText = 'Sangat Encer / Terlalu Cair';
        if (warnBox) {
            warnBox.className = 'p-2 rounded-lg bg-red-950/40 border border-red-800 text-[11px] text-red-300';
            warnBox.innerText = '⚠️ PERINGATAN: Kelebihan air! Risiko bleeding tinggi, segregasi kerikil, dan retak susut!';
        }
    }
}

function selectMix(type) {
    playSound('click');
    document.querySelectorAll('.mix-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`mix-btn-${type}`);
    if (activeBtn) activeBtn.classList.add('active');

    const ratios = {
        cor: { s: 1, p: 2, k: 3, a: 0.5, fs: 35, fp: 65, fk: 95, fa: 25, fas: 0.50 },
        plester: { s: 1, p: 4, k: 0, a: 0.5, fs: 35, fp: 95, fk: 0, fa: 25, fas: 0.52 },
        acian: { s: 1, p: 0, k: 0, a: 0.4, fs: 40, fp: 0, fk: 0, fa: 20, fas: 0.40 },
        pasangan: { s: 1, p: 5, k: 0, a: 0.6, fs: 30, fp: 100, fk: 0, fa: 30, fas: 0.58 }
    };

    const ratio = ratios[type];
    if (!ratio) return;

    document.getElementById('ratio-semen').innerText = ratio.s;
    document.getElementById('ratio-pasir').innerText = ratio.p;
    document.getElementById('ratio-kerikil').innerText = ratio.k;
    document.getElementById('ratio-air').innerText = ratio.a;

    document.getElementById('fill-semen').style.height = `${ratio.fs}%`;
    document.getElementById('fill-pasir').style.height = `${ratio.fp}%`;
    document.getElementById('fill-kerikil').style.height = `${ratio.fk}%`;
    document.getElementById('fill-air').style.height = `${ratio.fa}%`;

    const inpFas = document.getElementById('inp-fas');
    if (inpFas) {
        inpFas.value = ratio.fas;
        updateFAS(ratio.fas);
    }
}

// Toko Bangunan & WhatsApp PO Checkout
const storeStocks = {
    1: {
        name: 'TB Maju Jaya', phone: '6281234567890', address: 'Jl. Nusantara No. 23, Sidoarjo',
        stocks: [
            { name: 'Semen PPC (50kg)', amount: '120 sak', price: 68000 },
            { name: 'Pasir Coklat/Pasang', amount: '50 m³', price: 280000 },
            { name: 'Kerikil Split 1-2', amount: '35 m³', price: 340000 },
            { name: 'Batako Press Super', amount: '1500 pcs', price: 3500 },
            { name: 'Bata Merah Oven', amount: '8000 pcs', price: 900 }
        ]
    },
    2: {
        name: 'Material Sejahtera', phone: '6281398765432', address: 'Jl. Raya Industri No. 88, Surabaya',
        stocks: [
            { name: 'Semen PPC (50kg)', amount: '85 sak', price: 67000 },
            { name: 'Pasir Hitam Cor', amount: '30 m³', price: 275000 },
            { name: 'Kerikil Split Cor', amount: '20 m³', price: 335000 },
            { name: 'Batako Press', amount: '800 pcs', price: 3400 },
            { name: 'Bata Merah Oven', amount: '5000 pcs', price: 880 }
        ]
    },
    3: {
        name: 'Material Jaya Utama', phone: '6285100112233', address: 'Jl. Veteran No. 12, Gresik',
        stocks: [
            { name: 'Semen PPC (50kg)', amount: '0 sak (Habis)', price: 69000 },
            { name: 'Pasir Coklat', amount: '15 m³', price: 285000 },
            { name: 'Kerikil Split', amount: '12 m³', price: 345000 },
            { name: 'Batako Super', amount: '400 pcs', price: 3600 }
        ]
    }
};

let selectedStoreId = 1;

function selectStore(id) {
    selectedStoreId = id;
    playSound('click');
    document.querySelectorAll('.store-card').forEach(card => card.classList.remove('selected'));
    const selectedCard = document.getElementById(`store-card-${id}`);
    if (selectedCard) selectedCard.classList.add('selected');

    const store = storeStocks[id];
    document.getElementById('selected-store-name').innerText = store.name;

    const container = document.getElementById('stock-list-container');
    container.innerHTML = store.stocks.map(stock => `
        <div class="p-3 bg-slate-50 rounded-xl border flex justify-between items-center text-xs">
            <div>
                <b class="text-slate-800">${stock.name}</b>
                <span class="text-slate-400 block">${formatRupiah(stock.price)}</span>
            </div>
            <strong class="text-brand font-bold">${stock.amount}</strong>
        </div>
    `).join('');

    const storeTotalElem = document.getElementById('store-calc-total');
    if (storeTotalElem) {
        storeTotalElem.innerText = formatRupiah(calculatedResults.matCost || 0);
    }
}

function buildOrderMessage() {
    const store = storeStocks[selectedStoreId] || storeStocks[1];
    const projName = document.getElementById('inp-project-name')?.value || 'Proyek Rumah';
    const sikaCode = document.getElementById('sika-code')?.innerText || 'SIKA-NGC-APPROVED';

    let itemsText = `• Semen PPC: ${calculatedResults.semenBruto || 0} sak\n`;
    if (Number(calculatedResults.pasirBruto) > 0) itemsText += `• Pasir: ${calculatedResults.pasirBruto} m³\n`;
    if (calculatedResults.utamaBruto > 0) itemsText += `• ${calculatedResults.utamaName}: ${calculatedResults.utamaBruto} ${calculatedResults.unitUtama}\n`;

    return `Halo *${store.name}*,\nSaya ingin melakukan pemesanan material berdasarkan estimasi dari *Ngecor.id Pro*:\n\n` +
        `📋 *Nama Proyek:* ${projName}\n` +
        `🛡️ *Status K3:* Terverifikasi (${sikaCode})\n\n` +
        `📦 *Daftar Kebutuhan Material (+Toleransi Susut):*\n${itemsText}\n` +
        `💵 *Estimasi Nilai Bahan:* ${formatRupiah(calculatedResults.matCost || 0)}\n\n` +
        `Mohon konfirmasi ketersediaan stok, ongkos kirim ke lokasi, dan total tagihannya. Terima kasih!`;
}

function orderViaWhatsApp() {
    playSound('success');
    const store = storeStocks[selectedStoreId] || storeStocks[1];
    const msg = encodeURIComponent(buildOrderMessage());
    const waUrl = `https://wa.me/${store.phone}?text=${msg}`;
    window.open(waUrl, '_blank');
}

function copyOrderText() {
    playSound('click');
    const msg = buildOrderMessage();
    navigator.clipboard.writeText(msg).then(() => {
        showToast('✓ Format chat pemesanan berhasil disalin ke clipboard!', 'success');
    }).catch(() => {
        showToast('Gagal menyalin otomatis. Silakan coba lagi.', 'error');
    });
}

// Multi-Project Management
function getSavedProjects() {
    try {
        return JSON.parse(localStorage.getItem('ngecorProjectsList')) || [];
    } catch (e) {
        return [];
    }
}

function updateSavedProjectsBadge() {
    const list = getSavedProjects();
    const badge = document.getElementById('saved-projects-count');
    if (badge) badge.innerText = list.length;
}

function saveProject() {
    if (!calculatedResults.jobType) {
        showToast('Belum ada data perhitungan untuk disimpan.', 'warning');
        return;
    }

    const projName = document.getElementById('inp-project-name')?.value || 'Proyek Konstruksi';
    const list = getSavedProjects();

    const newProject = {
        id: 'PRJ-' + Date.now(),
        name: projName,
        date: new Date().toLocaleString('id-ID'),
        jobType: calculatedResults.jobType,
        volume: document.getElementById('lbl-volume')?.innerText || '0 m²',
        grandTotal: calculatedResults.grandTotal,
        wastePercent: calculatedResults.wastePercent,
        results: calculatedResults,
        k3Verified
    };

    list.unshift(newProject);
    localStorage.setItem('ngecorProjectsList', JSON.stringify(list));
    updateSavedProjectsBadge();
    playSound('success');
    showToast(`✓ Proyek "${projName}" berhasil disimpan ke daftar!`, 'success');
}

function openProjectsModal() {
    playSound('click');
    const modal = document.getElementById('projects-modal');
    const listContainer = document.getElementById('saved-projects-list');
    if (!modal || !listContainer) return;

    const list = getSavedProjects();
    if (list.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-8 text-slate-400">
                <i class="fa-solid fa-folder-open text-3xl mb-2 text-slate-300"></i>
                <p class="text-xs">Belum ada proyek yang tersimpan.</p>
                <p class="text-[11px] text-slate-400 mt-1">Gunakan tombol "Simpan ke Daftar Proyek" di tab Ringkasan.</p>
            </div>
        `;
    } else {
        listContainer.innerHTML = list.map(item => `
            <div class="p-3 bg-slate-50 border rounded-2xl flex items-center justify-between text-xs hover:border-brand transition-colors">
                <div>
                    <b class="text-slate-800 text-sm block">${item.name}</b>
                    <span class="text-slate-400 text-[11px]">${item.date} | ${item.volume}</span>
                    <strong class="text-brand block mt-0.5">${formatRupiah(item.grandTotal)}</strong>
                </div>
                <div class="flex gap-1.5">
                    <button onclick="loadProject('${item.id}')" class="px-3 py-1.5 bg-brand text-white font-bold rounded-xl text-xs hover:bg-brand-hover">
                        Buka
                    </button>
                    <button onclick="deleteProject('${item.id}')" class="p-1.5 text-slate-400 hover:text-red-600 rounded-lg">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeProjectsModal() {
    const modal = document.getElementById('projects-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function loadProject(id) {
    const list = getSavedProjects();
    const proj = list.find(p => p.id === id);
    if (!proj) return;

    document.getElementById('inp-project-name').value = proj.name;
    document.getElementById('job-type').value = proj.jobType;
    document.getElementById('inp-length').value = proj.results.length;
    document.getElementById('inp-width').value = proj.results.width;
    document.getElementById('inp-height').value = proj.results.height;
    document.getElementById('inp-waste').value = proj.wastePercent || 5;

    calculateMaterial();
    closeProjectsModal();
    highestUnlockedStep = 4;
    k3Verified = true;
    updateK3Checklist();
    updateNavAndStepper();
    switchTab('ringkasan');
    playSound('success');
    showToast(`✓ Proyek "${proj.name}" berhasil dimuat!`, 'success');
}

function deleteProject(id) {
    let list = getSavedProjects();
    list = list.filter(p => p.id !== id);
    localStorage.setItem('ngecorProjectsList', JSON.stringify(list));
    updateSavedProjectsBadge();
    openProjectsModal();
    showToast('Proyek dihapus dari riwayat.', 'info');
}

// Modal Keluar & Print
function openExitModal() {
    playSound('click');
    const modal = document.getElementById('exit-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeExitModal() {
    const modal = document.getElementById('exit-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function confirmExit() {
    closeExitModal();
    goToHome();
}

function goToHome() {
    playSound('click');
    switchTab('material');
}

function downloadPDF() {
    switchTab('ringkasan');
    setTimeout(() => {
        window.print();
    }, 300);
}

// Toast Notifikasi
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const bgColors = {
        success: 'bg-emerald-600 text-white',
        warning: 'bg-amber-600 text-white',
        error: 'bg-red-600 text-white',
        info: 'bg-slate-800 text-white'
    };
    const icons = {
        success: 'fa-circle-check',
        warning: 'fa-triangle-exclamation',
        error: 'fa-circle-xmark',
        info: 'fa-circle-info'
    };

    toast.className = `${bgColors[type] || bgColors.info} px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 transform transition-all duration-300 translate-y-3 opacity-0 pointer-events-auto border border-white/20`;
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info} text-sm"></i><span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-3', 'opacity-0');
    }, 20);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Inisialisasi Aplikasi
window.onload = function () {
    const progress = document.getElementById('splash-progress');
    if (progress) progress.style.width = '100%';

    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.classList.add('opacity-0');
            setTimeout(() => {
                splash.classList.add('hidden');
            }, 500);
        }
    }, 1000);

    calculateMaterial();
    selectGuide('batako');
    selectMix('cor');
    selectStore(1);
    updateK3Checklist();
    updateNavAndStepper();
    updateSavedProjectsBadge();
    setTimeout(drawBlueprint, 200);
};

window.onresize = function () {
    drawBlueprint();
};