# INTRASTRUCTURE
## 1. DBMS
### 1.1. RDB Instance
[`@${ORGANIZATION}/${PROJECT}`](https://github.com/samchon/backend) is using the `MariaDB@10.5` as its DBMS.

Also, the accounts of the DBMS are separated to the `readonly` and `writable`. In the policy, `writable` account only can be used in automated program like the backend server. The developer or someone else need to connect to the DBMS directly, they're allowed to use only the `readonly` account.

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
If you're planning to install the MariaDB on the EC2 instance, instead of the RDB instance, to reduce costs, you can install the MariaDB by inserting below commands. Of course, you should allow the MariaDB port number, `3306`.

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

After the install, open the MariaDB terminal and create the new schema `test_db_schema`. Also, you must separate accounts of the MariaDB to `readonly` and `writable`. In the policy, `writable` account only can be used in automated program like the backend server. The developer or someone else need to connect to the DBMS directly, they're allowed to use only the `readonly` account.

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
To open a backend server, you need to permit one or two ports. 

The first is the `37000` port, that is used by an non-distriptive distribution updator server. The updator server is opened only in the master instance, therefore you don't need to open the `37000` port, if the newly created EC2 instance is not the master server.

The second is the `37001` port, that is used by the backend server. Therefore, you've open the `37001` port whether the newly created EC2 instance is master or not.

  - port numbers
    - `37000`
      - for non-distruptive distribution update system
      - configure it only for the master instance
    - `37001`
      - for the backend server
      - it must be configured in the every instances

After opening the matched port(s), install the backend server and mount the server up.

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