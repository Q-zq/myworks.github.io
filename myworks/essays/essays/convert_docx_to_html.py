import os
import docx
from bs4 import BeautifulSoup

# 转换单个docx文件为HTML
def convert_docx_to_html(docx_path, html_path):
    try:
        # 打开docx文件
        doc = docx.Document(docx_path)
        
        # 创建HTML结构
        html_content = f"""
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{os.path.splitext(os.path.basename(docx_path))[0]}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #E1F5FE;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #29B6F6;
            margin-bottom: 20px;
        }
        p {
            margin-bottom: 15px;
        }
        .back-link {
            display: inline-block;
            margin-top: 20px;
            padding: 8px 16px;
            background-color: #29B6F6;
            color: white;
            text-decoration: none;
            border-radius: 4px;
        }
        .back-link:hover {
            background-color: #0288D1;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>{os.path.splitext(os.path.basename(docx_path))[0]}</h1>
"""
        
        # 提取文档内容
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                html_content += f"        <p>{paragraph.text}</p>\n"
        
        # 结束HTML结构
        html_content += f"""
        <a href="../index.html" class="back-link">返回首页</a>
    </div>
</body>
</html>
"""
        
        # 写入HTML文件
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"已转换: {docx_path} -> {html_path}")
    except Exception as e:
        print(f"转换失败 {docx_path}: {e}")

# 批量转换文件夹中的所有docx文件
def batch_convert(folder_path):
    # 确保输出目录存在
    output_folder = os.path.join(folder_path, "html")
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    # 遍历文件夹中的所有docx文件
    for filename in os.listdir(folder_path):
        if filename.endswith('.docx') and not filename.startswith('~$'):
            docx_path = os.path.join(folder_path, filename)
            html_filename = os.path.splitext(filename)[0] + '.html'
            html_path = os.path.join(output_folder, html_filename)
            convert_docx_to_html(docx_path, html_path)
    
    print("\n转换完成！")

if __name__ == "__main__":
    # 散文集文件夹路径
    essays_folder = "r:\\myworks\\essays\\散文集"
    batch_convert(essays_folder)