const CONFIG = {
    MANIFEST_FILE: 'data.json',  // 文件清单JSON路径
    CACHE_BUSTING: true              // 是否添加缓存清除参数
};

let List = [];
const pText = document.getElementById('p-text');
const maxText = document.getElementById('max-text');
const errorPage = document.getElementById('erroe-page');
async function fetchList() {
    try {
        const url = CONFIG.CACHE_BUSTING
            ? `${CONFIG.MANIFEST_FILE}?t=${Date.now()}`
            : CONFIG.MANIFEST_FILE;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`获取列表失败 (HTTP ${response.status})`);
        }

        const data = await response.json();

        if (!data.datas || !Array.isArray(data.datas)) {
            throw new Error('无效的格式');
        }

        return data.datas;
    } catch (error) {
        console.error('加载失败:', error);
        return [];
    }
}
function getFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const hParam = params.get('p');

    if (!hParam) return null;

    return hParam;
}

async function loadPage(url) {
    window.location.href = "https://" + url + ".lazx547-history.pages.dev"
}

async function init() {
    List = await fetchList()
    const index = getFromUrl();
    let url
    if (index) {
        if (index < List.length && index > 0 && index % 1 == 0) {
            url = List[index];
            loadPage(url);
        }

    }
    else {
        errorPage.style.display = 'flex';
        pText.innerText = index;
        maxText.innerText = List.length - 1;
    }
}
window.addEventListener('DOMContentLoaded', () => {
    init()
});