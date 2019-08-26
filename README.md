## db-migration 說明
### 功能
* 多主機 多db migration管理
### 安裝
* 安裝global工具
  npm install mocha gulp
* 目錄下執行 npm install
### 開發指令
* gulp init
  初始化建立conf設定目錄
* gulp --host 主機 --db db名稱 --table table名稱 --params
  - 建立指定主機指定db上的table schema
  - table (非必填)若不設定為設定則會建立整個db table scema
  - params 設定table欄位參數
### 設定檔
* hosts.yml 設定db主機資訊
### 規格
* 主系統框架: Express https://expressjs.com/
* Token: 使用JWT https://jwt.io/
* API規格: JSON API https://jsonapi.org/
* ORM: Sequalizejs https://sequelize.org/master/
* 單元測試: mocha https://mochajs.org/
* API測試: supertest https://github.com/visionmedia/supertest
* Task Runner: gulp https://gulpjs.com/

### 使用
1. 初次使用gulp init 建立conf目錄
    - 請設定要連線的db主機相關連線
2. 執行gulp --host xx --db xx
    - 將會在hosts目錄下建立db migration管理目錄
