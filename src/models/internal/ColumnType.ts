export namespace ColumnType
{
    export function bool(): "bool" | "tinyint"
    {
        return "bool";
    }

    export function text(): "text" | "longtext"
    {
        return "longtext";
    }
}