export interface ISystem
{
    uid: number;
    arguments: string[];
    commit: ISystem.ICommit;
    package: ISystem.IPackage;
    created_at: string;
}

export namespace ISystem
{
    export interface ICommit
    {
        shortHash: string;
        branch: string;
        hash: string;
        subject: string;
        sanitizedSubject: string;
        body: string;
        author: ICommit.IUser;
        committer: ICommit.IUser;
        authored_at: string;
        commited_at: string;
        notes?: string;
        tags: string[];
    }
    export namespace ICommit
    {
        export interface IUser
        {
            name: string;
            email: string;
        }
    }

    export interface IPackage
    {
        name: string;
        version: string;
        description: string;
        main: string;
        typings: string;
        scripts: Record<string, string>;
        repository: { type: "git", url: string; };
        author: string;
        license: string;
        bugs: { url: string; };
        homepage: string;
        devDependeicies: Record<string, string>;
        dependencies: Record<string, string>;
        publishConfig: { registry: string; };
        files: string[];
    }
}