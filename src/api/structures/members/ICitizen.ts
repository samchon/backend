export interface ICitizen
{
    id: string;
    mobile: string;
    name: string;
}

export namespace ICitizen
{
    export interface IStore
    {
        mobile: string;
        name: string;
    }
}