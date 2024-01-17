# backend.py

from flask import Flask, render_template, request, jsonify, send_from_directory
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import os

app = Flask(__name__)

# 添加静态文件夹配置
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'static', 'images')

# Serve uploaded images
@app.route('/images/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():
    try:
        # 获取上传的文件
        uploaded_file = request.files["file"]

        # 保存文件到指定目录（这里为 uploads 文件夹）
        upload_folder = "uploads"
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        # 打开原始图像
        # original_image = Image.open(uploaded_file)

        # 创建一个新的图像，设置大小为512x512
        # resized_image = original_image.resize((512, 512))

        # 保存调整大小后的图像
        image_path = "uploads/" + uploaded_file.filename
        uploaded_file.save(image_path)
        
        return jsonify({"success": True, "message": "File uploaded successfully!", "image_path": image_path})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


# Route to process the modified image
@app.route("/process_image", methods=["POST"])
def process_image():
    print(f'image_path:')
    data = request.get_json()

    if 'image_path' not in data or 'points' not in data:
        return jsonify({'error': 'Invalid request data'}), 400

    image_path = data['image_path'] 
    print(f'image_path: {image_path}')
    raw_points = data.get('points', [])
    print(f'raw_points: {raw_points}')
    # 保存文件到指定目录（这里为 uploads 文件夹）

    # Convert the raw points to a list of tuples
    points = [(point['x'], point['y']) for point in raw_points]
    upload_folder = "drow"

    modified_image_path = os.path.join(upload_folder, 'modified_' + os.path.basename(image_path))

    # Open the original image
    original_image = Image.open(image_path)

    # Create a mask based on the enclosed area
    mask = Image.new('L', original_image.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon(points, outline=1, fill=1)
    mask = mask.filter(ImageFilter.MinFilter(3))

    # Apply the mask to the original image
    modified_image = Image.new('RGBA', original_image.size, (255, 255, 255, 0))
    modified_image.paste(original_image, mask=mask)

    # Save the modified image
    modified_image = modified_image.convert("RGB")
    modified_image.save(modified_image_path)

    return jsonify({'message': 'Image processed successfully', 'modified_image_path': modified_image_path})


@app.route('/process_selection', methods=['POST'])
def process_selection():
    data = request.get_json()

    if 'selectedTypeValue' in data:
        selected_type_value = data['selectedTypeValue']
        selected_style_value = data['selectedStyleValue']
        # 在这里处理所选择的值，可以打印到后台
        message = f'Select : {selected_type_value}_{selected_style_value}, 正在生成请等候......'
        print('Selected Value:', selected_type_value, selected_style_value)
        return jsonify({'message': message})
    else:
        return jsonify({'error': 'Invalid request data'}), 400

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')