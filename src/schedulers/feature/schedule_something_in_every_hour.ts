export async function schedule_something_in_every_hour(interval: number): Promise<void>
{
    if (interval < ONE_HOUR)
        return;

    // DO SOMETHING
}

const ONE_HOUR = 60 * 60 * 1000;