import { LogFunctionFactory, Logger } from "graphile-worker";
import { Pool } from "pg";
import { loadYaml, PgComposeWorker, run } from "pg-compose";

import { config } from "../config";
import logger from "../logger";
import {
  exportCampaign,
  TASK_IDENTIFIER as exportCampaignIdentifier
} from "./tasks/export-campaign";
import {
  exportForVan,
  TASK_IDENTIFIER as exportForVanIdentifier
} from "./tasks/export-for-van";
import fetchVANActivistCodes from "./tasks/fetch-van-activist-codes";
import fetchVANResultCodes from "./tasks/fetch-van-result-codes";
import fetchVANSurveyQuestions from "./tasks/fetch-van-survey-questions";
import {
  filterLandlines,
  TASK_IDENTIFIER as filterLandlinesIdentifier
} from "./tasks/filter-landlines";
import handleAutoassignmentRequest from "./tasks/handle-autoassignment-request";
import handleDeliveryReport from "./tasks/handle-delivery-report";
import { releaseStaleReplies } from "./tasks/release-stale-replies";
import {
  syncCampaignContactToVAN,
  updateVanSyncStatuses
} from "./tasks/sync-campaign-contact-to-van";
import syncSlackTeamMembers from "./tasks/sync-slack-team-members";
import { trollPatrol, trollPatrolForOrganization } from "./tasks/troll-patrol";
import { wrapProgressTask } from "./tasks/utils";

const logFactory: LogFunctionFactory = (scope) => (level, message, meta) =>
  logger.log({ level, message, ...meta, ...scope });

const graphileLogger = new Logger(logFactory);

let worker: PgComposeWorker | undefined;
let workerSemaphore = false;

const poolConfig = {
  connectionString: config.DATABASE_URL,
  max: config.WORKER_MAX_POOL
};

const workerPool = new Pool(poolConfig);

export const getWorker = async (attempt = 0): Promise<PgComposeWorker> => {
  const m = await loadYaml({ include: `${__dirname}/pg-compose/**/*.yaml` });

  m.taskList!["handle-autoassignment-request"] = handleAutoassignmentRequest;
  m.taskList!["release-stale-replies"] = releaseStaleReplies;
  m.taskList!["handle-delivery-report"] = handleDeliveryReport;
  m.taskList!["troll-patrol"] = trollPatrol;
  m.taskList!["troll-patrol-for-org"] = trollPatrolForOrganization;
  m.taskList!["sync-slack-team-members"] = syncSlackTeamMembers;
  m.taskList!["van-get-survey-questions"] = fetchVANSurveyQuestions;
  m.taskList!["van-get-activist-codes"] = fetchVANActivistCodes;
  m.taskList!["van-get-result-codes"] = fetchVANResultCodes;
  m.taskList!["van-sync-campaign-contact"] = syncCampaignContactToVAN;
  m.taskList!["update-van-sync-statuses"] = updateVanSyncStatuses;
  m.taskList![exportCampaignIdentifier] = wrapProgressTask(exportCampaign, {
    removeOnComplete: true
  });
  m.taskList![exportForVanIdentifier] = wrapProgressTask(exportForVan, {
    removeOnComplete: true
  });
  m.taskList![filterLandlinesIdentifier] = wrapProgressTask(filterLandlines, {
    removeOnComplete: false
  });

  m.cronJobs!.push({
    name: "release-stale-replies",
    task_name: "release-stale-replies",
    pattern: "*/5 * * * *",
    time_zone: config.TZ
  });

  m.cronJobs!.push({
    name: "update-van-sync-statuses",
    task_name: "update-van-sync-statuses",
    pattern: "* * * * *",
    time_zone: config.TZ
  });

  if (config.SLACK_SYNC_CHANNELS) {
    if (config.SLACK_TOKEN) {
      m.cronJobs!.push({
        name: "sync-slack-team-members",
        task_name: "sync-slack-team-members",
        pattern: `*/10 * * * *`,
        time_zone: config.TZ
      });
    } else {
      logger.error(
        "Could not enable slack channel sync. No SLACK_TOKEN present."
      );
    }
  }

  if (config.ENABLE_TROLLBOT) {
    const jobInterval = config.TROLL_ALERT_PERIOD_MINUTES - 1;
    m.cronJobs!.push({
      name: "troll-patrol",
      task_name: "troll-patrol",
      pattern: `*/${jobInterval} * * * *`,
      time_zone: config.TZ
    });
  }

  if (!worker) {
    workerSemaphore = true;

    worker = await run(m, {
      pgPool: workerPool,
      encryptionSecret: config.SESSION_SECRET,
      concurrency: config.WORKER_CONCURRENCY,
      logger: graphileLogger,
      // Signals are handled by Terminus
      noHandleSignals: true,
      pollInterval: 1000
    });
  }

  // Someone beat us to the punch of initializing the runner
  else if (!worker && workerSemaphore) {
    if (attempt >= 20) throw new Error("getWorker() took too long to resolve");
    await new Promise((resolve, _reject) => setTimeout(() => resolve(), 100));
    return getWorker(attempt + 1);
  }

  return worker!;
};

export default getWorker;
