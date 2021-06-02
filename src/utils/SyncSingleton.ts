export class SyncSingleton<T>
{
    private readonly closure_: () => T;
    private value_: T | object;

    public constructor(closure: () => T)
    {
        this.closure_ = closure;
        this.value_ = NOT_MOUNTED_YET;
    }

    public get(): T
    {
        if (this.value_ === NOT_MOUNTED_YET)
            this.value_ = this.closure_();
        return this.value_ as T;
    }
}

const NOT_MOUNTED_YET = {};