# Yuyi's Journal 3.0 — GitHub Pages + Decap CMS

這個版本把網站升級成真正的「可長期經營部落格」：
- GitHub Pages：免費公開網站
- Jekyll：自動把文章 Markdown 建成漂亮的文章頁
- Decap CMS：從 `/admin/` 直接新增/編輯文章、上傳照片
- Decap Turbo：負責 CMS 登入與 GitHub API 連線
- Utterances：文章留言
- Travel / Diary / Life / Archive
- SEO meta、sitemap、RSS
- 手機版

## 第一次設定（只做一次）
1. 把整個資料夾內容上傳到 `sayusaber-stack.github.io` repo，並覆蓋舊版。
2. 到 Decap Turbo 建立免費帳號/organization。
3. 連接 GitHub，選 `sayusaber-stack.github.io`。
4. 建立 Site：
   - Repo: `sayusaber-stack/sayusaber-stack.github.io`
   - Branch: `main`
   - Config path: `admin/config.yml`
   - Admin URL: `https://sayusaber-stack.github.io/admin/`
5. 複製 Turbo Site ID。
6. 編輯 `admin/config.yml`，把 `REPLACE_WITH_YOUR_DECAP_TURBO_SITE_ID` 換成 Site ID。
7. Commit 後等待 GitHub Pages 部署。
8. 以後直接開 `https://sayusaber-stack.github.io/admin/` 登入，就能新增文章與照片。

## 重要
不要把 ZIP 上傳。請先解壓縮，將裡面的「全部檔案與資料夾」放進 repo 根目錄。
若 GitHub Pages 的 Pages 設定仍是 `main / (root)`，保持不變即可。

## 新增文章
後台 → 文章 → New → 標題、日期、分類、封面照片、內容 → Publish。
CMS 會直接把內容寫回 GitHub；GitHub Pages 再自動重新部署。

## 留言
文章頁使用 Utterances。第一次使用前，請在 GitHub repo 開啟 Discussions/Issues 並依 Utterances 指示授權 repo。
