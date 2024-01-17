const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const finishButton = document.getElementById("finishButton");
let imageLoaded = false;
let isDrawing = false;
let points = [];
let imageFilename = null;

startButton.addEventListener("click", startDrawing);
finishButton.addEventListener("click", eraseEnclosedArea);

function uploadImage() {
    var fileInput = document.getElementById("fileInput");
    fileInput.click();

    fileInput.addEventListener("change", function() {
        resetCanvas();
        var file = fileInput.files[0];
        var formData = new FormData();
        formData.append("file", file);

        fetch("/upload", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.success) {
                // 如果上传成功，更新图片的 src
                // var image = document.getElementById("image");
                    imageFilename = data.image_path;
                    console.error("imageFilename:", imageFilename);
                    var reader = new FileReader();

                    reader.onload = function (e) {
                    const img = new Image();
                    img.onload = function () {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        console.error("width:", img.width);
                        console.error("height:", img.height);
                        ctx.drawImage(img, 0, 0); // 绘制时指定宽高
                        imageLoaded = true;
                    };
                    img.src = e.target.result;
                };

                reader.readAsDataURL(file);
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
    });
}

function startDrawing() {
    if (imageLoaded) {
        isDrawing = true;
        points = [];
        ctx.globalCompositeOperation = 'source-over'; // 设置擦除模式为覆盖源图像
    }
}

function eraseEnclosedArea() {
    var points_tmp = points
    if (imageLoaded && points.length > 2) {
        ctx.save();

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.closePath();
        ctx.clip();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.restore();
        resetCanvas();


        // After erasing, send the image path and points to process the modified image
        fetch('/process_image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_path: imageFilename,
                points: points_tmp
            }),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            // You can display the modified image or perform any other actions
            // 显示生成的新图片
            loadImage(data.generated_image_path);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

function resetCanvas() {
    isDrawing = false;
    points = [];
    ctx.globalCompositeOperation = 'source-over'; // 恢复擦除模式为默认
}

canvas.addEventListener("mousedown", function (e) {
    if (isDrawing) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        points.push({ x, y });

        ctx.beginPath();
        ctx.moveTo(x, y);
    }
});

canvas.addEventListener("mousemove", function (e) {
    if (isDrawing && e.buttons === 1) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        points.push({ x, y });

        ctx.lineTo(x, y);
        ctx.stroke();
    }
});

canvas.addEventListener("mouseup", function () {
    if (isDrawing) {
        isDrawing = false;
    }
});
function submitSelection() {

    const selectedTypeRadio = document.querySelector('input[name="Typeselection"]:checked');

    const selectedStyleRadio = document.querySelector('input[name="Styleselection"]:checked');

    if (selectedTypeRadio && selectedStyleRadio) {
        const selectedTypeValue = selectedTypeRadio.value;

        const selectedStyleValue = selectedStyleRadio.value;

        fetch('/process_selection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ selectedTypeValue, selectedStyleValue}),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        console.log('No option selected.');
    }
}