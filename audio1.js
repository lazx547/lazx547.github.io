
document.addEventListener('DOMContentLoaded', function () {
    const CONFIG = {
        MANIFEST_FILE: '/files/zmyh.lrc',  // 文件清单JSON路径
        CACHE_BUSTING: true              // 是否添加缓存清除参数
    };

    let lrc = [];
    let lines = [];

    // 获取元素
    const audio = document.getElementById('audio-element');
    const playPauseBtn = document.getElementById('play-pause');
    const rewindBtn = document.getElementById('rewind');
    const fastForwardBtn = document.getElementById('fast-forward');
    const volumeSlider = document.getElementById('volume');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressHandle = document.getElementById('progress-handle');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const statusIndicator = document.getElementById('status-indicator');

    //
    const lyricsContainer = document.getElementById('lrc-div');

    // 调试信息元素
    const debugSeeking = document.getElementById('debug-seeking');
    const debugTimeupdate = document.getElementById('debug-timeupdate');
    const debugPosition = document.getElementById('debug-position');

    // 状态变量 - 用于解决进度条冲突
    let autoScroll = true;
    let isUserSeeking = false;
    let lastUpdateTime = 0;
    const updateThrottleTime = 100; // 毫秒
    let timeupdateCount = 0;

    function parseLRC(lrcText) {
        const lines = lrcText.split('\n');
        const result = [];

        lines.forEach(line => {
            const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{3})\](.+)$/);

            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const milliseconds = parseInt(match[3]);
                const content = match[4].trim();

                // 转换为总秒数（含小数）
                const totalSeconds = minutes * 60 + seconds + milliseconds / 1000;

                if (content) {
                    result.push({
                        time: totalSeconds,
                        content: content
                    });
                }
            }
        });
        return result;
    }
    async function fetchLrc() {
        try {
            const url = CONFIG.CACHE_BUSTING
                ? `${CONFIG.MANIFEST_FILE}?t=${Date.now()}`
                : CONFIG.MANIFEST_FILE;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`获取列表失败 (HTTP ${response.status})`);
            }
            const text = await response.text();
            const data = parseLRC(text);

            if (!data) {
                throw new Error('无效的格式');
            }

            return data;
        } catch (error) {
            console.error('加载失败:', error);
            return [];
        }
    }
    async function displayLrc() {
        lrc = await fetchLrc();
        lyricsContainer.innerHTML = '';
        const h=document.createElement('h3');
        h.innerHTML="歌词";
        h.style="font-size:30px"
        lyricsContainer.appendChild(h);
        lrc.forEach(item => {
            const p = document.createElement('p');
            p.textContent = item.content;
            p.className = 'lyrics-line';
            lyricsContainer.appendChild(p);
            lines.push(p);
        });
    }

    // 更新进度条位置
    function updateProgress(e) {
        if (!isUserSeeking) return;

        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;

        // 计算新位置
        const newTime = (clickX / width) * duration;
        audio.currentTime = newTime;

        // 更新进度条UI
        const progressPercent = (newTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        progressHandle.style.right = `${100 - progressPercent}%`;

        // 更新时间显示
        currentTimeEl.textContent = formatTime(newTime);

        debugPosition.textContent = `当前位置: ${progressPercent.toFixed(1)}%`;
    }

    // 高亮当前歌词
    function highlightCurrentLyrics(currentTime) {
        let currentLineIndex = -1;

        // 找到当前时间对应的歌词行
        for (let i = 0; i < lrc.length; i++) {
            if (lrc[i].time <= currentTime) {
                currentLineIndex = i;
            } else {
                break;
            }
        }
        //移除所有高亮
        lines.forEach(line => line.classList.remove('active'));

        // 高亮当前行
        if (currentLineIndex >= 0 && lines[currentLineIndex]) {
            lines[currentLineIndex].classList.add('active');
            // 自动滚动到当前歌词行
            scrollToCurrentLine(currentLineIndex);
        }
    }

    // 自动滚动函数
    function scrollToCurrentLine(currentLineIndex) {
        if (!autoScroll) return;
        const currentLine = lines[currentLineIndex];
        const container = lyricsContainer;

        // 计算让当前行显示在容器正中间的位置
        const lineTop = currentLine.offsetTop;
        const containerHeight = container.clientHeight;
        const lineHeight = currentLine.offsetHeight;

        // 计算滚动位置：行顶部 - 容器一半高度 + 行一半高度
        const scrollTo = lineTop - (containerHeight / 2) + (lineHeight / 2);

        container.scrollTo({
            top: scrollTo,
            behavior: 'smooth'
        });
    }
    // 停止拖动
    function stopSeeking() {
        isUserSeeking = false;
        debugSeeking.textContent = "用户调整: 否";
        statusIndicator.textContent = audio.paused ? '已暂停' : '播放中';

        // 移除全局事件监听
        document.removeEventListener('mousemove', updateProgress);
        document.removeEventListener('mouseup', stopSeeking);
    }
    lyricsContainer.addEventListener('wheel', () => {
        autoScroll = false;
        setTimeout(() => autoScroll = true, 2000);
    });
    
    lyricsContainer.addEventListener('mousedown', () => {
        autoScroll = false;
        setTimeout(() => autoScroll = true, 2000);
    });
    // 播放/暂停
    playPauseBtn.addEventListener('click', function () {
        if (audio.paused) {
            audio.play().catch(e => {
                statusIndicator.textContent = "播放失败: 需要用户交互";
            });
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            statusIndicator.textContent = '播放中';
        } else {
            audio.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            statusIndicator.textContent = '已暂停';
        }
    });

    // 快退（10秒）
    rewindBtn.addEventListener('click', function () {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
        statusIndicator.textContent = '后退10秒';
        setTimeout(() => {
            if (!isUserSeeking) {
                statusIndicator.textContent = audio.paused ? '已暂停' : '播放中';
            }
        }, 1000);
    });

    // 快进（10秒）
    fastForwardBtn.addEventListener('click', function () {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
        statusIndicator.textContent = '前进10秒';
        setTimeout(() => {
            if (!isUserSeeking) {
                statusIndicator.textContent = audio.paused ? '已暂停' : '播放中';
            }
        }, 1000);
    });

    // 音量控制
    volumeSlider.addEventListener('input', function () {
        audio.volume = volumeSlider.value;
        statusIndicator.textContent = `音量: ${Math.round(volumeSlider.value * 100)}%`;
        setTimeout(() => {
            if (!isUserSeeking) {
                statusIndicator.textContent = audio.paused ? '已暂停' : '播放中';
            }
        }, 1000);
    });

    // 进度条鼠标事件处理
    progressContainer.addEventListener('mousedown', function (e) {
        isUserSeeking = true;
        debugSeeking.textContent = "用户调整: 是";
        statusIndicator.textContent = '调整进度中';

        // 立即更新进度
        updateProgress(e);

        // 添加全局鼠标事件监听
        document.addEventListener('mousemove', updateProgress);
        document.addEventListener('mouseup', stopSeeking);
    });


    // 更新进度条 - 添加节流和状态检查
    audio.addEventListener('timeupdate', function () {
        timeupdateCount++;
        const currentTime = Date.now();
        const timeSinceLastUpdate = currentTime - lastUpdateTime;

        // 节流控制，避免过于频繁的更新
        if (timeSinceLastUpdate < updateThrottleTime) {
            return;
        }

        // 如果用户正在调整进度，则不更新进度条
        if (isUserSeeking) {
            return;
        }

        lastUpdateTime = currentTime;

        const currentTimeAudio = audio.currentTime;
        const duration = audio.duration;

        if (duration) {
            const progressPercent = (currentTimeAudio / duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
            progressHandle.style.right = `${100 - progressPercent}%`;

            debugPosition.textContent = `当前位置: ${progressPercent.toFixed(1)}%`;
        }

        // 更新时间显示
        currentTimeEl.textContent = formatTime(currentTimeAudio);
        highlightCurrentLyrics(currentTimeAudio);

        debugTimeupdate.textContent = `最后更新: ${timeSinceLastUpdate}ms 前 (${timeupdateCount}次触发)`;
    });

    // 音频结束时重置按钮
    audio.addEventListener('ended', function () {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        progressBar.style.width = '0%';
        progressHandle.style.right = '100%';
        statusIndicator.textContent = '播放结束';
    });

    // 格式化时间显示（分:秒）
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";

        let minutes = Math.floor(seconds / 60);
        let secs = Math.floor(seconds % 60);
        secs = secs < 10 ? '0' + secs : secs;
        return `${minutes}:${secs}`;
    }

    // 加载元数据后显示总时长
    audio.addEventListener('loadedmetadata', function () {
        durationEl.textContent = formatTime(audio.duration);
        statusIndicator.textContent = '准备播放';
    });

    // 音频加载中提示
    audio.addEventListener('loadstart', function () {
        statusIndicator.textContent = '加载中...';
    });

    // 音频可以播放
    audio.addEventListener('canplay', function () {
        statusIndicator.textContent = '准备播放';
    });

    displayLrc()
});
