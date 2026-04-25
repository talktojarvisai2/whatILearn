(function () {
    const body = document.body;
    if (!body) return;

    const commonPath = body.dataset.commonPath || "common";

    // Add any new background images here (img3.jpg, img4.avif, etc.).
    const imageNames = [
        "img1.jpg",
        "img2.avif",
        "img3.jpg",
        "img4.avif",
        "img5.jpg",
        "img6.avif"
    ];

    function setBackground(url) {
        body.style.backgroundImage =
            "linear-gradient(rgba(255,255,255,0.24), rgba(255,255,255,0.24)), url('" + url + "')";
        body.style.backgroundAttachment = "fixed";
        body.style.backgroundPosition = "center";
        body.style.backgroundRepeat = "no-repeat";
        body.style.backgroundSize = "cover";
    }

    function tryNext(startIndex) {
        let attempts = 0;
        let idx = startIndex;

        function checkCurrent() {
            if (attempts >= imageNames.length) return;

            const filename = imageNames[idx];
            const path = commonPath + "/" + filename;
            const img = new Image();

            img.onload = function () {
                setBackground(path);
            };

            img.onerror = function () {
                attempts++;
                idx = (idx + 1) % imageNames.length;
                checkCurrent();
            };

            img.src = path;
        }

        checkCurrent();
    }

    const start = Math.floor(Math.random() * imageNames.length);
    tryNext(start);
})();
