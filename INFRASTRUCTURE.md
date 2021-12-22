# INTRASTRUCTURE
## 1. DBMS
### 1.1. RDB Instance
[`@${ORGANIZATION}/${PROJECT}`](https://github.com/samchon/backend) 는 RDB 로 MariaDB 의 10.5 버전을 사용한다.

그리고 DB User 는 쓰기 가능한 계정과 읽기 전용 계정으로 이원화하여 관리한다. 이 중 쓰기 가능한 계정은 오로지 백엔드 시스템 등 자동화된 프로그램 수준에서만 사용해야하며, 사람이 직접 DB 에 접속하여 통계정보 등을 SQL 쿼리로 조회하는 일 따위 등은 읽기 전용 계정을 사용한다.

```sql
-- CREATE SCHEMA WITH STRICT MODE
CREATE SCHEMA test_db_schema DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SET GLOBAL sql_mode = 'ANSI,TRADITIONAL';

-- WRITABLE ACCOUNT
CREATE USER writable_account;
SET password FOR writable_account = PASSWORD('Some Password');
GRANT SELECT, 
    INSERT, 
    UPDATE, 
    DELETE, 
    CREATE, 
    DROP, 
    INDEX, 
    ALTER, 
    CREATE TEMPORARY TABLES, 
    CREATE VIEW, 
    EVENT, 
    TRIGGER, 
    SHOW VIEW, 
    CREATE ROUTINE, 
    ALTER ROUTINE, 
    EXECUTE 
ON test_db_schema.* TO writable_account;

-- READONLY ACCOUNT
CREATE USER readonly_account;
SET password FOR readonly_account = PASSWORD('Some Password');
GRANT SELECT, EXECUTE ON test_db_schema.* TO readonly_account;

-- FINALIZATION
FLUSH PRIVILEGES;
```

### 1.2. EC2 Instance
아래 명령어를 입력하면, MariaDB 를 EC2 인스턴스에 설치할 수 있다. 

이렇게 MariaDB 를 EC2 인스턴스에 설치하는 경우, RDB 대비 비용을 크게 절약할 수 있다. 다만, 이처럼 EC2 인스턴스에 RDB 를 직접 설치하는 경우는 REAL 이 아닌 DEV 에 한정해야 할 것이다. 그리고 이 때 MariaDB 가 사용할 포트번호 `3306` 에 대한 방화벽 예외 설정을 해 줘야한다.

```bash
sudo apt-get install -y apt-transport-https
curl -sS https://downloads.mariadb.com/MariaDB/mariadb_repo_setup | sudo bash

sudo apt-get install software-properties-common
sudo add-apt-repository 'deb [arch=amd64,arm64,ppc64el] http://sfo1.mirrors.digitalocean.com/mariadb/repo/10.5/ubuntu bionic main'
sudo apt update

sudo apt-get install -y mariadb-server
sudo mysql_secure_installation # Allow remote connection
sudo vi /etc/mysql/mariadb.conf.d/50-server.cnf # Disable bind-address
sudo service mysql restart
```

설치가 끝난후, MariaDB 터미널에 접속하여 새 스키마 `test_db_schema` 를 만들어준다. 

그리고 이 때의 MariaDB 계정 역시, 쓰기 가능한 것과 읽기 전용으로 나누어 관리해야 한다. 이 중 쓰기 가능한 계정은 오로지 백엔드 시스템 등 자동화된 프로그램 수준에서만 사용해야하며, 사람이 직접 DB 에 접속하여 통계정보 등을 SQL 쿼리로 조회하는 일 따위 등은 읽기 전용 계정을 사용한다.

```sql
-- CREATE SCHEMA WITH STRICT MODE
CREATE SCHEMA test_db_schema 
    DEFAULT CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;
SET GLOBAL sql_mode = 'ANSI,TRADITIONAL';

-- WRITABLE ACCOUNT
CREATE USER writable_account;
SET password FOR writable_account = PASSWORD('Some Password');
GRANT SELECT, 
    INSERT, 
    UPDATE, 
    DELETE, 
    CREATE, 
    DROP, 
    INDEX, 
    ALTER, 
    CREATE TEMPORARY TABLES, 
    CREATE VIEW, 
    EVENT, 
    TRIGGER, 
    SHOW VIEW, 
    CREATE ROUTINE, 
    ALTER ROUTINE, 
    EXECUTE 
ON test_db_schema.* TO writable_account;

-- READONLY ACCOUNT
CREATE USER readonly_account;
SET password FOR readonly_account = PASSWORD('Some Password');
GRANT SELECT, EXECUTE ON bbs.* TO readonly_account;

-- FINALIZATION
FLUSH PRIVILEGES;
```




## 2. Backend Server
백엔드 서버를 개설하기 위해서는, 하나 내지 두 개의 포트 개설을 허가해줘야 한다.

첫 번째는 `37000` 포트로써, 무중단 업데이트 시스템의 업데이트 관리자 서버에서 사용된다. 그리고 이 업데이트 관리자 서버는 오직 마스터 서버에서만 개설되니, 만일 대상 EC2 인스턴스가 마스터 서버가 아니라면, `37000` 포트를 굳이 열어줄 필요는 없다.

두 번째는 `37001` 포트로써, 백엔드 서버에서 사용된다. 따라서, 대상 EC2 인스턴스가 마스터 서버이던 아니던, `37001` 포트는 반드시 열어줘야 한다.

  - port numbers
    - `37000`
      - 무중단 시스템의 업데이트 관리자 서버
      - 오직 마스터 서버에서만 설정해주면 된다
    - `37001`
      - 백엔드 서버
      - 모든 인스턴스에서 사용

포트 개설 설정을 완료한 후, 아래 명령어를 통하여 백엔드 서버를 설치하고 구동하자.

```bash
################################
# PREPARE ASSETS
################################
# CHANGE TIMEZONE
sudo timedatectl set-timezone Asia/Seoul

# INSTALL NODE
sudo apt-get update
sudo apt-get install curl
curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -

# INSTALL COMPILERS
sudo apt-get -y install git
sudo apt-get -y install nodejs
sudo apt-get -y install npm

# CONFIGURATION
sudo sysctl net.core.somaxconn=2048

################################
# BUILD PROJECT
################################
# CLONE REPOSITORY
git config --global credential.helper store
git clone https://github.com/samchon/backend
cd ${PROJECT}

# INSTALL PROJECT
npm install
npm run build

################################
# MOUNT SERVER
################################
# ONLY WHEN MASTER INSTANCE
npm run start:updator:master

# ONLY WHEN SLAVE INSTANCE
npm run start:updator:slave real

# START SERVER - USE ONE OF BELOW
npm run start dev
npm run start real
npm run start real master
```