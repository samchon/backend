export interface IUpdateController {
    update(): Promise<void>;
    revert(commit: string): Promise<void>;
}
