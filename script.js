const version_s = "v2025.11.22";
// 获取
const toggleSwitch = document.querySelector('#checkbox');
const Github_ico = document.querySelectorAll('.github');
const themeToggle = document.getElementById('theme-toggle');
// 检查本地存储
let currentTheme = localStorage.getItem('theme');
const embeddedContent = document.querySelector('#embedded-content');
// 切换主题函数
function switchTheme() {
    if (currentTheme == 'light') {
        currentTheme = 'dark';
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        if(embeddedContent != null) applyDarkModeToObject();
    } else {
        currentTheme = 'light';
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        if(embeddedContent != null) removeDarkModeFromObject();
    }
}
// 将黑暗模式应用到嵌入的object内容
function applyDarkModeToObject() {
    try {
        const objDocument = embeddedContent.contentDocument;
        if (objDocument) {
            objDocument.body.classList.add('dark-mode');
        }
    } catch (e) {
        console.log('无法访问嵌入内容:', e);
    }
}

// 从嵌入的object内容移除黑暗模式
function removeDarkModeFromObject() {
    try {
        const objDocument = embeddedContent.contentDocument;
        if (objDocument) {
            objDocument.body.classList.remove('dark-mode');
        }
    } catch (e) {
        console.log('无法访问嵌入内容:', e);
    }
}
// 修改版本号
function initVersion() {
    const version = document.getElementById('version');
    version.textContent = version_s;
}
// 初始化主题
function initTheme() {
    if (currentTheme == 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        if(embeddedContent != null) applyDarkModeToObject();
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        if(embeddedContent != null) removeDarkModeFromObject();
    }
}
// 修改内嵌内容高度
function loadContent() {
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
        setTimeout(applyDarkModeToObject, 100);
    }
    try {
        const contentHeight = embeddedContent.contentDocument.documentElement.scrollHeight;
        embeddedContent.style.height = contentHeight + 'px';
    } catch (e) {
        console.log('无法获取内容高度:', e);
    }
};
// 添加事件监听器
// 点击主题切换按钮
themeToggle.addEventListener('click', () => {
    switchTheme();
});

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    initVersion();
    initTheme();
});

//
if (embeddedContent != null) {
    window.addEventListener('load', function () {
        // 延迟加载以便所有元素准备就绪
        setTimeout(loadContent, 500);
    });
    window.addEventListener('message', function (event) {
        if (event.data && event.data.type === 'contentChanged') {
            // 处理消息
            loadContent();
        }
    });
};
