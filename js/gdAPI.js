(function(global) {
    async function getSong(songId,br,source="netease") {
        const response = await fetch(`https://music-api.gdstudio.xyz/api.php?types=url&source=${source}&id=${songId}&br=${br}`);
        const data = await response.json();
        return data;
    }
        // ---------- 暴露全局接口 ----------
    const GDAPI = {
        getSong
    };

    // 支持 CommonJS / AMD / 全局
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = GDAPI;
    } else if (typeof define === 'function' && define.amd) {
        define(function() { return GDAPI; });
    } else {
        global.GDAPI = GDAPI;
    }
})(typeof window !== 'undefined' ? window : global);