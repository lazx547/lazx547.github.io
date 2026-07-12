function showUserAgreement(agreementTextContent = null) {
    return new Promise((resolve) => {
        // ---------- 创建遮罩 ----------
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.45)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '9999';
        overlay.style.fontFamily = 'system-ui, -apple-system, sans-serif';

        // ---------- 创建弹窗主体 ----------
        const modal = document.createElement('div');
        modal.style.backgroundColor = '#ffffff';
        modal.style.maxWidth = '520px';
        modal.style.width = '90%';
        modal.style.padding = '28px 24px 32px';
        modal.style.boxShadow = '0 30px 60px rgba(0,0,0,0.30)';
        modal.style.border = '1px solid #dde3ed';
        modal.style.position = 'relative';

        // ---------- 协议文本区域 ----------
        const textContainer = document.createElement('div');
        textContainer.style.maxHeight = '280px';
        textContainer.style.overflowY = 'auto';
        textContainer.style.padding = '14px 16px';
        textContainer.style.marginBottom = '22px';
        textContainer.style.borderBottom = '1px solid #e6ecf3';
        textContainer.style.borderTop = '1px solid #e6ecf3';
        textContainer.style.background = '#fafcff';
        textContainer.style.borderRadius = '8px';

        const agreementText = document.createElement('p');
        agreementText.style.margin = '0';
        agreementText.style.fontSize = '15px';
        agreementText.style.lineHeight = '1.7';
        agreementText.style.color = '#1c2b3d';
        agreementText.style.whiteSpace = 'pre-wrap';
        agreementText.textContent = agreementTextContent || 
            `欢迎使用本服务。请您仔细阅读以下条款：
`;

        textContainer.appendChild(agreementText);

        // ---------- 按钮组 ----------
        const btnWrapper = document.createElement('div');
        btnWrapper.style.display = 'flex';
        btnWrapper.style.gap = '14px';
        btnWrapper.style.justifyContent = 'flex-end';
        btnWrapper.style.marginTop = '10px';
        btnWrapper.style.flexWrap = 'wrap';

        // 拒绝按钮
        const rejectBtn = document.createElement('button');
        rejectBtn.textContent = '拒绝';
        rejectBtn.style.padding = '10px 26px';
        rejectBtn.style.fontSize = '16px';
        rejectBtn.style.fontWeight = '500';
        rejectBtn.style.border = '1px solid #b8c9dd';
        rejectBtn.style.backgroundColor = '#1a6b3c';
        rejectBtn.style.color = 'white';
        rejectBtn.style.cursor = 'pointer';
        // 同意按钮
        const agreeBtn = document.createElement('button');
        agreeBtn.textContent = '同意并继续';
        agreeBtn.style.padding = '10px 26px';
        agreeBtn.style.fontSize = '16px';
        agreeBtn.style.fontWeight = '500';
        agreeBtn.style.border = 'none';
        agreeBtn.style.color = '#1f3349';
        agreeBtn.style.backgroundColor = '#f2f6fc';
        agreeBtn.style.cursor = 'pointer';

        // ---------- 组装弹窗 ----------
        btnWrapper.appendChild(rejectBtn);
        btnWrapper.appendChild(agreeBtn);
        modal.appendChild(textContainer);
        modal.appendChild(btnWrapper);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // ---------- 状态控制 ----------
        let resolved = false;

        function safeClose(value) {
            if (resolved) return;
            resolved = true;
            document.removeEventListener('keydown', handleKeydown);
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            resolve(value);
        }

        // ---------- 事件绑定 ----------
        // 同意
        agreeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            safeClose(true);
        });

        // 拒绝
        rejectBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            safeClose(false);
        });


        // 点击遮罩背景
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                safeClose(false);
            }
        });

        // 键盘 ESC
        function handleKeydown(e) {
            if (e.key === 'Escape') {
                safeClose(false);
            }
        }
        document.addEventListener('keydown', handleKeydown);

        // 鼠标悬停效果（提升交互体验）
        rejectBtn.onmouseover = function() { this.style.backgroundColor = '#13522e'; };
        rejectBtn.onmouseout = function() { this.style.backgroundColor = '#1a6b3c'; };
        agreeBtn.onmouseover = function() { this.style.backgroundColor = '#e6edf7'; };
        agreeBtn.onmouseout = function() { this.style.backgroundColor = '#f2f6fc'; };
    });
}

// ---------- 导出（支持多种模块系统） ----------
// 在浏览器中直接使用 <script> 标签引入时，全局可用
if (typeof window !== 'undefined') {
    window.showUserAgreement = showUserAgreement;
}
