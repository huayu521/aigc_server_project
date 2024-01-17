# 使用一个基础镜像
FROM python:3.8

# 设置工作目录
WORKDIR /app

# 复制应用代码到容器中
COPY . /app

# 安装应用依赖
RUN pip install --no-cache-dir -r requirements.txt

# 暴露应用端口
EXPOSE 5000

# 启动应用
CMD ["python", "backend.py", "--threads", "8"]