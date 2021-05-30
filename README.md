# Backend Template
## 1. Outline
A template repository for Typescript Backend Server using those libraries:

  - [Nestia](https://github.com/samchon/nestia)
  - [Safe-TypeORM](https://github.com/samchon/safe-typeorm)

Erase the upper text and introduce your project in this section.




## 2. Installation
### 2.1. NodeJS
This backend server has implemented through TypeScript and it runs on the NodeJS. Therefore, to mount this backend server on your local machine, you've to install the NodeJS.

  - https://nodejs.org/en/

Also as you can see from the [package.json](package.json) file, this project requires the private npm module `@samchon`, provided from the Github. Therefore, to develop this backend server, you've configure the `.npmrc` file. Open the below link and complete the configuration.

  - https://github.com/features/packages

### 2.2. MariaDB
This backend server has adopted MariaDB as principle DB. Therefore, to mount this backend server on your local machine, you've to install the MariaDB. Click the below link, download and install the `MariaDB@10.5`.

  - https://downloads.mariadb.org/mariadb/10.5/

After the installation, open a terminal and configure account and password as `root`.

> ```bash
> sudo mysqladmin -u root password 'root'
> ```

After the account configuration, connect to the MariaDB and create a new DB schema `backend_template_test`. Also, you should change the `sql_mode` options like below to enhance the strict grammer check for the safe development. 

For a representatively, the `ONLY_FULL_GROUP_BY` condition occurs a syntax error when non-aggregated field has been appeared in the `SELECT` statement who is using the `GROUP BY` statement.

```sql
-- CREATE A NEW SCHEMA
CREATE SCHEMA backend_template_test 
    DEFAULT CHARACTER SET 
    utf8 COLLATE utf8_unicode_ci;

-- STRICT MODE
SET GLOBAL sql_mode = CONCAT_WS(',',
    'IGNORE_SPACE',
    'ONLY_FULL_GROUP_BY',
    'STRICT_TRANS_TABLES',
    'NO_ZERO_IN_DATE',
    'NO_ZERO_DATE',
    'ERROR_FOR_DIVISION_BY_ZERO',
    'NO_AUTO_CREATE_USER',
    'NO_ENGINE_SUBSTITUTION'
);
```

### 2.3. Repository
From now on, you can start the backend server development, right now. 

Just download this project through the git clone command and install dependencies by the npm install command. After those preparations, you can start the development by typing the `npm run dev` command.

```bash
# CLONE REPOSITORY
git clone https://github.com/samchon/backend-template
cd backend-template

# INSTALL DEPENDENCIES
npm install

# START DEVELOPMENT (tsc --watch)
npm run dev
```

### 2.4. Data
When those installations are all completed, you can mount the basic data up or start the local backend server by typing below commands.

At first, `npm run setup` is a command seed the initial data. Range of the initial data means that minimum data that is required for running the local backend server. Therefore, to mount the backend server up, you've to run the `npm run setup` command, at least.

At second, `npm run test` is a command running the test automation program. The test automation program not only seeds the initial data, but also generates sample data during the testing. Also, you've to know that, whenever run the `npm run test` command, the local DB would be reset. Therefore, you've consider it carefully, whenever calling the `npm run test` command.

```bash
# Seed initial data
# minimum data to running the local backend server
npm run setup 

# Run test automation program
# seed not only initial data, but also sample data
# it resets the local DB
npm run test 

# Start the local backend server
npm run start local 

# Stop the local backend server
npm run stop 
```




## 3. Development
### 3.1. Definition
If you want to add a new feature or update ordinary thing in the API level, you should write the code down to the matched *API controller*, who is stored in the [src/controllers](src/controllers) directory as the [Main Program](#34-main-program). 

However, [@samchon](https://github.com/samchon) does not recommend to writing code down into the [Main Program](#34-main-program) first, without any consideration. Instead, [@samchon](https://github.com/samchon) recommends to declare the definition first and implement the [Main Program](#34-main-program) later.

Therefore, if you want to add a new feature in the API level, define the matched data entity in the [src/models](src/models) and [src/api/structures](src/api/structures) directories. After the data entity definition, declare function header in the matched API controller class in the [src/controllers](src/controllers). Note that, it's only the declaration, header only, not meaning to implement the function body.

After those declarations, build the [SDK](#32-sdk) through the `npm run sdk` command and implement the [Test Automation Program](#33-test-automation-program) using the [SDK](#32-sdk) with use case scenarios. Development of the [Main Program](#34-main-program) should be started after those preparations are all being ready. Of course, the [Main Program](#34-main-program) can be verified with the pre-developed [Test Automation Program](#33-test-automation-program) in everytime.

  - Declare data entity
  - Declare API function header
  - Build [SDK](32-sdk)
  - Implement the [Test Automation Program](#33-test-automation-program)
  - Develop the [Main Program](#34-main-program)
  - Validate the [Main Program](#34-main-program) through the [Test Automation Program](#33-test-automation-program)
  - Deploy to the Dev and Real servers.

### 3.2. SDK
`@samchon/backend` providers SDK (Software Development Kit) library for convenience.

For the clients who are connecting to this backend server, `@samchon/backend` provides not API documents like Swagger, but SDK (Software Development Kit) library for the convenience. 

With the SDK library, client developers never need to re-define the duplicated API interfaces. Just utilize the provided interfaces and asynchronous functions defined in the SDK library, it would be much convenient than any other Rest API solutions.

To build the SDK, just type the `npm run sdk` command. The SDK library would be generated by [Nestia](https://github.com/samchon/nestia), by analyzing source code of the [controller](src/controllers) classes in the compilation level, automatically.

After the SDK building, you can publish the SDK library by writing the `npm publish` command.

```bash
npm run sdk
npm publish
```

### 3.3. Test Automation Program
> TDD (Test Driven Development)

After the [Definition](#31-definition) and [SDK](#32-sdk) generation, you've to design the use-case scenario and implement a test automation program who represents the use-case scenario and guarantees the [Main Program](#34-main-program).

To add a new test function in the Test Automation Program, create a new ts file under the [src/test/features](src/test/features) directory following the below category and implement the test scenario function with representative function name and `export` symbol. I think many all of the ordinary files wrote in the [src/test/features](src/test/features) directory would be good sample for you. Therefore, I will not describe how the make the test function detaily.

  - [src/test/features/api](src/test/features/api)
    - About the [SDK](#32-sdk) that would be provided to the frontend developers,
    - Validate the matched API implemented in the [Main Program](#34-main-program)
    - Use all of the API functions, through lots of scenarios
    - Most of the test functions are belonged to this category
  - [src/test/features/models](src/test/features/models)
    - About the ORM Model classes
    - Validate tables, methods, and even materialized views
    - through lots of scenarios
  - [src/test/features/external](src/test/features/external)
    - Open virtual external systems
    - Validate interactions with this backend server

Anyway, you've to remind that, the Test Automation Program resets the DB schema whenever being run. Therefore, you've to be careful if import data has been stored in the local (or dev) DB server. To avoid the resetting the DB, configure the `skipReset` option like below.

Also, the Test Automation Program runs all of the test functions placed into the [src/test/features](src/test/features) directory. However, those full testing may consume too much time. Therefore, if you want to reduce the testing time by specializing some test functions, use the `include` option like below.

  - supported options
    - `mode`: mode of the target server
      - *local*
      - *dev*
      - ~~*real*~~
    - `include`: test only restricted functions who is containing the special keyword.
    - `exclude`: exclude some functions who is containing the special keyword.
    - `skipReset`: do not reset the DB
    - `skipSeed`: do not seed the initial data
    - `count`: repeating count of the test automation program.

```bash
# test in the dev server
npm run test -- --mode=dev

# test without db reset & initial data seeding
npm run test -- --skipReset --skipSeed

# test only restricted functions whose name contain the "bbs" keyword
# do not reset db
# do not seed initial data
npm run test -- --include=bbs --skipReset --skipSeed
```

### 3.4. Main Program
After [Definition](#31-definition), [SDK](#32-sdk) building and [Test Automation Program](#33-test-automation-program) are all prepared, finally you can develop the Main Program. Also, when you complete the Main Program implementation, it would better to validate the implementation through the pre-built [SDK](#32-sdk) and [Test Automation Program](#33-test-automation-program).

However, do not commit a mistake that writing source codes only in the [controller](src/controllers) classes. The API Controller must have a role that only intermediation. The main source code should be write down separately following the directory categorizing. Especially, source code about DB I/O should be written down in the [src/providers](src/providers) directory.




## 4. Deploy
### 4.1. Local Server
### 4.2. Dev Server
### 4.3. Real Server




## 5. Appendix
### 5.1. NPM Dev Dependencies
Running the `npm publish` command in this project means that, publishing the [SDK](#32-sdk). 

Therefore, if you want to install any npm module required for the backend server, you've to instal the module using the `--save-dev` option. Otherwise, there's an npm module that is required for the [SDK](#32-sdk), use the `--save-dev` tag.

```bash
# REQUIRED FOR BACKEND SERVER
npm install --save-dev nestia

# REQUIRED FOR SDK
npm  install --save node-fetch
```

### 5.2. NPM Run Commands
List of the run commands defined in the [package.json](package.json) are like below:

  - `build`: Compile the source code
  - `dev`:Incremental compilation using the `--watch` option.
  - `reset:dev`: Restart the dev backend server with DB reset.
  - `sdk`: Build SDK
  - `start`: Start the backend server
    - `npm run start local`
    - `npm run start dev`
    - `npm run start real`
  - `start:updator:master`: Start non-distruptive update system (master)
  - `start:updator:slave`: Start non-distruptive update system (slave)
  - `start:reload`: Restart the backend server
  - `stop`: Stop the backend server
  - `stop:updator:master`: Stop non-distruptive update system (master)
  - `stop:updator:salve`: Stop non-distruptive update system (slave)
  - `update`: Start the non-distruptive update
    - npm run update dev
    - npm run update real
  - `test`: Start the [Test Automation Program](#33-test-automation-program)
  - `test:update`: Test the non-distruptive update system

### 5.3. Github Action


### 5.4. Related Projects
Write the related projects down.