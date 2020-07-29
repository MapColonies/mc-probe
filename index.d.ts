interface ProbeConfig{
    liveness?: ()=> void;
    readiness?: ()=>void;
    timeout?: number;
    beforeShutdown?: () => void;
    onSignal?: () => void;
    onShutdown?: () => void;
    onSendFailureDuringShutdown?: () => void;
    logger?: (msg: string, err: Error) => void;
}

interface Logger {
    log: (level:string,msg:string)=> void;
}

export declare class Probe {
    constructor(logger:Logger,config:ProbeConfig);

    readyFlag: boolean;
    liveFlag: boolean;

    addError(err: unknown): void;
    start(app: unknown, port: number): Promise<void>;
    stop(): void;
    startNest(app: unknown, port: number): Promise<void>
}