# Contribution Guide
## To Publish an issue
Thanks for your advise. Before publishing an issue, please check some components.

### 1. Search for duplicates
Before publishing an issue, please check whether the duplicated issue exists or not.

  - [Ordinary Issues](https://github.com/samchon/backend/issues)

### 2. Did you find a bug?
When you reporting a bug, then please write about those items:

  - What version you're using
  - If possible, give me an isolated way to reproduce the behavior.
  - The behavior your expect to see, and the actual behavior.

### 3. Do you have a suggestion?
I always welcome your suggestion. When you publishing a suggestion, then please write such items: 

  - A description of the problem you're trying to solve.
  - An overview of the suggested solution.
  - Examples of how the suggestion whould work in various places.
    - Code examples showing the expected behavior.




## Contributing Code
### Test your code
Before sending a pull request, please test your new code. You type the command `npm run build &&& npm run test`, then compiling your code and test-automation will be all processed.

```bash
# COMPILE
npm run build

# DO TEST
npm run test
```

If you succeeded to compile, but failed to pass the test-automation, then *debug* the test-automation module. I've configured the `.vscode/launch.json`. You just run the `VSCode` and click the `Start Debugging` button or press `F5` key. By the *debugging*, find the reason why the *test* is failed and fix it.

### Adding a Test
If you want to add a testing-logic, then goto the `src/test` directory. It's the directory containing the test-automation module. Declare some functions starting from the prefix `test_`. Then, they will be called after the next testing.

Note that, the special functions starting from the prefix `test_` must be `export`ed. They also must return one of them:
  - `void`
  - `Promise<void>`

When you detect an error, then throw exception such below:

```typescript
import { assert } from "typescript-is";
import api from "../../../../../../api";
import { IBbsCustomer } from "../../../../../../api/structures/bbs/actors/IBbsCustomer";
import { IMember } from "../../../../../../api/structures/members/IMember";

import { Configuration } from "../../../../../../Configuration";
import { RandomGenerator } from "../../../../../../utils/RandomGenerator";
import { exception_must_be_thrown } from "../../../../../internal/exception_must_be_thrown";
import { prepare_random_citizen } from "../internal/prepare_random_citizen";
import { test_bbs_customer_activate } from "./test_bbs_customer_activate";

export async function test_bbs_customer_join_after_activate
    (connection: api.IConnection): Promise<void>
{
    const customer: IBbsCustomer = await test_bbs_customer_activate(connection);

    // DIFFERENT CITIZEN
    await exception_must_be_thrown
    (
        "Customer join after activation with different citizen info",
        () => api.functional.bbs.customers.authenticate.join
        (
            connection,
            {
                email: `${RandomGenerator.alphabets(16)}@samchon.org`,
                password: Configuration.SYSTEM_PASSWORD(),
                citizen: prepare_random_citizen()
            }
        )
    );

    // SAME CITIZEN
    const member: IMember = await api.functional.bbs.customers.authenticate.join
    (
        connection,
        {
            email: `${RandomGenerator.alphabets(16)}@samchon.org`,
            password: Configuration.SYSTEM_PASSWORD(),
            citizen: customer.citizen
        }
    );
    assert<typeof member>(member);
}
```



## Sending a Pull Request
Thanks for your contributing. Before sending a pull request to me, please check those components.

### 1. Include enough descriptions
When you send a pull request, please include a description, of what your change intends to do, on the content. Title, make it clear and simple such below:

  - Refactor features
  - Fix #17
  - Add tests for #28

### 2. Include adequate tests
As I've mentioned in the `Contributing Code` section, your PR should pass the test-automation module. Your PR includes *new features* that have not being handled in the ordinary test-automation module, then also update *add the testing unit* please.

If there're some specific reasons that could not pass the test-automation (not error but *intended*), then please update the ordinary test-automation module or write the reasons on your PR content and *const me update the test-automation module*.




## References
I've referenced contribution guidance of the TypeScript.
  - https://github.com/Microsoft/TypeScript/blob/master/CONTRIBUTING.md