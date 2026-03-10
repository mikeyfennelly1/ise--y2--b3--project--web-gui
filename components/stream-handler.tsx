import type {TimeSeriesRecord} from "@/components/time-series-chart";
import {createLogger, Logger} from "@/lib/logger";
import {SetRecords} from "@/components/time-series-stream";

class StreamHandler {
    private readonly streamUrl: string;
    private readonly streamId: string;
    private es: EventSource;
    private dispatcher: SetRecords;
    private currentRecordSet: TimeSeriesRecord[];
    private logger: Logger;

    constructor(
        streamId: string,
        dispatcher: SetRecords
    ) {
        this.streamId = streamId;
        this.streamUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reporting/streams/${streamId}`;
        this.es = new EventSource(this.streamUrl);
        this.dispatcher = dispatcher;
        this.init();
        this.logger = createLogger("TimeSeriesStream");
        this.currentRecordSet = this.newMessageEventHandler();
    }

    private init(): void {
        this.initMsgCallback();
        this.initHistoryHandler();
        this.initUpdateCallback();
        this.initErrCallback();
    }

    private initErrCallback(): void {
        this.es.onerror = () => {
            logger.error(`SSE connection error for stream id=${this.streamId}`);
        }
    }

    private initUpdateCallback(): void {
        this.es.addEventListener("update", (event) => {
            this.logger.info(`SSE update event for stream id=${this.streamId}: ${event.data}`);
            try {
                const newRecord: TimeSeriesRecord = JSON.parse(event.data);
                this.logger.debug(`SSE update event: key=${newRecord.key} producer=${newRecord.producerName}`);
                const newRecordSet: TimeSeriesRecord[] = this.newRecordSet(this.currentRecordSet, newRecord);
                this.dispatcher.setRecords(newRecordSet);
            } catch (err) {
                this.logger.warn(`Failed to parse SSE update event: ${err}`);
            }
        })
    }

    private initHistoryHandler(): void {
        this.es.addEventListener("history", this.newMessageEventHandler)
    }

    private newMessageEventHandler() {
        return (rawMsgEvent: MessageEvent<string>): void => {
            this.logger.info(`SSE history event for stream id=${this.streamId}: ${rawMsgEvent.data}`)
            try {
                const batch: TimeSeriesRecord[] = JSON.parse(rawMsgEvent.data)
                this.logger.debug(`SSE history event: ${batch.length} records for stream id=${this.streamId}`)
                this.currentRecordSet = batch;
                this.dispatcher.setRecords(batch)
            } catch (err) {
                this.logger.warn(`Failed to parse SSE history event: ${err}`)
            }
        };
    }

    private initMsgCallback(): void {
        this.es.onmessage = (event) => {
            this.logger.info(`SSE message received for stream id=${this.streamId}: ${event.data}`)
        }
    }

    private newRecordSet(prev: TimeSeriesRecord[], newRecord: TimeSeriesRecord): TimeSeriesRecord[] {
        return [...prev, newRecord];
    }

}