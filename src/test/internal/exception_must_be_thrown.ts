export async function exception_must_be_thrown
(
    title: string,
    task: () => Promise<any>
): Promise<void>
{
    try
    {
        await task();
    }
    catch 
    {
        return;
    }
    throw new Error(`Bug on ${title}: exception must be thrown.`);
}