# PDF Annotator for Notion

在浏览器中查看 PDF、添加高亮和批注，数据保存到 Notion 数据库。

## 功能

- 📄 浏览器内查看 PDF
- 🖍️ 文字高亮（黄色标记）
- 📝 点击添加批注
- 💾 标注数据保存到 Notion 数据库
- 📂 从 Notion 加载历史标注

## 使用方法

### 1. 配置 Notion

1. 在 Notion 创建一个数据库，添加字段：
   - `Name` (Title)
   - `Annotations` (Text / Rich Text)
2. 创建 Integration：https://www.notion.so/my-integrations
3. 复制 Integration Token
4. 在数据库页面，点击 `...` → `Connections` → 添加你的 Integration
5. 复制数据库 ID（URL 中 32 位字符）

### 2. 使用工具

1. 点击「设置 Notion」输入 Token 和数据库 ID
2. 点击「打开 PDF」选择文件
3. 使用高亮/批注工具标记 PDF
4. 点击「保存」将标注存入 Notion

## 部署到 GitHub Pages

```bash
# 创建仓库后
git push origin main
# 在仓库 Settings → Pages → Source: main branch
```

## 集成到 Notion

在 Notion 页面中使用 `/embed` 嵌入 GitHub Pages 的 URL。
