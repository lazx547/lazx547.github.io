document.addEventListener('DOMContentLoaded', function() {
    const CONFIG = {
        MANIFEST_FILE: '/files/zmyh.lrc',  // 文件清单JSON路径
        CACHE_BUSTING: true              // 是否添加缓存清除参数
    };

    let lrc = [];
    let lines = [];
    let autoScroll = true;
    // 获取元素
    const audio = document.getElementById('compact-audio-element');
    const playPauseBtn = document.getElementById('compact-play-pause');
    const volumeSlider = document.getElementById('compact-volume');
    const progressContainer = document.getElementById('compact-progress-container');
    const progressBar = document.getElementById('compact-progress-bar');
    const currentTimeEl = document.getElementById('compact-current-time');
    const durationEl = document.getElementById('compact-duration');
    const playIcon = document.getElementById('compact-play-icon');
    const pauseIcon = document.getElementById('compact-pause-icon');
    
    // 状态变量 - 用于解决进度条冲突
    let isUserSeeking = false;
    
    //
    const lyricsContainer = document.getElementById('lrc-div');
    
    // 播放/暂停
    playPauseBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // 防止事件冒泡
        if (audio.paused) {
            audio.play().catch(e => {
                console.log("需要用户交互才能播放");
            });
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            audio.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    });
    
    // 音量控制
    volumeSlider.addEventListener('input', function() {
        audio.volume = volumeSlider.value;
    });
    
    // 进度条鼠标事件处理
    progressContainer.addEventListener('mousedown', function(e) {
        isUserSeeking = true;
        updateProgress(e);
        
        // 添加全局鼠标事件监听
        document.addEventListener('mousemove', updateProgress);
        document.addEventListener('mouseup', stopSeeking);
    });
    
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
        h.style="font-size:20px"
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
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const duration = audio.duration;
        
        // 计算新位置
        const newTime = (clickX / width) * duration;
        audio.currentTime = newTime;
        
        // 更新进度条UI
        const progressPercent = (newTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        
        // 更新时间显示
        currentTimeEl.textContent = formatTime(newTime);
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
        const scrollTo = lineTop - (containerHeight / 2) + (lineHeight / 2)-1400;
        console.log(scrollTo);

        container.scrollTo({
            top: scrollTo,
            behavior: 'smooth'
        });
    }
    // 停止拖动
    function stopSeeking() {
        isUserSeeking = false;
        // 移除全局事件监听
        document.removeEventListener('mousemove', updateProgress);
        document.removeEventListener('mouseup', stopSeeking);
    }
    
    // 更新进度条
    audio.addEventListener('timeupdate', function() {
        // 如果用户正在调整进度，则不更新进度条
        if (isUserSeeking) return;
        
        const currentTimeAudio = audio.currentTime;
        const duration = audio.duration;
        
        if (duration) {
            const progressPercent = (currentTimeAudio / duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
        }
        
        // 更新时间显示
        currentTimeEl.textContent = formatTime(currentTimeAudio);
        highlightCurrentLyrics(currentTimeAudio);
    });
    
    // 音频结束时重置按钮
    audio.addEventListener('ended', function() {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        progressBar.style.width = '0%';
        lines.forEach(line => line.classList.remove('active'));
        lyricsContainer.scrollTo({ top: 0, behavior: 'smooth' });
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
    audio.addEventListener('loadedmetadata', function() {
        durationEl.textContent = formatTime(audio.duration);
    });
    displayLrc()
});