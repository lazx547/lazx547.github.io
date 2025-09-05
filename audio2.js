document.addEventListener('DOMContentLoaded', function() {
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
    });
    
    // 音频结束时重置按钮
    audio.addEventListener('ended', function() {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        progressBar.style.width = '0%';
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
});