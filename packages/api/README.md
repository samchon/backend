# SDK for Client Developers
## Outline
[`@ORGANIZATION/PROJECT`](https://github.com/samchon/backend) provides SDK (Software Development Kit) for convenience.

For the client developers who are connecting to this backend server, [`@ORGANIZATION/PROJECT`](https://github.com/samchon/backend) provides not API documents like the Swagger, but provides the API interaction library, one of the typical SDK (Software Development Kit) for the convenience.

With the SDK, client developers never need to re-define the duplicated API interfaces. Just utilize the provided interfaces and asynchronous functions defined in the SDK. It would be much convenient than any other Rest API solutions.

```bash
npm install --save @ORGANIZATION/PROJECT-api
```




## Usage
Import the `@ORGANIZATION/PROJECT-api` and enjoy the auto-completion.

```typescript
import api from "@samchon/bbs-api";

import { IBbsCitizen } from "@samchon/bbs-api/lib/structures/bbs/actors/IBbsCitizen";
import { IBbsQuestionArticle } from "@samchon/bbs-api/lib/structures/bbs/articles/IBbsQuestionArticle";
import { IBbsSection } from "@samchon/bbs-api/lib/api/structures/bbs/systematic/IBbsSection";

async function main(): Promise<void>
{
    //----
    // PREPARATIONS
    //----
    // CONNECTION INFO
    const connection: api.IConnection = {
        host: "http://127.0.0.1:37001",
        password: {
            key: "pJXhbHlYfzkC1CBK8R67faaBgJWB9Myu",
            iv: "IXJBt4MflFxvxKkn"
        }
    };

    // ISSUE A CUSTOMER ACCOUNT
    const customer: IBbsCustomer = await api.functional.bbs.customers.authenticate.issue
    (
        connection,
        {
            href: window.location.href,
            referrer: window.document.referrer
        }
    );

    // ACTIVATE THE CUSTOMER
    customer.citizen = await api.functional.bbs.customers.authenticate.activate
    (
        connection,
        {
            name: "Jeongho Nam",
            mobile: "821036270016"
        }
    );

    //----
    // WRITE A QUESTION ARTICLE
    //----
    // FIND TARGET SECTION
    const sectionList: IBbsSection[] = await api.functional.bbs.customers.systematic.sections.index
    (
        connection
    );
    const section: IBbsSection = sectionList.find(section => section.type === "qna")!;

    // PREPARE INPUT DATA
    const input: IBbsQuestionArticle.IStore = {
        title: "Some Question Title",
        body: "Some Question Body Content...",
        files: []
    };

    // DO WRITE
    const question: IBbsQuestionArticle = await api.functional.bbs.customers.articles.qna.store
    (
        connection, 
        section.code,
        input
    );
    console.log(question);
}
```