document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const pauseButton = document.getElementById('pauseButton');
    const flipHButton = document.getElementById('flipHButton');
    const flipVButton = document.getElementById('flipVButton');
    const dlButton = document.getElementById('dlButton');
    
    const grayButton = document.getElementById('grayButton');
    const resetButton = document.getElementById('resetButton');
    
    let stream = null;
    let isHorizontalFlipped = true; // デフォルトで水平反転
    let isVerticalFlipped = false;
    let isPaused = false;
    let isGrayscale = false;
    
    // カメラ起動
    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            
            video.srcObject = stream;
            startButton.disabled = true;
            stopButton.disabled = false;
            pauseButton.disabled = false;
            flipHButton.disabled = false;
            flipVButton.disabled = false;
            dlButton.disabled = false;
            grayButton.disabled = false;
            resetButton.disabled = false;
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('カメラへのアクセスに失敗しました。カメラの許可設定を確認してください。');
        }
    }
    
    // カメラ停止
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            
            startButton.disabled = false;
            stopButton.disabled = true;
            pauseButton.disabled = true;
            flipHButton.disabled = true;
            flipVButton.disabled = true;
            dlButton.disabled = true;
            grayButton.disabled = true;
            resetButton.disabled = true;
            
            // フィルターをリセット
            video.style.filter = '';
            isGrayscale = false;
        }
    }
    
    // ポーズ/再生
    function togglePause() {
        if (isPaused) {
            video.play();
            pauseButton.innerHTML = '<i class="ph ph-pause"></i>';
        } else {
            video.pause();
            pauseButton.innerHTML = '<i class="ph ph-play"></i>';
        }
        isPaused = !isPaused;
    }
    
    // 水平反転
    function toggleHorizontalFlip() {
        isHorizontalFlipped = !isHorizontalFlipped;
        updateTransform();
    }
    
    // 垂直反転
    function toggleVerticalFlip() {
        isVerticalFlipped = !isVerticalFlipped;
        updateTransform();
    }
    
    // ビデオの変形を更新
    function updateTransform() {
        let transform = '';
        
        if (isHorizontalFlipped) {
            transform += 'scaleX(-1) ';
        }
        
        if (isVerticalFlipped) {
            transform += 'scaleY(-1) ';
        }
        
        video.style.transform = transform.trim();
    }
    
    // グレースケールフィルター
    function toggleGrayscale() {
        isGrayscale = !isGrayscale;
        video.style.filter = isGrayscale ? 'grayscale(100%)' : '';
    }
    
    // フィルターをリセット
    function resetAll() {
        isHorizontalFlipped = true;
        isVerticalFlipped = false;
        isGrayscale = false;
        video.style.filter = '';
        updateTransform();
    }
    
    // 現在のフレームをダウンロード
    function downloadFrame() {
        // キャンバスを作成
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        // キャンバスにビデオのフレームを描画
        const ctx = canvas.getContext('2d');
        
        // 変形を適用
        ctx.save();
        if (isHorizontalFlipped) {
            ctx.scale(-1, 1);
            ctx.translate(-canvas.width, 0);
        }
        if (isVerticalFlipped) {
            ctx.scale(1, -1);
            ctx.translate(0, -canvas.height);
        }
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        
        // グレースケールフィルターを適用
        if (isGrayscale) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = avg;
                data[i + 1] = avg;
                data[i + 2] = avg;
            }
            ctx.putImageData(imageData, 0, 0);
        }
        
        // ダウンロードリンクを作成
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = `reverse-cam-${new Date().toISOString().replace(/:/g, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    
    // イベントリスナーの設定
    startButton.addEventListener('click', startCamera);
    stopButton.addEventListener('click', stopCamera);
    pauseButton.addEventListener('click', togglePause);
    flipHButton.addEventListener('click', toggleHorizontalFlip);
    flipVButton.addEventListener('click', toggleVerticalFlip);
    dlButton.addEventListener('click', downloadFrame);
    grayButton.addEventListener('click', toggleGrayscale);
    resetButton.addEventListener('click', resetAll);
    
    // 初期状態のボタンの有効/無効
    stopButton.disabled = true;
    pauseButton.disabled = true;
    flipHButton.disabled = true;
    flipVButton.disabled = true;
    dlButton.disabled = true;
    grayButton.disabled = true;
    resetButton.disabled = true;
});