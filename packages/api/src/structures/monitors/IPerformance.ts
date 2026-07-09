export interface IPerformance {
  cpu: IPerformance.ICpuUsage;
  memory: IPerformance.IMemoryUsage;
  resource: IPerformance.IResourceUsage;
}
export namespace IPerformance {
  export interface ICpuUsage {
    user: number;
    system: number;
  }
  export interface IMemoryUsage {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  }
  export interface IResourceUsage {
    userCPUTime: number;
    systemCPUTime: number;
    maxRSS: number;
    sharedMemorySize: number;
    unsharedDataSize: number;
    unsharedStackSize: number;
    minorPageFault: number;
    majorPageFault: number;
    swappedOut: number;
    fsRead: number;
    fsWrite: number;
    ipcSent: number;
    ipcReceived: number;
    signalsCount: number;
    voluntaryContextSwitches: number;
    involuntaryContextSwitches: number;
  }
}
