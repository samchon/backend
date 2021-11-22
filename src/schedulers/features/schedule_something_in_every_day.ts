export async function schedule_something_in_every_day(interval: number): Promise<void>
{
    if (interval < ONE_DAY)
        return;

    // DO SOMETHING
}

const ONE_DAY = 24 * 60 * 60 * 1000;