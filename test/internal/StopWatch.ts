export namespace StopWatch {
  export type Task<T> = () => Promise<T>;

  export const measure = async <T>(task: Task<T>): Promise<[T, number]> => {
    const time: number = Date.now();
    const output: T = await task();
    return [output, Date.now() - time];
  };

  export const trace =
    (title: string) =>
    async <T>(task: Task<T>): Promise<[T, number]> => {
      process.stdout.write(`  - ${title}: `);
      const res: [T, number] = await measure(task);

      console.log(`${res[1].toLocaleString()} ms`);
      return res;
    };
}
