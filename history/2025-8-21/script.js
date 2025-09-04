const version_s = "v2025.8.21";
// 获取切换按钮
const toggleSwitch = document.querySelector('#checkbox');
const Github_ico = document.querySelectorAll('.github');
const Githubpage_ico = document.getElementById('githubpage_ico');
const themeToggle = document.getElementById('theme-toggle');
const themeToggleImg = document.getElementById('theme-toggle-img');
// 检查本地存储中的主题设置
let currentTheme = localStorage.getItem('theme');


// 切换主题函数
function switchTheme() {
    if (currentTheme == 'light') {
        currentTheme = 'dark';
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        Github_ico.forEach(el => {
            el.src = "./images/github_d.png";
        });
        Githubpage_ico.src = "./images/githubpage_d.png";
        themeToggleImg.src = "./images/dark.png";
    } else {
        currentTheme = 'light';
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        Github_ico.forEach(el => {
            el.src = "./images/github.png";
        });
        Githubpage_ico.src = "./images/githubpage.png";
        themeToggleImg.src = "./images/light.png";
    }
}
function initVersion() {
    const version = document.getElementById('version');
    version.textContent = version_s;
}
function initTheme() {
    if (currentTheme == 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        Github_ico.forEach(el => {
            el.src = "./images/github.png";
        });
        Githubpage_ico.src = "./images/githubpage.png";
        themeToggleImg.src = "./images/light.png";
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        Github_ico.forEach(el => {
            el.src = "./images/github_d.png";
        });
        Githubpage_ico.src = "./images/githubpage_d.png";
        themeToggleImg.src = "./images/dark.png";
    }
}
// 添加事件监听器
themeToggle.addEventListener('click', () => {
    switchTheme();
});

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    initVersion();
    initTheme();
});